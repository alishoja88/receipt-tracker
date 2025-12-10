import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StoresDeleteController } from './stores-delete.controller';
import { DeleteStoreService } from '../application/delete-store.service';

describe('StoresDeleteController', () => {
  let controller: StoresDeleteController;
  let service: DeleteStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresDeleteController],
      providers: [
        {
          provide: DeleteStoreService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StoresDeleteController>(StoresDeleteController);
    service = module.get<DeleteStoreService>(DeleteStoreService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteStore', () => {
    it('should call service.execute with correct id and return void', async () => {
      (service.execute as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.deleteStore('store-id');

      expect(service.execute).toHaveBeenCalledWith('store-id');
      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException if store not found', async () => {
      const error = new NotFoundException('Store with ID store-id not found');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.deleteStore('store-id')).rejects.toThrow(NotFoundException);
      await expect(controller.deleteStore('store-id')).rejects.toThrow(
        'Store with ID store-id not found',
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.deleteStore('store-id')).rejects.toThrow(error);
    });
  });
});
