import { Test, TestingModule } from '@nestjs/testing';
import { StoresPostController } from './stores-post.controller';
import { CreateStoreService } from '../application/create-store.service';
import { StoreMapper } from './store-mapper.helper';
import { CreateStoreDto } from '../dto/create-store.dto';
import { Store } from '../entities/store.entity';

// Mock StoreMapper
jest.mock('./store-mapper.helper', () => ({
  StoreMapper: {
    toResponseDto: jest.fn(),
  },
}));

describe('StoresPostController', () => {
  let controller: StoresPostController;
  let service: CreateStoreService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresPostController],
      providers: [
        {
          provide: CreateStoreService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StoresPostController>(StoresPostController);
    service = module.get<CreateStoreService>(CreateStoreService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createStore', () => {
    const createDto: CreateStoreDto = {
      name: 'Test Store',
      address: '123 Test St',
      phone: '123-456-7890',
    };

    it('should call service.execute with correct dto and return mapped result', async () => {
      (service.execute as jest.Mock).mockResolvedValue(mockStore);
      (StoreMapper.toResponseDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await controller.createStore(createDto);

      expect(service.execute).toHaveBeenCalledWith(createDto);
      expect(StoreMapper.toResponseDto).toHaveBeenCalledWith(mockStore);
      expect(result).toEqual(mockResponseDto);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.createStore(createDto)).rejects.toThrow(error);
    });
  });
});
