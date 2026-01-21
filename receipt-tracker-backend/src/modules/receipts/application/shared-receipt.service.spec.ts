import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharedReceiptService } from './shared-receipt.service';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../entities/category.entity';

describe('SharedReceiptService', () => {
  let service: SharedReceiptService;
  let storeRepository: jest.Mocked<Repository<Store>>;
  let categoryRepository: jest.Mocked<Repository<Category>>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharedReceiptService,
        {
          provide: getRepositoryToken(Store),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SharedReceiptService>(SharedReceiptService);
    storeRepository = module.get(getRepositoryToken(Store));
    categoryRepository = module.get(getRepositoryToken(Category));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreateStore', () => {
    it('should return existing store if found', async () => {
      storeRepository.findOne.mockResolvedValue(mockStore);

      const result = await service.findOrCreateStore('Test Store');

      expect(storeRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Store' },
        relations: ['category'],
      });
      expect(storeRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockStore);
    });

    it('should create new store if not found', async () => {
      storeRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockStore);
      storeRepository.create.mockReturnValue(mockStore);
      storeRepository.save.mockResolvedValue(mockStore);

      const result = await service.findOrCreateStore(
        'New Store',
        '456 New St',
        '987-654-3210',
        'category-id',
      );

      expect(storeRepository.findOne).toHaveBeenCalled();
      expect(storeRepository.create).toHaveBeenCalledWith({
        name: 'New Store',
        address: '456 New St',
        phone: '987-654-3210',
        categoryId: 'category-id',
      });
      expect(storeRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockStore);
    });

    it('should update existing store if new info provided', async () => {
      const updatedStore: Store = {
        ...mockStore,
        address: 'Updated Address',
        phone: 'Updated Phone',
      };

      storeRepository.findOne.mockResolvedValueOnce(mockStore).mockResolvedValueOnce(updatedStore);
      storeRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.findOrCreateStore(
        'Test Store',
        'Updated Address',
        'Updated Phone',
        'category-id',
      );

      expect(storeRepository.update).toHaveBeenCalledWith(mockStore.id, {
        address: 'Updated Address',
        phone: 'Updated Phone',
        categoryId: 'category-id',
      });
      expect(result).toEqual(updatedStore);
    });

    it('should handle store creation when reload returns null', async () => {
      // First findOne: store not found
      // After save, second findOne: reload returns null but store from save is used
      storeRepository.findOne
        .mockResolvedValueOnce(null) // Initial check - not found
        .mockResolvedValueOnce(null); // Reload after save - returns null
      storeRepository.create.mockReturnValue(mockStore);
      storeRepository.save.mockResolvedValue(mockStore);

      const result = await service.findOrCreateStore('New Store');

      // Service should still return the store from save even if reload fails
      expect(result).toEqual(mockStore);
      expect(storeRepository.create).toHaveBeenCalled();
      expect(storeRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOrCreateCategory', () => {
    it('should return existing category if found', async () => {
      categoryRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOrCreateCategory('Groceries');

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Groceries' },
      });
      expect(categoryRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });

    it('should create new category if not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      categoryRepository.create.mockReturnValue(mockCategory);
      categoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.findOrCreateCategory('Electronics');

      expect(categoryRepository.findOne).toHaveBeenCalled();
      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: 'Electronics',
        description: null,
      });
      expect(categoryRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });
  });
});
