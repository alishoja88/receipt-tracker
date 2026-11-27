import { ExecutionContext, INestApplication, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { FindOperator } from 'typeorm';
import { JwtAuthGuard } from '../../auth/presentation';
import { ReceiptProcessingService } from '../../ai/application';
import { User } from '../../auth/entities/user.entity';
import {
  CreateReceiptService,
  DeleteReceiptService,
  GetReceiptsService,
  UpdateReceiptService,
} from '../application';
import { PaymentMethod, Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { ReceiptsModule } from '../receipts.module';

/**
 * Security test: no receipts endpoint may return or change another user's receipts.
 *
 * It wires the real controllers, services and ReceiptsRepository together and swaps only
 * the TypeORM repository for an in-memory one that holds receipts for two users. Every
 * request is made as Alice; Bob's receipts must never show up in a response or be changed.
 *
 * The route inventory check fails when an endpoint is added to the receipts module without
 * an isolation case here, so new endpoints (like the removed GET /receipts/debug/all) cannot
 * slip through untested.
 */

// Nest's FileTypeValidator loads the ESM-only `file-type` package through `load-esm`, which
// Jest (CommonJS) cannot import, so every upload would be rejected. Stand in for it with a
// check of the PNG magic bytes so the upload endpoint can be exercised.
jest.mock('load-esm', () => ({
  loadEsm: () =>
    Promise.resolve({
      fileTypeFromBuffer: (buffer: Buffer) =>
        Promise.resolve(
          buffer
            .subarray(0, 8)
            .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
            ? { ext: 'png', mime: 'image/png' }
            : undefined,
        ),
    }),
}));

type Where = Record<string, unknown>;

/** In-memory stand-in for the TypeORM Repository<Receipt> methods ReceiptsRepository uses. */
class InMemoryReceiptRepository {
  rows: Receipt[] = [];
  /** The `where` clause of every find/count call, to check queries are scoped to a user. */
  queries: Where[] = [];
  private nextId = 1;

  private matches(row: Receipt, where: Where = {}): boolean {
    return Object.entries(where).every(([key, expected]) => {
      const actual = row[key as keyof Receipt];
      if (expected instanceof FindOperator) {
        const operator = expected as FindOperator<unknown>;
        if (operator.type === 'between') {
          const [from, to] = operator.value as [Date, Date];
          const time = new Date(actual as Date).getTime();
          return time >= from.getTime() && time <= to.getTime();
        }
        if (operator.type === 'ilike') {
          const needle = String(operator.value).replace(/%/g, '').toLowerCase();
          return typeof actual === 'string' && actual.toLowerCase().includes(needle);
        }
        throw new Error(`Unsupported FindOperator in test fake: ${operator.type}`);
      }
      return actual === expected;
    });
  }

  find(options: { where?: Where; skip?: number; take?: number } = {}): Promise<Receipt[]> {
    this.queries.push(options.where ?? {});
    const found = this.rows.filter(row => this.matches(row, options.where));
    const start = options.skip ?? 0;
    const end = options.take === undefined ? undefined : start + options.take;
    return Promise.resolve(found.slice(start, end).map(row => ({ ...row })));
  }

  findOne(options: { where?: Where }): Promise<Receipt | null> {
    const row = this.rows.find(r => this.matches(r, options.where));
    return Promise.resolve(row ? { ...row } : null);
  }

  count(options: { where?: Where } = {}): Promise<number> {
    this.queries.push(options.where ?? {});
    return Promise.resolve(this.rows.filter(row => this.matches(row, options.where)).length);
  }

  save(receipt: Receipt): Promise<Receipt> {
    const now = new Date();
    const saved: Receipt = {
      ...receipt,
      id: receipt.id ?? `generated-${this.nextId++}`,
      createdAt: now,
      updatedAt: now,
    };
    this.rows.push(saved);
    return Promise.resolve({ ...saved });
  }

  update(where: Where, data: Partial<Receipt>): Promise<void> {
    this.rows = this.rows.map(row => (this.matches(row, where) ? { ...row, ...data } : row));
    return Promise.resolve();
  }

  delete(where: Where): Promise<void> {
    this.rows = this.rows.filter(row => !this.matches(row, where));
    return Promise.resolve();
  }
}

const ALICE = { userId: 'alice-user-id', email: 'alice@example.com' };
const BOB = { userId: 'bob-user-id', email: 'bob@example.com' };
const BOB_STORE = 'BOB SECRET STORE';

const makeReceipt = (id: string, userId: string, storeName: string): Receipt => ({
  id,
  userId,
  user: {} as User,
  storeName,
  receiptDate: new Date(2024, 0, 15),
  category: 'GROCERY',
  paymentMethod: PaymentMethod.CARD,
  subtotal: 90,
  tax: 10,
  total: 100,
  status: ReceiptStatus.COMPLETED,
  needsReview: false,
  rawOcrText: null,
  imageUrl: null,
  createdAt: new Date(2024, 0, 15),
  updatedAt: new Date(2024, 0, 15),
});

/** Smallest valid PNG, so the upload endpoint's file type check passes. */
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

/** Lists every route the receipts module registers, as "METHOD /path". */
function receiptsRoutes(): string[] {
  const controllers = Reflect.getMetadata('controllers', ReceiptsModule) as Array<
    new (...args: never[]) => object
  >;
  const routes: string[] = [];
  for (const controller of controllers) {
    const base = Reflect.getMetadata(PATH_METADATA, controller) as string;
    const prototype = controller.prototype as Record<string, unknown>;
    for (const name of Object.getOwnPropertyNames(prototype)) {
      const handler = prototype[name];
      if (name === 'constructor' || typeof handler !== 'function') continue;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined;
      if (method === undefined) continue;
      const path = Reflect.getMetadata(PATH_METADATA, handler) as string;
      const fullPath = ['/api', base, path]
        .filter(p => p && p !== '/')
        .join('/')
        .replace(/\/+/g, '/');
      routes.push(`${RequestMethod[method]} ${fullPath}`);
    }
  }
  return routes.sort();
}

describe('Receipts endpoints: user data isolation', () => {
  let app: INestApplication<App>;
  let store: InMemoryReceiptRepository;
  let logSpy: jest.SpyInstance;

  const bobReceiptIds = ['bob-receipt-1', 'bob-receipt-2'];

  const processReceiptImage = jest.fn(
    async (_buffer: Buffer, _mime: string, userId: string): Promise<Receipt[]> => [
      await store.save(makeReceipt(undefined as unknown as string, userId, 'Uploaded Store')),
    ],
  );

  /** Fails if the response body mentions any of Bob's data. */
  const expectNoBobData = (body: unknown) => {
    const text = JSON.stringify(body ?? null);
    for (const secret of [...bobReceiptIds, BOB.userId, BOB.email, BOB_STORE]) {
      expect(text).not.toContain(secret);
    }
  };

  const bobRowsUnchanged = () => {
    const bobRows = store.rows.filter(r => r.userId === BOB.userId);
    expect(bobRows).toHaveLength(bobReceiptIds.length);
    for (const row of bobRows) {
      expect(row.storeName).toBe(BOB_STORE);
      expect(row.total).toBe(100);
    }
  };

  /** One isolation case per route. Keys must match receiptsRoutes() exactly. */
  const cases: Record<string, () => Promise<void>> = {
    'GET /api/receipts': async () => {
      const all = await request(app.getHttpServer()).get('/api/receipts').expect(200);
      expectNoBobData(all.body);
      const body = all.body as { items: { id: string }[]; pagination: { totalItems: number } };
      expect(body.items.map(i => i.id).sort()).toEqual(['alice-receipt-1', 'alice-receipt-2']);
      // A list request must not read other users' rows, even for logging.
      expect(store.queries.length).toBeGreaterThan(0);
      for (const where of store.queries) {
        expect(where.userId).toBe(ALICE.userId);
      }
      expect(body.pagination.totalItems).toBe(2);

      // Filtering by Bob's store must not reach Bob's receipts either.
      const filtered = await request(app.getHttpServer())
        .get('/api/receipts')
        .query({ storeName: BOB_STORE, limit: 100 })
        .expect(200);
      expectNoBobData(filtered.body);
      expect((filtered.body as { items: unknown[] }).items).toEqual([]);
    },

    'GET /api/receipts/:id': async () => {
      for (const id of bobReceiptIds) {
        const res = await request(app.getHttpServer()).get(`/api/receipts/${id}`).expect(404);
        expect(JSON.stringify(res.body)).not.toContain(BOB_STORE);
      }
    },

    'PUT /api/receipts/:id': async () => {
      for (const id of bobReceiptIds) {
        const res = await request(app.getHttpServer())
          .put(`/api/receipts/${id}`)
          .send({ storeName: 'Hijacked', total: 1 })
          .expect(404);
        expect(JSON.stringify(res.body)).not.toContain(BOB_STORE);
      }
      bobRowsUnchanged();
    },

    'DELETE /api/receipts/:id': async () => {
      for (const id of bobReceiptIds) {
        const res = await request(app.getHttpServer()).delete(`/api/receipts/${id}`).expect(404);
        expect(JSON.stringify(res.body)).not.toContain(BOB_STORE);
      }
      bobRowsUnchanged();
    },

    'POST /api/receipts/create': async () => {
      const res = await request(app.getHttpServer())
        .post('/api/receipts/create')
        .send({ storeName: 'New Store', receiptDate: '2024-02-01', total: 42 })
        .expect(201);
      expectNoBobData(res.body);
      const created = store.rows.find(r => r.id === (res.body as { id: string }).id);
      expect(created?.userId).toBe(ALICE.userId);
      bobRowsUnchanged();
    },

    'POST /api/receipts': async () => {
      const res = await request(app.getHttpServer())
        .post('/api/receipts')
        .attach('file', PNG_1X1, { filename: 'receipt.png', contentType: 'image/png' })
        .expect(201);
      expectNoBobData(res.body);
      expect(processReceiptImage).toHaveBeenCalledWith(
        expect.any(Buffer),
        'image/png',
        ALICE.userId,
      );
      bobRowsUnchanged();
    },
  };

  beforeEach(async () => {
    // Controllers and the repository log heavily; keep test output readable.
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    processReceiptImage.mockClear();

    store = new InMemoryReceiptRepository();
    store.rows = [
      makeReceipt('alice-receipt-1', ALICE.userId, 'Alice Grocer'),
      makeReceipt('alice-receipt-2', ALICE.userId, 'Alice Pharmacy'),
      ...bobReceiptIds.map(id => makeReceipt(id, BOB.userId, BOB_STORE)),
    ];

    const controllers = Reflect.getMetadata('controllers', ReceiptsModule) as Array<
      new (...args: never[]) => object
    >;

    const moduleRef = await Test.createTestingModule({
      controllers,
      providers: [
        ReceiptsRepository,
        CreateReceiptService,
        GetReceiptsService,
        UpdateReceiptService,
        DeleteReceiptService,
        { provide: getRepositoryToken(Receipt), useValue: store },
        {
          provide: ReceiptProcessingService,
          useValue: {
            isAvailable: () => ({ available: true, ocr: true, llm: true }),
            processReceiptImage,
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest<{ user: typeof ALICE }>().user = ALICE;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    logSpy.mockRestore();
  });

  it('has an isolation case for every receipts endpoint', () => {
    expect(receiptsRoutes()).toEqual(Object.keys(cases).sort());
  });

  it('no longer exposes GET /api/receipts/debug/all', async () => {
    const res = await request(app.getHttpServer()).get('/api/receipts/debug/all');
    // Without the debug route, "debug" is not a route segment; Bob's data must not leak either way.
    expect(res.status).not.toBe(200);
    expectNoBobData(res.body);
  });

  it.each(Object.keys(cases))(
    "%s never returns or changes another user's receipts",
    async route => {
      await cases[route]();
      // Nor may it write another user's receipts to the logs.
      for (const call of logSpy.mock.calls) {
        expectNoBobData(call);
      }
    },
  );
});
