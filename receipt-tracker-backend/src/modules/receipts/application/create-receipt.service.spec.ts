import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateReceiptService } from './create-receipt.service';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { SharedReceiptService } from './shared-receipt.service';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../entities/category.entity';

describe('CreateReceiptService', () => {
  let service: CreateReceiptService;
  let receiptsRepository: jest.Mocked<ReceiptsRepository>;
  let sharedReceiptService: jest.Mocked<SharedReceiptService>;

  const mockCategory: Category = {
    id: 'category-id',
    name: 'Groceries',
    description: null,
    stores: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStore: Store = {
    id: 'store-id',
    name: 'Test Store',
    address: '123 Test St',
    phone: '123-456-7890',
    categoryId: 'category-id',
    category: mockCategory,
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

  const mockCreateReceiptDto: CreateReceiptDto = {
    storeName: 'Test Store',
    storeAddress: '123 Test St',
    storePhone: '123-456-7890',
    storeCategoryName: 'Groceries',
    receiptDate: '2024-01-15',
    subtotal: 90,
    tax: 10,
    total: 100,
    items: [
      { name: 'Item 1', total: 50 },
      { name: 'Item 2', total: 50 },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReceiptService,
        {
          provide: ReceiptsRepository,
          useValue: {
            create: jest.fn(),
            createItems: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: SharedReceiptService,
          useValue: {
            findOrCreateCategory: jest.fn(),
            findOrCreateStore: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateReceiptService>(CreateReceiptService);
    receiptsRepository = module.get(ReceiptsRepository);
    sharedReceiptService = module.get(SharedReceiptService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should create a receipt successfully', async () => {
      sharedReceiptService.findOrCreateCategory.mockResolvedValue(mockCategory);
      sharedReceiptService.findOrCreateStore.mockResolvedValue(mockStore);
      receiptsRepository.create.mockResolvedValue(mockReceipt);
      receiptsRepository.createItems.mockResolvedValue([]);
      receiptsRepository.findById.mockResolvedValue({
        ...mockReceipt,
        items: [],
      });

      const result = await service.execute(mockCreateReceiptDto);

      expect(sharedReceiptService.findOrCreateCategory).toHaveBeenCalledWith('Groceries');
      expect(sharedReceiptService.findOrCreateStore).toHaveBeenCalledWith(
        'Test Store',
        '123 Test St',
        '123-456-7890',
        'category-id',
      );
      expect(receiptsRepository.create).toHaveBeenCalled();
      expect(receiptsRepository.createItems).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.storeId).toBe('store-id');
    });

    it('should create receipt without category if not provided', async () => {
      const dtoWithoutCategory = { ...mockCreateReceiptDto };
      delete dtoWithoutCategory.storeCategoryName;

      sharedReceiptService.findOrCreateStore.mockResolvedValue(mockStore);
      receiptsRepository.create.mockResolvedValue(mockReceipt);
      receiptsRepository.createItems.mockResolvedValue([]);
      receiptsRepository.findById.mockResolvedValue({
        ...mockReceipt,
        items: [],
      });

      await service.execute(dtoWithoutCategory);

      expect(sharedReceiptService.findOrCreateCategory).not.toHaveBeenCalled();
      expect(sharedReceiptService.findOrCreateStore).toHaveBeenCalledWith(
        'Test Store',
        '123 Test St',
        '123-456-7890',
        null,
      );
    });

    it('should throw BadRequestException if receipt not found after creation', async () => {
      sharedReceiptService.findOrCreateCategory.mockResolvedValue(mockCategory);
      sharedReceiptService.findOrCreateStore.mockResolvedValue(mockStore);
      receiptsRepository.create.mockResolvedValue(mockReceipt);
      receiptsRepository.createItems.mockResolvedValue([]);
      receiptsRepository.findById.mockResolvedValue(null);

      await expect(service.execute(mockCreateReceiptDto)).rejects.toThrow(BadRequestException);
      await expect(service.execute(mockCreateReceiptDto)).rejects.toThrow(
        'Failed to create receipt',
      );
    });

    it('should handle optional subtotal and tax', async () => {
      const dtoWithoutSubtotal = {
        ...mockCreateReceiptDto,
        subtotal: undefined,
        tax: undefined,
      };

      sharedReceiptService.findOrCreateCategory.mockResolvedValue(mockCategory);
      sharedReceiptService.findOrCreateStore.mockResolvedValue(mockStore);
      receiptsRepository.create.mockResolvedValue(mockReceipt);
      receiptsRepository.createItems.mockResolvedValue([]);
      receiptsRepository.findById.mockResolvedValue({
        ...mockReceipt,
        items: [],
      });

      await service.execute(dtoWithoutSubtotal);

      expect(receiptsRepository.create).toHaveBeenCalled();
      const createdReceipt = receiptsRepository.create.mock.calls[0][0];
      expect(createdReceipt.subtotal).toBeNull();
      expect(createdReceipt.tax).toBeNull();
    });
  });
});
