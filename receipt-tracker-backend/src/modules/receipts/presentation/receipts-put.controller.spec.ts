import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReceiptsPutController } from './receipts-put.controller';
import { UpdateReceiptService } from '../application/update-receipt.service';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { Receipt, ReceiptStatus, PaymentMethod } from '../entities/receipt.entity';
import { User } from '../../auth/entities/user.entity';

describe('ReceiptsPutController', () => {
  let controller: ReceiptsPutController;

  const execute = jest.fn<Promise<Receipt>, [string, UpdateReceiptDto, string]>();

  const user = { userId: 'user-id', email: 'test@example.com' };

  const mockReceipt: Receipt = {
    id: 'receipt-id',
    userId: 'user-id',
    user: {} as User,
    storeName: 'Test Store',
    receiptDate: new Date(2024, 0, 15),
    category: 'GROCERY',
    paymentMethod: PaymentMethod.CARD,
    subtotal: 90,
    tax: 10,
    total: 150,
    status: ReceiptStatus.COMPLETED,
    needsReview: false,
    rawOcrText: null,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsPutController],
      providers: [{ provide: UpdateReceiptService, useValue: { execute } }],
    }).compile();

    controller = module.get<ReceiptsPutController>(ReceiptsPutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateReceipt', () => {
    const updateDto: UpdateReceiptDto = { total: 150 };

    it('should update the receipt for the current user and return the response dto', async () => {
      execute.mockResolvedValue(mockReceipt);

      const result = await controller.updateReceipt('receipt-id', updateDto, user);

      expect(execute).toHaveBeenCalledWith('receipt-id', updateDto, 'user-id');
      expect(result).toEqual({
        id: 'receipt-id',
        storeName: 'Test Store',
        receiptDate: '2024-01-15',
        category: 'GROCERY',
        paymentMethod: PaymentMethod.CARD,
        subtotal: 90,
        tax: 10,
        total: 150,
        status: ReceiptStatus.COMPLETED,
        needsReview: false,
        createdAt: mockReceipt.createdAt,
        updatedAt: mockReceipt.updatedAt,
      });
    });

    it('should propagate NotFoundException from the service', async () => {
      execute.mockRejectedValue(new NotFoundException('Receipt with ID receipt-id not found'));

      await expect(controller.updateReceipt('receipt-id', updateDto, user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
