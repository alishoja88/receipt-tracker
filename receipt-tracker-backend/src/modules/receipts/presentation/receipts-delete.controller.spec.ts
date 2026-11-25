import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReceiptsDeleteController } from './receipts-delete.controller';
import { DeleteReceiptService } from '../application/delete-receipt.service';

describe('ReceiptsDeleteController', () => {
  let controller: ReceiptsDeleteController;

  const execute = jest.fn<Promise<void>, [string, string]>();

  const user = { userId: 'user-id', email: 'test@example.com' };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsDeleteController],
      providers: [{ provide: DeleteReceiptService, useValue: { execute } }],
    }).compile();

    controller = module.get<ReceiptsDeleteController>(ReceiptsDeleteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteReceipt', () => {
    it('should delete the receipt for the current user and return nothing', async () => {
      execute.mockResolvedValue(undefined);

      const result = await controller.deleteReceipt('receipt-id', user);

      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith('receipt-id', 'user-id');
      expect(result).toBeUndefined();
    });

    it('should propagate NotFoundException from the service', async () => {
      execute.mockRejectedValue(new NotFoundException('Receipt with ID receipt-id not found'));

      await expect(controller.deleteReceipt('receipt-id', user)).rejects.toThrow(
        new NotFoundException('Receipt with ID receipt-id not found'),
      );
    });
  });
});
