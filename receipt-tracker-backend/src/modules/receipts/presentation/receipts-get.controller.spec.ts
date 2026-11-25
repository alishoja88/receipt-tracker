import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReceiptsGetController } from './receipts-get.controller';
import { GetReceiptsService } from '../application/get-receipts.service';
import {
  ReceiptFilters,
  PaginationOptions,
  PaginatedResult,
} from '../infrastructure/persistence/receipts.repository';
import { Receipt, ReceiptStatus, PaymentMethod } from '../entities/receipt.entity';
import { User } from '../../auth/entities/user.entity';

describe('ReceiptsGetController', () => {
  let controller: ReceiptsGetController;
  let logSpy: jest.SpyInstance;

  const getAll = jest.fn<
    Promise<PaginatedResult<Receipt>>,
    [ReceiptFilters, PaginationOptions, string]
  >();
  const getById = jest.fn<Promise<Receipt>, [string, string]>();

  const user = { userId: 'user-id', email: 'test@example.com' };

  const mockReceipt: Receipt = {
    id: 'receipt-id',
    userId: 'user-id',
    user: {} as User,
    storeName: 'Test Store',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const pagination = {
    page: 1,
    limit: 20,
    totalItems: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    // The controller logs every request and response; keep test output readable.
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsGetController],
      providers: [{ provide: GetReceiptsService, useValue: { getAll, getById } }],
    }).compile();

    controller = module.get<ReceiptsGetController>(ReceiptsGetController);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReceipts', () => {
    it('should build filters and pagination from the query and pass the userId', async () => {
      getAll.mockResolvedValue({ items: [mockReceipt], pagination });

      await controller.getReceipts(
        user,
        '2',
        '10',
        '2024-01-01',
        '2024-01-31',
        'Test',
        ReceiptStatus.COMPLETED,
        'GROCERY',
        'CARD',
      );

      expect(getAll).toHaveBeenCalledWith(
        {
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31',
          storeName: 'Test',
          status: ReceiptStatus.COMPLETED,
          category: 'GROCERY',
          paymentMethod: 'CARD',
        },
        { page: 2, limit: 10 },
        'user-id',
      );
    });

    it('should leave filters and pagination empty when no query is given', async () => {
      getAll.mockResolvedValue({ items: [], pagination });

      await controller.getReceipts(user);

      expect(getAll).toHaveBeenCalledWith({}, {}, 'user-id');
    });

    it('should map every receipt to a list item and keep the pagination', async () => {
      getAll.mockResolvedValue({
        items: [mockReceipt, { ...mockReceipt, id: 'receipt-id-2' }],
        pagination,
      });

      const result = await controller.getReceipts(user);

      expect(result.pagination).toBe(pagination);
      expect(result.items).toEqual([
        {
          id: 'receipt-id',
          storeName: 'Test Store',
          receiptDate: '2024-01-15',
          total: 100,
          status: ReceiptStatus.COMPLETED,
          needsReview: false,
          createdAt: mockReceipt.createdAt,
          category: 'GROCERY',
          paymentMethod: PaymentMethod.CARD,
        },
        expect.objectContaining({ id: 'receipt-id-2' }) as unknown,
      ]);
    });
  });

  describe('getReceiptById', () => {
    it('should fetch the receipt for the current user and return the response dto', async () => {
      getById.mockResolvedValue(mockReceipt);

      const result = await controller.getReceiptById('receipt-id', user);

      expect(getById).toHaveBeenCalledWith('receipt-id', 'user-id');
      expect(result).toMatchObject({
        id: 'receipt-id',
        storeName: 'Test Store',
        receiptDate: '2024-01-15',
        subtotal: 90,
        tax: 10,
        total: 100,
      });
    });

    it('should propagate NotFoundException from the service', async () => {
      getById.mockRejectedValue(new NotFoundException('Receipt with ID receipt-id not found'));

      await expect(controller.getReceiptById('receipt-id', user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
