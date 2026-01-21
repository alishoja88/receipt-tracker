import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetReceiptsService } from './get-receipts.service';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { Store } from '../../stores/entities/store.entity';

describe('GetReceiptsService', () => {
  let service: GetReceiptsService;
  let receiptsRepository: jest.Mocked<ReceiptsRepository>;

  const mockStore: Store = {
    id: 'store-id',
    name: 'Test Store',
    address: '123 Test St',
    phone: '123-456-7890',
    categoryId: null,
    category: null,
    receipts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReceipt: Receipt = {
    id: 'receipt-id',
    storeId: 'store-id',
    store: mockStore,
    receiptDate: new Date('2024-01-15'),
    category: null,
    paymentMethod: null,
    cardType: null,
    cardLast4Digits: null,
    subtotal: 90,
    tax: 10,
    total: 100,
    status: ReceiptStatus.COMPLETED,
    needsReview: false,
    rawOcrText: null,
    imageUrl: null,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResult = {
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetReceiptsService,
        {
          provide: ReceiptsRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GetReceiptsService>(GetReceiptsService);
    receiptsRepository = module.get(ReceiptsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return paginated receipts', async () => {
      receiptsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await service.getAll();

      expect(receiptsRepository.findAll).toHaveBeenCalledWith({}, {});
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should pass filters and pagination to repository', async () => {
      const filters = { storeId: 'store-id', status: ReceiptStatus.COMPLETED };
      const pagination = { page: 2, limit: 10 };

      receiptsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      await service.getAll(filters, pagination);

      expect(receiptsRepository.findAll).toHaveBeenCalledWith(filters, pagination);
    });
  });

  describe('getById', () => {
    it('should return receipt by id', async () => {
      receiptsRepository.findById.mockResolvedValue(mockReceipt);

      const result = await service.getById('receipt-id');

      expect(receiptsRepository.findById).toHaveBeenCalledWith('receipt-id');
      expect(result).toEqual(mockReceipt);
    });

    it('should throw NotFoundException if receipt not found', async () => {
      receiptsRepository.findById.mockResolvedValue(null);

      await expect(service.getById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.getById('non-existent-id')).rejects.toThrow(
        'Receipt with ID non-existent-id not found',
      );
    });
  });
});
