import { Test, TestingModule } from '@nestjs/testing';
import { CreateStoreService } from './create-store.service';
import { StoresRepository } from '../infrastructure/persistence/stores.repository';
import { SharedStoreService } from './shared-store.service';
import { CreateStoreDto } from '../dto/create-store.dto';
import { Store } from '../entities/store.entity';
import { Category } from '../../receipts/entities/category.entity';

describe('CreateStoreService', () => {
  let service: CreateStoreService;
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
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockSharedStoreService = {
      findOrCreateCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateStoreService,
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

    service = module.get<CreateStoreService>(CreateStoreService);
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
    const createDto: CreateStoreDto = {
      name: 'Test Store',
      address: '123 Test St',
      phone: '123-456-7890',
    };

    it('should create a new store successfully', async () => {
      storesRepository.findByName.mockResolvedValue(null);
      storesRepository.create.mockResolvedValue(mockStore);

      const result = await service.execute(createDto);

      expect(storesRepository.findByName).toHaveBeenCalledWith('Test Store');
      expect(storesRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockStore);
    });

    it('should create store with category', async () => {
      const dtoWithCategory: CreateStoreDto = {
        ...createDto,
        categoryName: 'Groceries',
      };

      sharedStoreService.findOrCreateCategory.mockResolvedValue(mockCategory);
      storesRepository.findByName.mockResolvedValue(null);
      storesRepository.create.mockResolvedValue({
        ...mockStore,
        categoryId: 'category-id',
        category: mockCategory,
      });

      const result = await service.execute(dtoWithCategory);

      expect(sharedStoreService.findOrCreateCategory).toHaveBeenCalledWith('Groceries');
      expect(result.categoryId).toBe('category-id');
    });

    it('should return existing store if found with same info', async () => {
      const existingStore = { ...mockStore };
      storesRepository.findByName.mockResolvedValue(existingStore);

      // Use DTO with only name (no address/phone to trigger update)
      const dtoWithOnlyName: CreateStoreDto = {
        name: 'Test Store',
      };

      const result = await service.execute(dtoWithOnlyName);

      expect(storesRepository.findByName).toHaveBeenCalledWith('Test Store');
      expect(storesRepository.create).not.toHaveBeenCalled();
      expect(storesRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(existingStore);
    });

    it('should update existing store if new info provided', async () => {
      const existingStore = { ...mockStore, address: 'Old Address' };
      const updatedStore = { ...mockStore, address: 'New Address' };

      storesRepository.findByName.mockResolvedValue(existingStore);
      storesRepository.update.mockResolvedValue(updatedStore);

      const dtoWithNewInfo: CreateStoreDto = {
        ...createDto,
        address: 'New Address',
      };

      const result = await service.execute(dtoWithNewInfo);

      expect(storesRepository.update).toHaveBeenCalled();
      expect(result).toEqual(updatedStore);
    });

    it('should create store without optional fields', async () => {
      const minimalDto: CreateStoreDto = {
        name: 'Test Store',
      };

      storesRepository.findByName.mockResolvedValue(null);
      storesRepository.create.mockResolvedValue({
        ...mockStore,
        address: null,
        phone: null,
      });

      const result = await service.execute(minimalDto);

      expect(result.address).toBeNull();
      expect(result.phone).toBeNull();
    });
  });
});
