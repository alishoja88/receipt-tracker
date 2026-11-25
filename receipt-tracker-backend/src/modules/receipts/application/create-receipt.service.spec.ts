import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateReceiptService } from './create-receipt.service';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { Receipt, ReceiptStatus, PaymentMethod } from '../entities/receipt.entity';
import { User } from '../../auth/entities/user.entity';

describe('CreateReceiptService', () => {
  let service: CreateReceiptService;

  const create = jest.fn<Promise<Receipt>, [Receipt]>();
  const findById = jest.fn<Promise<Receipt | null>, [string, string?]>();

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

  const dto: CreateReceiptDto = {
    storeName: 'Test Store',
    receiptDate: '2024-01-15',
    subtotal: 90,
    tax: 10,
    total: 100,
    category: 'GROCERY',
    paymentMethod: 'CARD',
  };

  /** The Receipt instance the service handed to repository.create */
  const createdReceipt = (): Receipt => create.mock.calls[0][0];

  beforeEach(async () => {
    jest.resetAllMocks();
    create.mockResolvedValue(mockReceipt);
    findById.mockResolvedValue(mockReceipt);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReceiptService,
        { provide: ReceiptsRepository, useValue: { create, findById } },
      ],
    }).compile();

    service = module.get<CreateReceiptService>(CreateReceiptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should build a completed receipt for the user from the dto', async () => {
      await service.execute(dto, userId);

      expect(create).toHaveBeenCalledTimes(1);
      const receipt = createdReceipt();
      expect(receipt).toBeInstanceOf(Receipt);
      expect(receipt).toEqual(
        Object.assign(new Receipt(), {
          userId,
          storeName: 'Test Store',
          receiptDate: new Date(2024, 0, 15),
          subtotal: 90,
          tax: 10,
          total: 100,
          status: ReceiptStatus.COMPLETED,
          needsReview: false,
          category: 'GROCERY',
          paymentMethod: PaymentMethod.CARD,
        }),
      );
    });

    it('should return the receipt reloaded by id after saving', async () => {
      const reloaded: Receipt = { ...mockReceipt, rawOcrText: 'reloaded' };
      findById.mockResolvedValue(reloaded);

      const result = await service.execute(dto, userId);

      expect(findById).toHaveBeenCalledWith('receipt-id');
      expect(result).toBe(reloaded);
    });

    it('should set optional fields to null when they are not provided', async () => {
      const minimalDto: CreateReceiptDto = {
        storeName: 'Test Store',
        receiptDate: '2024-01-15',
        total: 100,
      };

      await service.execute(minimalDto, userId);

      const receipt = createdReceipt();
      expect(receipt.subtotal).toBeNull();
      expect(receipt.tax).toBeNull();
      expect(receipt.category).toBeNull();
      expect(receipt.paymentMethod).toBeNull();
    });

    it('should set paymentMethod to null when it is not a known value', async () => {
      await service.execute({ ...dto, paymentMethod: 'BITCOIN' }, userId);

      expect(createdReceipt().paymentMethod).toBeNull();
    });

    it('should ignore line items because they are not stored', async () => {
      await service.execute({ ...dto, items: [{ name: 'Item 1', total: 100 }] }, userId);

      expect(create).toHaveBeenCalledTimes(1);
      expect(createdReceipt()).not.toHaveProperty('items');
    });

    it('should throw BadRequestException if the receipt cannot be reloaded', async () => {
      findById.mockResolvedValue(null);

      await expect(service.execute(dto, userId)).rejects.toThrow(
        new BadRequestException('Failed to create receipt'),
      );
    });
  });
});
