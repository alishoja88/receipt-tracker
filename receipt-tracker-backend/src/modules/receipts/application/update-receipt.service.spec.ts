import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateReceiptService } from './update-receipt.service';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { Receipt, ReceiptStatus, PaymentMethod } from '../entities/receipt.entity';
import { User } from '../../auth/entities/user.entity';

describe('UpdateReceiptService', () => {
  let service: UpdateReceiptService;

  const findById = jest.fn<Promise<Receipt | null>, [string, string?]>();
  const update = jest.fn<Promise<Receipt>, [string, Partial<Receipt>, string]>();

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

  /** The partial data the service handed to repository.update */
  const updateData = (): Partial<Receipt> => update.mock.calls[0][1];

  beforeEach(async () => {
    jest.resetAllMocks();
    findById.mockResolvedValue(mockReceipt);
    update.mockResolvedValue(mockReceipt);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateReceiptService,
        { provide: ReceiptsRepository, useValue: { findById, update } },
      ],
    }).compile();

    service = module.get<UpdateReceiptService>(UpdateReceiptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should check ownership, update, and return the reloaded receipt', async () => {
      const updated: Receipt = { ...mockReceipt, total: 110 };
      findById.mockResolvedValueOnce(mockReceipt).mockResolvedValueOnce(updated);

      const result = await service.execute('receipt-id', { total: 110 }, userId);

      expect(findById).toHaveBeenNthCalledWith(1, 'receipt-id', userId);
      expect(update).toHaveBeenCalledWith('receipt-id', { total: 110 }, userId);
      expect(findById).toHaveBeenNthCalledWith(2, 'receipt-id', userId);
      expect(result).toBe(updated);
    });

    it('should only send fields that are present in the dto', async () => {
      await service.execute('receipt-id', { storeName: 'New Store' }, userId);

      expect(Object.keys(updateData())).toEqual(['storeName']);
    });

    it('should map every updatable field', async () => {
      const dto: UpdateReceiptDto = {
        storeName: 'New Store',
        receiptDate: '2024-01-20',
        subtotal: 100,
        tax: 10,
        total: 110,
        category: 'HEALTH',
        paymentMethod: 'CASH',
      };

      await service.execute('receipt-id', dto, userId);

      expect(updateData()).toEqual({
        storeName: 'New Store',
        receiptDate: new Date(2024, 0, 20),
        subtotal: 100,
        tax: 10,
        total: 110,
        category: 'HEALTH',
        paymentMethod: PaymentMethod.CASH,
      });
    });

    it('should clear category and reject unknown payment methods as null', async () => {
      await service.execute('receipt-id', { category: null, paymentMethod: 'BITCOIN' }, userId);

      expect(updateData()).toEqual({ category: null, paymentMethod: null });
    });

    it('should ignore line items because they are not stored', async () => {
      await service.execute(
        'receipt-id',
        { total: 110, items: [{ name: 'Item 1', total: 110 }] },
        userId,
      );

      expect(Object.keys(updateData())).toEqual(['total']);
    });

    it('should throw NotFoundException and not update if the receipt is not found', async () => {
      findById.mockResolvedValue(null);

      await expect(service.execute('missing-id', { total: 110 }, userId)).rejects.toThrow(
        new NotFoundException('Receipt with ID missing-id not found'),
      );
      expect(findById).toHaveBeenCalledWith('missing-id', userId);
      expect(update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if the receipt is gone after the update', async () => {
      findById.mockResolvedValueOnce(mockReceipt).mockResolvedValueOnce(null);

      await expect(service.execute('receipt-id', { total: 110 }, userId)).rejects.toThrow(
        new NotFoundException('Receipt with ID receipt-id not found after update'),
      );
    });
  });
});
