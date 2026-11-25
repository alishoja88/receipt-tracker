import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetReceiptsService } from './get-receipts.service';
import {
  ReceiptsRepository,
  ReceiptFilters,
  PaginationOptions,
  PaginatedResult,
} from '../infrastructure/persistence/receipts.repository';
import { Receipt, ReceiptStatus, PaymentMethod } from '../entities/receipt.entity';
import { User } from '../../auth/entities/user.entity';

describe('GetReceiptsService', () => {
  let service: GetReceiptsService;

  const findAll = jest.fn<
    Promise<PaginatedResult<Receipt>>,
    [ReceiptFilters, PaginationOptions, string]
  >();
  const findById = jest.fn<Promise<Receipt | null>, [string, string?]>();

  const userId = 'user-id';

  const mockReceipt: Receipt = {
    id: 'receipt-id',
    userId,
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

  const mockPaginatedResult: PaginatedResult<Receipt> = {
    items: [mockReceipt],
    pagination: {
      page: 1,
      limit: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetReceiptsService,
        { provide: ReceiptsRepository, useValue: { findAll, findById } },
      ],
    }).compile();

    service = module.get<GetReceiptsService>(GetReceiptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should pass filters, pagination and userId to the repository', async () => {
      const filters: ReceiptFilters = { storeName: 'Test', status: ReceiptStatus.COMPLETED };
      const pagination: PaginationOptions = { page: 2, limit: 10 };
      findAll.mockResolvedValue(mockPaginatedResult);

      const result = await service.getAll(filters, pagination, userId);

      expect(findAll).toHaveBeenCalledWith(filters, pagination, userId);
      expect(result).toBe(mockPaginatedResult);
    });
  });

  describe('getById', () => {
    it('should return the user receipt by id', async () => {
      findById.mockResolvedValue(mockReceipt);

      const result = await service.getById('receipt-id', userId);

      expect(findById).toHaveBeenCalledWith('receipt-id', userId);
      expect(result).toBe(mockReceipt);
    });

    it('should throw NotFoundException if the receipt is not found', async () => {
      findById.mockResolvedValue(null);

      await expect(service.getById('missing-id', userId)).rejects.toThrow(
        new NotFoundException('Receipt with ID missing-id not found'),
      );
    });
  });
});
