import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateReceiptService } from './update-receipt.service';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { SharedReceiptService } from './shared-receipt.service';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../entities/category.entity';

describe('UpdateReceiptService', () => {
  let service: UpdateReceiptService;
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateReceiptService,
        {
          provide: ReceiptsRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            deleteItemsByReceiptId: jest.fn(),
            createItems: jest.fn(),
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

    service = module.get<UpdateReceiptService>(UpdateReceiptService);
    receiptsRepository = module.get(ReceiptsRepository);
    sharedReceiptService = module.get(SharedReceiptService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should update receipt successfully', async () => {
      const updateDto: UpdateReceiptDto = {
        receiptDate: '2024-01-20',
        subtotal: 100,
        tax: 10,
        total: 110,
      };

      const updatedReceipt = {
        ...mockReceipt,
        receiptDate: new Date(updateDto.receiptDate!),
        subtotal: updateDto.subtotal ?? null,
        tax: updateDto.tax ?? null,
        total: updateDto.total ?? mockReceipt.total,
      };
      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce(updatedReceipt);
      receiptsRepository.update.mockResolvedValue(updatedReceipt);
      receiptsRepository.deleteItemsByReceiptId.mockResolvedValue(undefined);
      receiptsRepository.createItems.mockResolvedValue([]);

      const result = await service.execute('receipt-id', updateDto);

      expect(receiptsRepository.findById).toHaveBeenCalledWith('receipt-id');
      expect(receiptsRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if receipt not found', async () => {
      const updateDto: UpdateReceiptDto = {
        total: 110,
      };

      receiptsRepository.findById.mockResolvedValue(null);

      await expect(service.execute('non-existent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update store if storeName provided', async () => {
      const newStore: Store = {
        ...mockStore,
        id: 'new-store-id',
        name: 'New Store',
      };

      const updateDto: UpdateReceiptDto = {
        storeName: 'New Store',
        total: 110,
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce({ ...mockReceipt, store: newStore });
      sharedReceiptService.findOrCreateStore.mockResolvedValue(newStore);
      receiptsRepository.update.mockResolvedValue({ ...mockReceipt, store: newStore });
      receiptsRepository.deleteItemsByReceiptId.mockResolvedValue(undefined);
      receiptsRepository.createItems.mockResolvedValue([]);

      await service.execute('receipt-id', updateDto);

      expect(sharedReceiptService.findOrCreateStore).toHaveBeenCalled();
    });

    it('should update items if provided', async () => {
      const updateDto: UpdateReceiptDto = {
        total: 110,
        items: [
          { name: 'New Item 1', total: 60 },
          { name: 'New Item 2', total: 50 },
        ],
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce({ ...mockReceipt, items: [] });
      receiptsRepository.update.mockResolvedValue(mockReceipt);
      receiptsRepository.deleteItemsByReceiptId.mockResolvedValue(undefined);
      receiptsRepository.createItems.mockResolvedValue([]);

      await service.execute('receipt-id', updateDto);

      expect(receiptsRepository.deleteItemsByReceiptId).toHaveBeenCalledWith('receipt-id');
      expect(receiptsRepository.createItems).toHaveBeenCalled();
    });

    it('should handle empty items array', async () => {
      const updateDto: UpdateReceiptDto = {
        total: 110,
        items: [],
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce({ ...mockReceipt, items: [] });
      receiptsRepository.update.mockResolvedValue(mockReceipt);
      receiptsRepository.deleteItemsByReceiptId.mockResolvedValue(undefined);

      await service.execute('receipt-id', updateDto);

      expect(receiptsRepository.deleteItemsByReceiptId).toHaveBeenCalled();
      expect(receiptsRepository.createItems).not.toHaveBeenCalled();
    });

    it('should handle category update', async () => {
      const updateDto: UpdateReceiptDto = {
        storeCategoryName: 'Electronics',
        total: 110,
      };

      const newCategory: Category = {
        id: 'new-category-id',
        name: 'Electronics',
        description: null,
        stores: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce(mockReceipt);
      sharedReceiptService.findOrCreateCategory.mockResolvedValue(newCategory);
      sharedReceiptService.findOrCreateStore.mockResolvedValue(mockStore);
      receiptsRepository.update.mockResolvedValue(mockReceipt);
      receiptsRepository.deleteItemsByReceiptId.mockResolvedValue(undefined);
      receiptsRepository.createItems.mockResolvedValue([]);

      await service.execute('receipt-id', updateDto);

      expect(sharedReceiptService.findOrCreateCategory).toHaveBeenCalledWith('Electronics');
    });

    it('should throw NotFoundException if receipt not found after update', async () => {
      const updateDto: UpdateReceiptDto = {
        total: 110,
      };

      receiptsRepository.findById.mockResolvedValueOnce(mockReceipt).mockResolvedValueOnce(null);
      receiptsRepository.update.mockResolvedValue(mockReceipt);
      receiptsRepository.deleteItemsByReceiptId.mockResolvedValue(undefined);
      receiptsRepository.createItems.mockResolvedValue([]);

      await expect(service.execute('receipt-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });
});
