import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StoresPutController } from './stores-put.controller';
import { UpdateStoreService } from '../application/update-store.service';
import { StoreMapper } from './store-mapper.helper';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { Store } from '../entities/store.entity';

// Mock StoreMapper
jest.mock('./store-mapper.helper', () => ({
  StoreMapper: {
    toResponseDto: jest.fn(),
  },
}));

describe('StoresPutController', () => {
  let controller: StoresPutController;
  let service: UpdateStoreService;

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
    name: 'Updated Store',
    address: 'New Address',
    phone: '999-999-9999',
    category: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresPutController],
      providers: [
        {
          provide: UpdateStoreService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StoresPutController>(StoresPutController);
    service = module.get<UpdateStoreService>(UpdateStoreService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateStore', () => {
    const updateDto: UpdateStoreDto = {
      name: 'Updated Store',
      address: 'New Address',
    };

    it('should call service.execute with correct id and dto and return mapped result', async () => {
      const updatedStore = { ...mockStore, name: 'Updated Store' };
      (service.execute as jest.Mock).mockResolvedValue(updatedStore);
      (StoreMapper.toResponseDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await controller.updateStore('store-id', updateDto);

      expect(service.execute).toHaveBeenCalledWith('store-id', updateDto);
      expect(StoreMapper.toResponseDto).toHaveBeenCalledWith(updatedStore);
      expect(result).toEqual(mockResponseDto);
    });

    it('should handle partial updates', async () => {
      const partialDto: UpdateStoreDto = {
        phone: '999-999-9999',
      };
      const updatedStore = { ...mockStore, phone: '999-999-9999' };
      (service.execute as jest.Mock).mockResolvedValue(updatedStore);
      (StoreMapper.toResponseDto as jest.Mock).mockReturnValue({
        ...mockResponseDto,
        phone: '999-999-9999',
      });

      const result = await controller.updateStore('store-id', partialDto);

      expect(service.execute).toHaveBeenCalledWith('store-id', partialDto);
      expect(result.phone).toBe('999-999-9999');
    });

    it('should throw NotFoundException if store not found', async () => {
      const error = new NotFoundException('Store with ID store-id not found');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.updateStore('store-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(StoreMapper.toResponseDto).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.updateStore('store-id', updateDto)).rejects.toThrow(error);
    });
  });
});
