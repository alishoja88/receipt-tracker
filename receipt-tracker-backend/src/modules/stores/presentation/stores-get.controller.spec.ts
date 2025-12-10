import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StoresGetController } from './stores-get.controller';
import { GetStoresService } from '../application/get-stores.service';
import { StoreMapper } from './store-mapper.helper';
import { Store } from '../entities/store.entity';

// Mock StoreMapper
jest.mock('./store-mapper.helper', () => ({
  StoreMapper: {
    toResponseDto: jest.fn(),
    toListItemDto: jest.fn(),
  },
}));

describe('StoresGetController', () => {
  let controller: StoresGetController;
  let service: GetStoresService;

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

  const mockResponseDto = {
    id: 'store-id',
    name: 'Test Store',
    address: '123 Test St',
    phone: '123-456-7890',
    category: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockListItemDto = {
    id: 'store-id',
    name: 'Test Store',
    address: '123 Test St',
    phone: '123-456-7890',
    category: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresGetController],
      providers: [
        {
          provide: GetStoresService,
          useValue: {
            getAll: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StoresGetController>(StoresGetController);
    service = module.get<GetStoresService>(GetStoresService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStores', () => {
    it('should call service.getAll with correct filters and pagination', async () => {
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

      (service.getAll as jest.Mock).mockResolvedValue(mockResult);
      (StoreMapper.toListItemDto as jest.Mock).mockReturnValue(mockListItemDto);

      const result = await controller.getStores('1', '20', 'category-id', 'Test');

      expect(service.getAll).toHaveBeenCalledWith(
        {
          categoryId: 'category-id',
          name: 'Test',
        },
        {
          page: 1,
          limit: 20,
        },
      );
      expect(StoreMapper.toListItemDto).toHaveBeenCalledWith(mockStore);
      expect(result.items).toHaveLength(1);
    });

    it('should handle optional query parameters', async () => {
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

      (service.getAll as jest.Mock).mockResolvedValue(mockResult);
      (StoreMapper.toListItemDto as jest.Mock).mockReturnValue(mockListItemDto);

      const result = await controller.getStores();

      expect(service.getAll).toHaveBeenCalledWith({}, {});
      expect(result.items).toHaveLength(1);
    });
  });

  describe('getStoreById', () => {
    it('should call service.getById with correct id and return mapped result', async () => {
      (service.getById as jest.Mock).mockResolvedValue(mockStore);
      (StoreMapper.toResponseDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await controller.getStoreById('store-id');

      expect(service.getById).toHaveBeenCalledWith('store-id');
      expect(StoreMapper.toResponseDto).toHaveBeenCalledWith(mockStore);
      expect(result).toEqual(mockResponseDto);
    });

    it('should throw NotFoundException if store not found', async () => {
      const error = new NotFoundException('Store with ID store-id not found');
      (service.getById as jest.Mock).mockRejectedValue(error);

      await expect(controller.getStoreById('store-id')).rejects.toThrow(NotFoundException);
      expect(StoreMapper.toResponseDto).not.toHaveBeenCalled();
    });
  });
});
