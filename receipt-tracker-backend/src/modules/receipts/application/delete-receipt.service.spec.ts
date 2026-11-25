import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteReceiptService } from './delete-receipt.service';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { Receipt, ReceiptStatus, PaymentMethod } from '../entities/receipt.entity';
import { User } from '../../auth/entities/user.entity';

describe('DeleteReceiptService', () => {
  let service: DeleteReceiptService;

  const findById = jest.fn<Promise<Receipt | null>, [string, string?]>();
  const deleteReceipt = jest.fn<Promise<void>, [string, string]>();

  const userId = 'user-id';

  const mockReceipt: Receipt = {
    id: 'receipt-id',
    userId,
    user: {} as User,
    storeName: 'Test Store',
    receiptDate: new Date(2024, 0, 15),
    category: 'GROCERY',
    paymentMethod: PaymentMethod.CARD,
    subtotal: 90,
    tax: 10,
    total: 100,
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
      providers: [
        DeleteReceiptService,
        { provide: ReceiptsRepository, useValue: { findById, delete: deleteReceipt } },
      ],
    }).compile();

    service = module.get<DeleteReceiptService>(DeleteReceiptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should delete the user receipt', async () => {
      findById.mockResolvedValue(mockReceipt);
      deleteReceipt.mockResolvedValue(undefined);

      await service.execute('receipt-id', userId);

      expect(findById).toHaveBeenCalledWith('receipt-id', userId);
      expect(deleteReceipt).toHaveBeenCalledWith('receipt-id', userId);
    });

    it('should throw NotFoundException and not delete if the receipt is not found', async () => {
      findById.mockResolvedValue(null);

      await expect(service.execute('missing-id', userId)).rejects.toThrow(
        new NotFoundException('Receipt with ID missing-id not found'),
      );
      expect(deleteReceipt).not.toHaveBeenCalled();
    });
  });
});
