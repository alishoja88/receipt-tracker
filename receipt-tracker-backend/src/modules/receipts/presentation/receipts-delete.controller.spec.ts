import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReceiptsDeleteController } from './receipts-delete.controller';
import { DeleteReceiptService } from '../application/delete-receipt.service';

describe('ReceiptsDeleteController', () => {
  let controller: ReceiptsDeleteController;
  let service: DeleteReceiptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsDeleteController],
      providers: [
        {
          provide: DeleteReceiptService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReceiptsDeleteController>(ReceiptsDeleteController);
    service = module.get<DeleteReceiptService>(DeleteReceiptService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteReceipt', () => {
    it('should call service.execute with correct id and return void', async () => {
      (service.execute as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.deleteReceipt('receipt-id');

      expect(service.execute).toHaveBeenCalledWith('receipt-id');
      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException if receipt not found', async () => {
      const error = new NotFoundException('Receipt with ID receipt-id not found');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.deleteReceipt('receipt-id')).rejects.toThrow(NotFoundException);
      await expect(controller.deleteReceipt('receipt-id')).rejects.toThrow(
        'Receipt with ID receipt-id not found',
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.deleteReceipt('receipt-id')).rejects.toThrow(error);
    });
  });
});
