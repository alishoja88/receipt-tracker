import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReceiptsPutController } from './receipts-put.controller';
import { UpdateReceiptService } from '../application/update-receipt.service';
import { ReceiptMapper } from './receipt-mapper.helper';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { Store } from '../../stores/entities/store.entity';
import { ReceiptItem } from '../entities/receipt-item.entity';

// Mock ReceiptMapper
jest.mock('./receipt-mapper.helper', () => ({
  ReceiptMapper: {
    toResponseDto: jest.fn(),
  },
}));

describe('ReceiptsPutController', () => {
  let controller: ReceiptsPutController;
  let service: UpdateReceiptService;

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
    items: [
      {
        id: 'item-id',
        receiptId: 'receipt-id',
        receipt: {} as Receipt,
        name: 'Item 1',
        total: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResponseDto = {
    id: 'receipt-id',
    store: {
      id: 'store-id',
      name: 'Test Store',
      address: '123 Test St',
      phone: '123-456-7890',
      category: null,
    },
    receiptDate: new Date('2024-01-15'),
    subtotal: 90,
    tax: 10,
    total: 150,
    status: ReceiptStatus.COMPLETED,
    needsReview: false,
    items: [
      {
        id: 'item-id',
        name: 'Updated Item',
        total: 150,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsPutController],
      providers: [
        {
          provide: UpdateReceiptService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReceiptsPutController>(ReceiptsPutController);
    service = module.get<UpdateReceiptService>(UpdateReceiptService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateReceipt', () => {
    const updateDto: UpdateReceiptDto = {
      total: 150,
      items: [{ name: 'Updated Item', total: 150 }],
    };

    it('should call service.execute with correct id and dto and return mapped result', async () => {
      const updatedReceipt = { ...mockReceipt, total: 150 };
      (service.execute as jest.Mock).mockResolvedValue(updatedReceipt);
      (ReceiptMapper.toResponseDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await controller.updateReceipt('receipt-id', updateDto);

      expect(service.execute).toHaveBeenCalledWith('receipt-id', updateDto);
      expect(ReceiptMapper.toResponseDto).toHaveBeenCalledWith(updatedReceipt);
      expect(result).toEqual(mockResponseDto);
    });

    it('should handle partial updates', async () => {
      const partialDto: UpdateReceiptDto = {
        total: 200,
      };
      const updatedReceipt = { ...mockReceipt, total: 200 };
      (service.execute as jest.Mock).mockResolvedValue(updatedReceipt);
      (ReceiptMapper.toResponseDto as jest.Mock).mockReturnValue({
        ...mockResponseDto,
        total: 200,
      });

      const result = await controller.updateReceipt('receipt-id', partialDto);

      expect(service.execute).toHaveBeenCalledWith('receipt-id', partialDto);
      expect(result.total).toBe(200);
    });

    it('should throw NotFoundException if receipt not found', async () => {
      const error = new NotFoundException('Receipt with ID receipt-id not found');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.updateReceipt('receipt-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(ReceiptMapper.toResponseDto).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.updateReceipt('receipt-id', updateDto)).rejects.toThrow(error);
    });
  });
});
