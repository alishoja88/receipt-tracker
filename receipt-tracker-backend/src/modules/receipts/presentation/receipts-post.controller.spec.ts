import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReceiptsPostController } from './receipts-post.controller';
import { CreateReceiptService } from '../application/create-receipt.service';
import { ReceiptMapper } from './receipt-mapper.helper';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { Store } from '../../stores/entities/store.entity';
import { ReceiptItem } from '../entities/receipt-item.entity';

// Mock ReceiptMapper
jest.mock('./receipt-mapper.helper', () => ({
  ReceiptMapper: {
    toResponseDto: jest.fn(),
  },
}));

describe('ReceiptsPostController', () => {
  let controller: ReceiptsPostController;
  let service: CreateReceiptService;

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
    currency: 'USD',
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
    currency: 'USD',
    subtotal: 90,
    tax: 10,
    total: 100,
    status: ReceiptStatus.COMPLETED,
    needsReview: false,
    items: [
      {
        id: 'item-id',
        name: 'Item 1',
        total: 100,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsPostController],
      providers: [
        {
          provide: CreateReceiptService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReceiptsPostController>(ReceiptsPostController);
    service = module.get<CreateReceiptService>(CreateReceiptService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReceipt', () => {
    const createDto: CreateReceiptDto = {
      storeName: 'Test Store',
      receiptDate: '2024-01-15',
      total: 100,
      items: [{ name: 'Item 1', total: 100 }],
    };

    it('should call service.execute with correct dto and return mapped result', async () => {
      (service.execute as jest.Mock).mockResolvedValue(mockReceipt);
      (ReceiptMapper.toResponseDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await controller.createReceipt(createDto);

      expect(service.execute).toHaveBeenCalledWith(createDto);
      expect(ReceiptMapper.toResponseDto).toHaveBeenCalledWith(mockReceipt);
      expect(result).toEqual(mockResponseDto);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (service.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.createReceipt(createDto)).rejects.toThrow(error);
    });
  });

  describe('uploadReceipt', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'receipt.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('fake image data'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('should throw BadRequestException indicating AI Module is required', async () => {
      await expect(controller.uploadReceipt(mockFile)).rejects.toThrow(BadRequestException);
      await expect(controller.uploadReceipt(mockFile)).rejects.toThrow(
        'Receipt upload requires AI Module. Please use POST /api/receipts/create endpoint with receipt data.',
      );
    });
  });
});
