import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteReceiptService } from './delete-receipt.service';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { Store } from '../../stores/entities/store.entity';

describe('DeleteReceiptService', () => {
  let service: DeleteReceiptService;
  let receiptsRepository: jest.Mocked<ReceiptsRepository>;

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

  const mockReceipt: Receipt = {
    id: 'receipt-id',
    storeId: 'store-id',
    store: mockStore,
    receiptDate: new Date('2024-01-15'),
    category: null,
    paymentMethod: null,
    cardType: null,
    cardLast4Digits: null,
    subtotal: 90,
    tax: 10,
    total: 100,
    status: ReceiptStatus.COMPLETED,
    needsReview: false,
    rawOcrText: null,
    imageUrl: null,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteReceiptService,
        {
          provide: ReceiptsRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeleteReceiptService>(DeleteReceiptService);
    receiptsRepository = module.get(ReceiptsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should delete receipt successfully', async () => {
      receiptsRepository.findById.mockResolvedValue(mockReceipt);
      receiptsRepository.delete.mockResolvedValue(undefined);

      await service.execute('receipt-id');

      expect(receiptsRepository.findById).toHaveBeenCalledWith('receipt-id');
      expect(receiptsRepository.delete).toHaveBeenCalledWith('receipt-id');
    });

    it('should throw NotFoundException if receipt not found', async () => {
      receiptsRepository.findById.mockResolvedValue(null);

      await expect(service.execute('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.execute('non-existent-id')).rejects.toThrow(
        'Receipt with ID non-existent-id not found',
      );
      expect(receiptsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
