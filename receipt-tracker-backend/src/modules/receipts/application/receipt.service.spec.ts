import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../entities/category.entity';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { ReceiptItem } from '../entities/receipt-item.entity';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';

describe('ReceiptService', () => {
  let service: ReceiptService;
  let receiptsRepository: jest.Mocked<ReceiptsRepository>;
  let storeRepository: any;
  let categoryRepository: any;

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

  const mockCategory: Category = {
    id: 'category-id',
    name: 'Groceries',
    description: 'Grocery items',
    stores: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReceipt: Receipt = {
    id: 'receipt-id',
    storeId: 'store-id',
    store: mockStore,
    receiptDate: new Date('2024-01-15'),
    currency: 'USD',
    subtotal: 90,
    tax: 10,
    total: 100,
    status: ReceiptStatus.COMPLETED,
    needsReview: false,
    rawOcrText: null,
    imageUrl: null,
    items: [
      {
        id: 'item-id',
        receiptId: 'receipt-id',
        receipt: {} as Receipt,
        name: 'Item 1',
        total: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockReceiptsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createItems: jest.fn(),
      deleteItemsByReceiptId: jest.fn(),
    };

    const mockStoreRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const mockCategoryRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptService,
        {
          provide: ReceiptsRepository,
          useValue: mockReceiptsRepository,
        },
        {
          provide: getRepositoryToken(Store),
          useValue: mockStoreRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<ReceiptService>(ReceiptService);
    receiptsRepository = module.get(ReceiptsRepository);
    storeRepository = module.get(getRepositoryToken(Store));
    categoryRepository = module.get(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReceipt', () => {
    const createDto: CreateReceiptDto = {
      storeName: 'Test Store',
      storeAddress: '123 Test St',
      storePhone: '123-456-7890',
      receiptDate: '2024-01-15',
      currency: 'USD',
      subtotal: 90,
      tax: 10,
      total: 100,
      items: [{ name: 'Item 1', total: 100 }],
    };

    it('should create a receipt successfully', async () => {
      // Mock store repository - store doesn't exist, will create
      storeRepository.findOne.mockResolvedValue(null);
      storeRepository.create.mockReturnValue(mockStore);
      storeRepository.save.mockResolvedValue(mockStore);
      storeRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockStore);

      // Mock receipt repository
      const savedReceipt = { ...mockReceipt, id: 'new-receipt-id' };
      receiptsRepository.create.mockResolvedValue(savedReceipt);
      receiptsRepository.createItems.mockResolvedValue(mockReceipt.items);
      receiptsRepository.findById.mockResolvedValue(mockReceipt);

      const result = await service.createReceipt(createDto);

      expect(storeRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Store' },
        relations: ['category'],
      });
      expect(receiptsRepository.create).toHaveBeenCalled();
      expect(receiptsRepository.createItems).toHaveBeenCalled();
      expect(receiptsRepository.findById).toHaveBeenCalledWith(savedReceipt.id);
      expect(result).toEqual(mockReceipt);
    });

    it('should create a receipt with category', async () => {
      const dtoWithCategory: CreateReceiptDto = {
        ...createDto,
        storeCategoryName: 'Groceries',
      };

      // Mock category repository
      categoryRepository.findOne.mockResolvedValue(null);
      categoryRepository.create.mockReturnValue(mockCategory);
      categoryRepository.save.mockResolvedValue(mockCategory);

      // Mock store repository
      storeRepository.findOne.mockResolvedValue(null);
      storeRepository.create.mockReturnValue({ ...mockStore, categoryId: 'category-id' });
      storeRepository.save.mockResolvedValue({ ...mockStore, categoryId: 'category-id' });
      storeRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        ...mockStore,
        category: mockCategory,
        categoryId: 'category-id',
      });

      // Mock receipt repository
      const savedReceipt = { ...mockReceipt, id: 'new-receipt-id' };
      receiptsRepository.create.mockResolvedValue(savedReceipt);
      receiptsRepository.createItems.mockResolvedValue(mockReceipt.items);
      receiptsRepository.findById.mockResolvedValue(mockReceipt);

      const result = await service.createReceipt(dtoWithCategory);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Groceries' },
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should use existing store if found', async () => {
      // Mock store repository - store exists
      storeRepository.findOne.mockResolvedValue(mockStore);

      // Mock receipt repository
      const savedReceipt = { ...mockReceipt, id: 'new-receipt-id' };
      receiptsRepository.create.mockResolvedValue(savedReceipt);
      receiptsRepository.createItems.mockResolvedValue(mockReceipt.items);
      receiptsRepository.findById.mockResolvedValue(mockReceipt);

      const result = await service.createReceipt(createDto);

      expect(storeRepository.findOne).toHaveBeenCalled();
      expect(storeRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockReceipt);
    });

    it('should throw BadRequestException if receipt creation fails', async () => {
      storeRepository.findOne.mockResolvedValue(mockStore);
      const savedReceipt = { ...mockReceipt, id: 'new-receipt-id' };
      receiptsRepository.create.mockResolvedValue(savedReceipt);
      receiptsRepository.createItems.mockResolvedValue(mockReceipt.items);
      receiptsRepository.findById.mockResolvedValue(null);

      await expect(service.createReceipt(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should create receipt without optional fields', async () => {
      const minimalDto: CreateReceiptDto = {
        storeName: 'Test Store',
        receiptDate: '2024-01-15',
        total: 100,
        items: [{ name: 'Item 1', total: 100 }],
      };

      storeRepository.findOne.mockResolvedValue(mockStore);
      const savedReceipt = {
        ...mockReceipt,
        id: 'new-receipt-id',
        currency: null,
        subtotal: null,
        tax: null,
      };
      receiptsRepository.create.mockResolvedValue(savedReceipt);
      receiptsRepository.createItems.mockResolvedValue(mockReceipt.items);
      receiptsRepository.findById.mockResolvedValue({
        ...mockReceipt,
        currency: null,
        subtotal: null,
        tax: null,
      });

      const result = await service.createReceipt(minimalDto);

      expect(result.currency).toBeNull();
      expect(result.subtotal).toBeNull();
      expect(result.tax).toBeNull();
    });

    it('should use existing category if found', async () => {
      const dtoWithCategory: CreateReceiptDto = {
        ...createDto,
        storeCategoryName: 'Groceries',
      };

      // Mock category repository - category exists
      categoryRepository.findOne.mockResolvedValue(mockCategory);

      // Mock store repository
      storeRepository.findOne.mockResolvedValue(null);
      storeRepository.create.mockReturnValue({ ...mockStore, categoryId: 'category-id' });
      storeRepository.save.mockResolvedValue({ ...mockStore, categoryId: 'category-id' });
      storeRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        ...mockStore,
        category: mockCategory,
        categoryId: 'category-id',
      });

      // Mock receipt repository
      const savedReceipt = { ...mockReceipt, id: 'new-receipt-id' };
      receiptsRepository.create.mockResolvedValue(savedReceipt);
      receiptsRepository.createItems.mockResolvedValue(mockReceipt.items);
      receiptsRepository.findById.mockResolvedValue(mockReceipt);

      await service.createReceipt(dtoWithCategory);

      expect(categoryRepository.findOne).toHaveBeenCalled();
      expect(categoryRepository.create).not.toHaveBeenCalled();
    });

    it('should update store info when store exists', async () => {
      const dtoWithNewInfo: CreateReceiptDto = {
        ...createDto,
        storeAddress: 'New Address',
        storePhone: '999-999-9999',
      };

      // Mock store repository - store exists but with different info
      const existingStore = { ...mockStore, address: 'Old Address', phone: '111-111-1111' };
      storeRepository.findOne.mockResolvedValue(existingStore);
      storeRepository.update.mockResolvedValue(undefined);
      storeRepository.findOne.mockResolvedValueOnce(existingStore).mockResolvedValueOnce({
        ...existingStore,
        address: 'New Address',
        phone: '999-999-9999',
      });

      // Mock receipt repository
      const savedReceipt = { ...mockReceipt, id: 'new-receipt-id' };
      receiptsRepository.create.mockResolvedValue(savedReceipt);
      receiptsRepository.createItems.mockResolvedValue(mockReceipt.items);
      receiptsRepository.findById.mockResolvedValue(mockReceipt);

      await service.createReceipt(dtoWithNewInfo);

      expect(storeRepository.update).toHaveBeenCalled();
    });
  });

  describe('getReceipts', () => {
    it('should return paginated receipts', async () => {
      const filters = { dateFrom: '2024-01-01', dateTo: '2024-01-31' };
      const pagination = { page: 1, limit: 20 };
      const mockResult = {
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

      receiptsRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getReceipts(filters, pagination);

      expect(receiptsRepository.findAll).toHaveBeenCalledWith(filters, pagination);
      expect(result).toEqual(mockResult);
    });

    it('should return receipts with default pagination', async () => {
      const mockResult = {
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

      receiptsRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getReceipts();

      expect(receiptsRepository.findAll).toHaveBeenCalledWith({}, {});
      expect(result).toEqual(mockResult);
    });

    it('should filter receipts by storeId', async () => {
      const filters = { storeId: 'store-id' };
      const mockResult = {
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

      receiptsRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getReceipts(filters);

      expect(receiptsRepository.findAll).toHaveBeenCalledWith(filters, {});
      expect(result).toEqual(mockResult);
    });

    it('should filter receipts by status', async () => {
      const filters = { status: ReceiptStatus.COMPLETED };
      const mockResult = {
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

      receiptsRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getReceipts(filters);

      expect(receiptsRepository.findAll).toHaveBeenCalledWith(filters, {});
      expect(result).toEqual(mockResult);
    });

    it('should handle empty results', async () => {
      const mockResult = {
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      receiptsRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getReceipts();

      expect(result.items).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
    });

    it('should handle pagination with multiple pages', async () => {
      const pagination = { page: 2, limit: 10 };
      const mockResult = {
        items: [mockReceipt],
        pagination: {
          page: 2,
          limit: 10,
          totalItems: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      };

      receiptsRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getReceipts({}, pagination);

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
      expect(result.pagination.page).toBe(2);
    });
  });

  describe('getReceiptById', () => {
    it('should return receipt by id', async () => {
      receiptsRepository.findById.mockResolvedValue(mockReceipt);

      const result = await service.getReceiptById('receipt-id');

      expect(receiptsRepository.findById).toHaveBeenCalledWith('receipt-id');
      expect(result).toEqual(mockReceipt);
    });

    it('should throw NotFoundException if receipt not found', async () => {
      receiptsRepository.findById.mockResolvedValue(null);

      await expect(service.getReceiptById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.getReceiptById('non-existent-id')).rejects.toThrow(
        'Receipt with ID non-existent-id not found',
      );
    });
  });

  describe('updateReceipt', () => {
    const updateDto: UpdateReceiptDto = {
      total: 150,
      items: [{ name: 'Updated Item', total: 150 }],
    };

    it('should update receipt successfully', async () => {
      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt) // First call - check exists
        .mockResolvedValueOnce(mockReceipt); // Second call - return updated

      storeRepository.findOne.mockResolvedValue(mockStore);
      receiptsRepository.update.mockResolvedValue(mockReceipt);
      receiptsRepository.deleteItemsByReceiptId.mockResolvedValue(undefined);
      receiptsRepository.createItems.mockResolvedValue([
        { ...mockReceipt.items[0], name: 'Updated Item', total: 150 },
      ]);

      const result = await service.updateReceipt('receipt-id', updateDto);

      expect(receiptsRepository.findById).toHaveBeenCalledTimes(2);
      expect(receiptsRepository.update).toHaveBeenCalled();
      expect(receiptsRepository.deleteItemsByReceiptId).toHaveBeenCalledWith('receipt-id');
      expect(receiptsRepository.createItems).toHaveBeenCalled();
      expect(result).toEqual(mockReceipt);
    });

    it('should throw NotFoundException if receipt not found', async () => {
      receiptsRepository.findById.mockResolvedValue(null);

      await expect(service.updateReceipt('non-existent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update store if storeName provided', async () => {
      const updateDtoWithStore: UpdateReceiptDto = {
        storeName: 'New Store Name',
        total: 150,
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce({ ...mockReceipt, store: { ...mockStore, name: 'New Store Name' } });

      storeRepository.findOne.mockResolvedValue(null);
      storeRepository.create.mockReturnValue({ ...mockStore, name: 'New Store Name' });
      storeRepository.save.mockResolvedValue({ ...mockStore, name: 'New Store Name' });
      storeRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        ...mockStore,
        name: 'New Store Name',
      });

      receiptsRepository.update.mockResolvedValue(mockReceipt);

      await service.updateReceipt('receipt-id', updateDtoWithStore);

      expect(storeRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'New Store Name' },
        relations: ['category'],
      });
    });

    it('should not update items if items not provided', async () => {
      const updateDtoWithoutItems: UpdateReceiptDto = {
        total: 150,
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce(mockReceipt);

      receiptsRepository.update.mockResolvedValue(mockReceipt);

      await service.updateReceipt('receipt-id', updateDtoWithoutItems);

      expect(receiptsRepository.deleteItemsByReceiptId).not.toHaveBeenCalled();
      expect(receiptsRepository.createItems).not.toHaveBeenCalled();
    });

    it('should update receipt with category', async () => {
      const updateDtoWithCategory: UpdateReceiptDto = {
        storeCategoryName: 'Electronics',
        total: 150,
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce(mockReceipt);

      categoryRepository.findOne.mockResolvedValue(null);
      categoryRepository.create.mockReturnValue({ ...mockCategory, name: 'Electronics' });
      categoryRepository.save.mockResolvedValue({ ...mockCategory, name: 'Electronics' });

      receiptsRepository.update.mockResolvedValue(mockReceipt);

      await service.updateReceipt('receipt-id', updateDtoWithCategory);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Electronics' },
      });
    });

    it('should update receipt with existing category', async () => {
      const updateDtoWithCategory: UpdateReceiptDto = {
        storeCategoryName: 'Groceries',
        total: 150,
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce(mockReceipt);

      categoryRepository.findOne.mockResolvedValue(mockCategory);

      receiptsRepository.update.mockResolvedValue(mockReceipt);

      await service.updateReceipt('receipt-id', updateDtoWithCategory);

      expect(categoryRepository.findOne).toHaveBeenCalled();
      expect(categoryRepository.create).not.toHaveBeenCalled();
    });

    it('should update only currency field', async () => {
      const updateDtoCurrency: UpdateReceiptDto = {
        currency: 'EUR',
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce({ ...mockReceipt, currency: 'EUR' });

      receiptsRepository.update.mockResolvedValue({ ...mockReceipt, currency: 'EUR' });

      const result = await service.updateReceipt('receipt-id', updateDtoCurrency);

      expect(receiptsRepository.update).toHaveBeenCalledWith(
        'receipt-id',
        expect.objectContaining({ currency: 'EUR' }),
      );
      expect(result.currency).toBe('EUR');
    });

    it('should update only receiptDate field', async () => {
      const updateDtoDate: UpdateReceiptDto = {
        receiptDate: '2024-02-20',
      };

      receiptsRepository.findById.mockResolvedValueOnce(mockReceipt).mockResolvedValueOnce({
        ...mockReceipt,
        receiptDate: new Date('2024-02-20'),
      });

      receiptsRepository.update.mockResolvedValue({
        ...mockReceipt,
        receiptDate: new Date('2024-02-20'),
      });

      const result = await service.updateReceipt('receipt-id', updateDtoDate);

      expect(receiptsRepository.update).toHaveBeenCalledWith(
        'receipt-id',
        expect.objectContaining({
          receiptDate: new Date('2024-02-20'),
        }),
      );
      expect(result.receiptDate).toEqual(new Date('2024-02-20'));
    });

    it('should update with empty items array', async () => {
      const updateDtoEmptyItems: UpdateReceiptDto = {
        items: [],
      };

      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt)
        .mockResolvedValueOnce({ ...mockReceipt, items: [] });

      receiptsRepository.update.mockResolvedValue(mockReceipt);
      receiptsRepository.deleteItemsByReceiptId.mockResolvedValue(undefined);
      receiptsRepository.createItems.mockResolvedValue([]);

      await service.updateReceipt('receipt-id', updateDtoEmptyItems);

      expect(receiptsRepository.deleteItemsByReceiptId).toHaveBeenCalledWith('receipt-id');
      expect(receiptsRepository.createItems).toHaveBeenCalledWith([]);
    });

    it('should update store info when store exists', async () => {
      const updateDtoWithStoreInfo: UpdateReceiptDto = {
        storeName: 'Test Store',
        storeAddress: 'Updated Address',
        storePhone: '999-999-9999',
        total: 150,
      };

      const existingStore = { ...mockStore, address: 'Old Address', phone: '111-111-1111' };
      receiptsRepository.findById
        .mockResolvedValueOnce({ ...mockReceipt, store: existingStore })
        .mockResolvedValueOnce({
          ...mockReceipt,
          store: { ...existingStore, address: 'Updated Address', phone: '999-999-9999' },
        });

      storeRepository.findOne.mockResolvedValue(existingStore);
      storeRepository.update.mockResolvedValue(undefined);
      storeRepository.findOne.mockResolvedValueOnce(existingStore).mockResolvedValueOnce({
        ...existingStore,
        address: 'Updated Address',
        phone: '999-999-9999',
      });

      receiptsRepository.update.mockResolvedValue(mockReceipt);

      await service.updateReceipt('receipt-id', updateDtoWithStoreInfo);

      expect(storeRepository.update).toHaveBeenCalled();
    });

    it('should update store with category', async () => {
      const updateDtoWithStoreAndCategory: UpdateReceiptDto = {
        storeName: 'New Store',
        storeCategoryName: 'Electronics',
        total: 150,
      };

      receiptsRepository.findById.mockResolvedValueOnce(mockReceipt).mockResolvedValueOnce({
        ...mockReceipt,
        store: { ...mockStore, name: 'New Store', category: mockCategory },
      });

      categoryRepository.findOne.mockResolvedValue(mockCategory);
      storeRepository.findOne.mockResolvedValue(null);
      storeRepository.create.mockReturnValue({
        ...mockStore,
        name: 'New Store',
        categoryId: 'category-id',
      });
      storeRepository.save.mockResolvedValue({
        ...mockStore,
        name: 'New Store',
        categoryId: 'category-id',
      });
      storeRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        ...mockStore,
        name: 'New Store',
        category: mockCategory,
        categoryId: 'category-id',
      });

      receiptsRepository.update.mockResolvedValue(mockReceipt);

      await service.updateReceipt('receipt-id', updateDtoWithStoreAndCategory);

      expect(categoryRepository.findOne).toHaveBeenCalled();
      expect(storeRepository.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if receipt not found after update', async () => {
      receiptsRepository.findById
        .mockResolvedValueOnce(mockReceipt) // First call - check exists
        .mockResolvedValueOnce(null); // Second call - not found after update

      receiptsRepository.update.mockResolvedValue(mockReceipt);

      await expect(service.updateReceipt('receipt-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateReceipt('receipt-id', updateDto)).rejects.toThrow(
        'Receipt with ID receipt-id not found after update',
      );
    });

    it('should update multiple fields at once', async () => {
      const updateDtoMultiple: UpdateReceiptDto = {
        currency: 'EUR',
        subtotal: 135,
        tax: 15,
        total: 150,
        receiptDate: '2024-02-20',
        items: [
          { name: 'Item 1', total: 100 },
          { name: 'Item 2', total: 50 },
        ],
      };

      receiptsRepository.findById.mockResolvedValueOnce(mockReceipt).mockResolvedValueOnce({
        ...mockReceipt,
        currency: 'EUR',
        subtotal: 135,
        tax: 15,
        total: 150,
        receiptDate: new Date('2024-02-20'),
      });

      receiptsRepository.update.mockResolvedValue(mockReceipt);
      receiptsRepository.deleteItemsByReceiptId.mockResolvedValue(undefined);
      receiptsRepository.createItems.mockResolvedValue([
        { ...mockReceipt.items[0], name: 'Item 1', total: 100 },
        { ...mockReceipt.items[0], name: 'Item 2', total: 50 },
      ]);

      const result = await service.updateReceipt('receipt-id', updateDtoMultiple);

      expect(receiptsRepository.update).toHaveBeenCalledWith(
        'receipt-id',
        expect.objectContaining({
          currency: 'EUR',
          subtotal: 135,
          tax: 15,
          total: 150,
          receiptDate: new Date('2024-02-20'),
        }),
      );
      expect(receiptsRepository.createItems).toHaveBeenCalled();
    });
  });

  describe('deleteReceipt', () => {
    it('should delete receipt successfully', async () => {
      receiptsRepository.findById.mockResolvedValue(mockReceipt);
      receiptsRepository.delete.mockResolvedValue(undefined);

      await service.deleteReceipt('receipt-id');

      expect(receiptsRepository.findById).toHaveBeenCalledWith('receipt-id');
      expect(receiptsRepository.delete).toHaveBeenCalledWith('receipt-id');
    });

    it('should throw NotFoundException if receipt not found', async () => {
      receiptsRepository.findById.mockResolvedValue(null);

      await expect(service.deleteReceipt('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.deleteReceipt('non-existent-id')).rejects.toThrow(
        'Receipt with ID non-existent-id not found',
      );
    });
  });
});
