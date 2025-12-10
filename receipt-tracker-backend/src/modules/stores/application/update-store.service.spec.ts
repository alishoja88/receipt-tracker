import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateStoreService } from './update-store.service';
import { StoresRepository } from '../infrastructure/persistence/stores.repository';
import { SharedStoreService } from './shared-store.service';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { Store } from '../entities/store.entity';
import { Category } from '../../receipts/entities/category.entity';

describe('UpdateStoreService', () => {
  let service: UpdateStoreService;
  let storesRepository: jest.Mocked<StoresRepository>;
  let sharedStoreService: jest.Mocked<SharedStoreService>;

  const mockCategory: Category = {
    id: 'category-id',
    name: 'Groceries',
    description: 'Grocery items',
    stores: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  beforeEach(async () => {
    const mockStoresRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockSharedStoreService = {
      findOrCreateCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStoreService,
        {
          provide: StoresRepository,
          useValue: mockStoresRepository,
        },
        {
          provide: SharedStoreService,
          useValue: mockSharedStoreService,
        },
      ],
    }).compile();

    service = module.get<UpdateStoreService>(UpdateStoreService);
    storesRepository = module.get(StoresRepository);
    sharedStoreService = module.get(SharedStoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const updateDto: UpdateStoreDto = {
      name: 'Updated Store',
      address: 'New Address',
    };

    it('should update store successfully', async () => {
      storesRepository.findById.mockResolvedValue(mockStore);
      storesRepository.update.mockResolvedValue({
        ...mockStore,
        name: 'Updated Store',
        address: 'New Address',
      });

      const result = await service.execute('store-id', updateDto);

      expect(storesRepository.findById).toHaveBeenCalledWith('store-id');
      expect(storesRepository.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated Store');
    });

    it('should throw NotFoundException if store not found', async () => {
      storesRepository.findById.mockResolvedValue(null);

      await expect(service.execute('non-existent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update store with category', async () => {
      const updateDtoWithCategory: UpdateStoreDto = {
        categoryName: 'Electronics',
      };

      storesRepository.findById.mockResolvedValue(mockStore);
      sharedStoreService.findOrCreateCategory.mockResolvedValue({
        ...mockCategory,
        name: 'Electronics',
      });
      storesRepository.update.mockResolvedValue({
        ...mockStore,
        categoryId: 'category-id',
      });

      await service.execute('store-id', updateDtoWithCategory);

      expect(sharedStoreService.findOrCreateCategory).toHaveBeenCalledWith('Electronics');
    });

    it('should handle partial updates', async () => {
      const partialDto: UpdateStoreDto = {
        phone: '999-999-9999',
      };

      storesRepository.findById.mockResolvedValue(mockStore);
      storesRepository.update.mockResolvedValue({
        ...mockStore,
        phone: '999-999-9999',
      });

      const result = await service.execute('store-id', partialDto);

      expect(result.phone).toBe('999-999-9999');
    });
  });
});
