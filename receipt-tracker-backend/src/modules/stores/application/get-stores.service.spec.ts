import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetStoresService } from './get-stores.service';
import { StoresRepository } from '../infrastructure/persistence/stores.repository';
import { Store } from '../entities/store.entity';

describe('GetStoresService', () => {
  let service: GetStoresService;
  let storesRepository: jest.Mocked<StoresRepository>;

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
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStoresService,
        {
          provide: StoresRepository,
          useValue: mockStoresRepository,
        },
      ],
    }).compile();

    service = module.get<GetStoresService>(GetStoresService);
    storesRepository = module.get(StoresRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return paginated stores', async () => {
      const filters = { categoryId: 'category-id' };
      const pagination = { page: 1, limit: 20 };
      const mockResult = {
        items: [mockStore],
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      storesRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getAll(filters, pagination);

      expect(storesRepository.findAll).toHaveBeenCalledWith(filters, pagination);
      expect(result).toEqual(mockResult);
    });

    it('should return stores with default pagination', async () => {
      const mockResult = {
        items: [mockStore],
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      storesRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getAll();

      expect(storesRepository.findAll).toHaveBeenCalledWith({}, {});
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

      storesRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getAll();

      expect(result.items).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
    });
  });

  describe('getById', () => {
    it('should return store by id', async () => {
      storesRepository.findById.mockResolvedValue(mockStore);

      const result = await service.getById('store-id');

      expect(storesRepository.findById).toHaveBeenCalledWith('store-id');
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if store not found', async () => {
      storesRepository.findById.mockResolvedValue(null);

      await expect(service.getById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.getById('non-existent-id')).rejects.toThrow(
        'Store with ID non-existent-id not found',
      );
    });
  });
});
