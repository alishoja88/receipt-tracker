import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ReceiptProcessingService } from './receipt-processing.service';
import { OcrService } from './ocr.service';
import { LlmService } from './llm.service';
import { ReceiptsRepository } from '../../receipts/infrastructure/persistence/receipts.repository';
import { Receipt, ReceiptStatus } from '../../receipts/entities/receipt.entity';

describe('ReceiptProcessingService', () => {
  let service: ReceiptProcessingService;
  let ocrService: OcrService;
  let llmService: LlmService;
  let receiptsRepository: ReceiptsRepository;

  const mockReceipt: Receipt = {
    id: 'receipt-id',
    userId: 'user-id',
    user: {} as any,
    storeName: 'Test Store',
    receiptDate: new Date('2024-01-15'),
    category: null,
    paymentMethod: null,
    subtotal: 11.48,
    tax: 0.92,
    total: 12.4,
    status: ReceiptStatus.COMPLETED,
    needsReview: false,
    rawOcrText: null,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptProcessingService,
        {
          provide: OcrService,
          useValue: {
            extractText: jest.fn(),
            isValidImageFormat: jest.fn(),
            isAvailable: jest.fn(),
          },
        },
        {
          provide: LlmService,
          useValue: {
            parseReceiptText: jest.fn(),
            isAvailable: jest.fn(),
          },
        },
        {
          provide: ReceiptsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findDuplicate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReceiptProcessingService>(ReceiptProcessingService);
    ocrService = module.get<OcrService>(OcrService);
    llmService = module.get<LlmService>(LlmService);
    receiptsRepository = module.get<ReceiptsRepository>(ReceiptsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processReceiptImage', () => {
    const mockImageBuffer = Buffer.from('fake image data');
    const mockMimetype = 'image/jpeg';

    const mockOcrResult = {
      rawText: 'Receipt text from OCR',
      confidence: 0.95,
    };

    const mockParsedReceipt = {
      store: {
        name: 'Test Store',
        address: '123 Main St',
        phone: '555-1234',
        categoryName: 'Groceries',
      },
      receiptDate: '2024-01-15',
      totals: {
        subtotal: 11.48,
        tax: 0.92,
        total: 12.4,
      },
      categoryReceipts: [
        {
          category: 'GROCERY',
          subtotal: 11.48,
          tax: 0.92,
          total: 12.4,
        },
      ],
      needsReview: false,
    };

    it('should process receipt successfully', async () => {
      const userId = 'user-id';
      (ocrService.isValidImageFormat as jest.Mock).mockReturnValue(true);
      (ocrService.extractText as jest.Mock).mockResolvedValue(mockOcrResult);
      (llmService.parseReceiptText as jest.Mock).mockResolvedValue(mockParsedReceipt);
      (receiptsRepository.findDuplicate as jest.Mock).mockResolvedValue(null);
      (receiptsRepository.create as jest.Mock).mockResolvedValue(mockReceipt);

      const result = await service.processReceiptImage(mockImageBuffer, mockMimetype, userId);

      expect(ocrService.isValidImageFormat).toHaveBeenCalledWith(mockMimetype);
      expect(ocrService.extractText).toHaveBeenCalledWith(mockImageBuffer);
      expect(llmService.parseReceiptText).toHaveBeenCalledWith(mockOcrResult.rawText);
      expect(receiptsRepository.findDuplicate).toHaveBeenCalled();
      expect(receiptsRepository.create).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw error for invalid image format', async () => {
      const userId = 'user-id';
      (ocrService.isValidImageFormat as jest.Mock).mockReturnValue(false);

      await expect(
        service.processReceiptImage(mockImageBuffer, 'image/gif', userId),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error when no text extracted', async () => {
      const userId = 'user-id';
      (ocrService.isValidImageFormat as jest.Mock).mockReturnValue(true);
      (ocrService.extractText as jest.Mock).mockResolvedValue({
        rawText: '',
        confidence: 0,
      });

      await expect(
        service.processReceiptImage(mockImageBuffer, mockMimetype, userId),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should set needsReview when OCR confidence is low', async () => {
      const userId = 'user-id';
      const lowConfidenceOcr = {
        rawText: 'Receipt text',
        confidence: 0.5,
      };

      (ocrService.isValidImageFormat as jest.Mock).mockReturnValue(true);
      (ocrService.extractText as jest.Mock).mockResolvedValue(lowConfidenceOcr);
      (llmService.parseReceiptText as jest.Mock).mockResolvedValue(mockParsedReceipt);
      (receiptsRepository.findDuplicate as jest.Mock).mockResolvedValue(null);

      const receiptWithReview = {
        ...mockReceipt,
        needsReview: true,
        status: ReceiptStatus.NEEDS_REVIEW,
      };
      (receiptsRepository.create as jest.Mock).mockImplementation((receipt: any) => {
        expect(receipt.needsReview).toBe(true);
        expect(receipt.status).toBe(ReceiptStatus.NEEDS_REVIEW);
        return Promise.resolve(receiptWithReview);
      });

      await service.processReceiptImage(mockImageBuffer, mockMimetype, userId);

      expect(receiptsRepository.create).toHaveBeenCalled();
    });
  });

  describe('isAvailable', () => {
    it('should return availability status of AI services', () => {
      (ocrService.isAvailable as jest.Mock).mockReturnValue(true);
      (llmService.isAvailable as jest.Mock).mockReturnValue(true);

      const result = service.isAvailable();

      expect(result).toEqual({
        ocr: true,
        llm: true,
        available: true,
      });
    });

    it('should return false when OCR is not available', () => {
      (ocrService.isAvailable as jest.Mock).mockReturnValue(false);
      (llmService.isAvailable as jest.Mock).mockReturnValue(true);

      const result = service.isAvailable();

      expect(result).toEqual({
        ocr: false,
        llm: true,
        available: false,
      });
    });

    it('should return false when LLM is not available', () => {
      (ocrService.isAvailable as jest.Mock).mockReturnValue(true);
      (llmService.isAvailable as jest.Mock).mockReturnValue(false);

      const result = service.isAvailable();

      expect(result).toEqual({
        ocr: true,
        llm: false,
        available: false,
      });
    });
  });
});
