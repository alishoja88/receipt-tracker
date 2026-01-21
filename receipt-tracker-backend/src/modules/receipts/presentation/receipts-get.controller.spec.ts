import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReceiptsGetController } from './receipts-get.controller';
import { GetReceiptsService } from '../application/get-receipts.service';
import { ReceiptMapper } from './receipt-mapper.helper';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { Store } from '../../stores/entities/store.entity';
import { ReceiptItem } from '../entities/receipt-item.entity';

// Mock ReceiptMapper
jest.mock('./receipt-mapper.helper', () => ({
  ReceiptMapper: {
    toResponseDto: jest.fn(),
    toListItemDto: jest.fn(),
  },
}));

describe('ReceiptsGetController', () => {
  let controller: ReceiptsGetController;
  let service: GetReceiptsService;

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

  const mockListItemDto = {
    id: 'receipt-id',
    store: {
      id: 'store-id',
      name: 'Test Store',
    },
    receiptDate: new Date('2024-01-15'),
    total: 100,
    status: ReceiptStatus.COMPLETED,
    needsReview: false,
    itemsCount: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsGetController],
      providers: [
        {
          provide: GetReceiptsService,
          useValue: {
            getAll: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReceiptsGetController>(ReceiptsGetController);
    service = module.get<GetReceiptsService>(GetReceiptsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReceipts', () => {
    it('should call service.getAll with correct filters and pagination', async () => {
      const mockResult = {
        items: [mockReceipt],
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (service.getAll as jest.Mock).mockResolvedValue(mockResult);
      (ReceiptMapper.toListItemDto as jest.Mock).mockReturnValue(mockListItemDto);

      const result = await controller.getReceipts('1', '20', '2024-01-01', '2024-01-31');

      expect(service.getAll).toHaveBeenCalledWith(
        {
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31',
        },
        {
          page: 1,
          limit: 20,
        },
      );
      expect(ReceiptMapper.toListItemDto).toHaveBeenCalledWith(mockReceipt);
      expect(result).toEqual({
        items: [mockListItemDto],
        pagination: mockResult.pagination,
      });
    });

    it('should handle optional query parameters', async () => {
      const mockResult = {
        items: [mockReceipt],
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (service.getAll as jest.Mock).mockResolvedValue(mockResult);
      (ReceiptMapper.toListItemDto as jest.Mock).mockReturnValue(mockListItemDto);

      const result = await controller.getReceipts(
        undefined,
        undefined,
        undefined,
        undefined,
        'store-id',
        ReceiptStatus.COMPLETED,
      );

      expect(service.getAll).toHaveBeenCalledWith(
        {
          storeId: 'store-id',
          status: ReceiptStatus.COMPLETED,
        },
        {},
      );
      expect(result.items).toHaveLength(1);
    });

    it('should map all items to list item DTOs', async () => {
      const mockResult = {
        items: [mockReceipt, { ...mockReceipt, id: 'receipt-id-2' }],
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (service.getAll as jest.Mock).mockResolvedValue(mockResult);
      (ReceiptMapper.toListItemDto as jest.Mock).mockReturnValue(mockListItemDto);

      const result = await controller.getReceipts();

      expect(ReceiptMapper.toListItemDto).toHaveBeenCalledTimes(2);
      expect(result.items).toHaveLength(2);
    });
  });

  describe('getReceiptById', () => {
    it('should call service.getById with correct id and return mapped result', async () => {
      (service.getById as jest.Mock).mockResolvedValue(mockReceipt);
      (ReceiptMapper.toResponseDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await controller.getReceiptById('receipt-id');

      expect(service.getById).toHaveBeenCalledWith('receipt-id');
      expect(ReceiptMapper.toResponseDto).toHaveBeenCalledWith(mockReceipt);
      expect(result).toEqual(mockResponseDto);
    });

    it('should throw NotFoundException if receipt not found', async () => {
      const error = new NotFoundException('Receipt with ID receipt-id not found');
      (service.getById as jest.Mock).mockRejectedValue(error);

      await expect(controller.getReceiptById('receipt-id')).rejects.toThrow(NotFoundException);
      expect(ReceiptMapper.toResponseDto).not.toHaveBeenCalled();
    });
  });
});
