import { Readable } from 'stream';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReceiptsPostController } from './receipts-post.controller';
import { CreateReceiptService } from '../application/create-receipt.service';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { Receipt, ReceiptStatus, PaymentMethod } from '../entities/receipt.entity';
import { User } from '../../auth/entities/user.entity';
import { ReceiptProcessingService } from '../../ai/application';

describe('ReceiptsPostController', () => {
  let controller: ReceiptsPostController;

  const execute = jest.fn<Promise<Receipt>, [CreateReceiptDto, string]>();
  const processReceiptImage = jest.fn<Promise<Receipt[]>, [Buffer, string, string]>();
  const isAvailable = jest.fn<{ ocr: boolean; llm: boolean; available: boolean }, []>();

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
      controllers: [ReceiptsPostController],
      providers: [
        { provide: CreateReceiptService, useValue: { execute } },
        { provide: ReceiptProcessingService, useValue: { processReceiptImage, isAvailable } },
      ],
    }).compile();

    controller = module.get<ReceiptsPostController>(ReceiptsPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReceipt', () => {
    const createDto: CreateReceiptDto = {
      storeName: 'Test Store',
      receiptDate: '2024-01-15',
      total: 100,
    };

    it('should create the receipt for the current user and return the response dto', async () => {
      execute.mockResolvedValue(mockReceipt);

      const result = await controller.createReceipt(createDto, user);

      expect(execute).toHaveBeenCalledWith(createDto, 'user-id');
      expect(result).toMatchObject({
        id: 'receipt-id',
        storeName: 'Test Store',
        receiptDate: '2024-01-15',
        total: 100,
      });
    });

    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      execute.mockRejectedValue(error);

      await expect(controller.createReceipt(createDto, user)).rejects.toThrow(error);
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
      stream: Readable.from([]),
    };

    it('should name the missing key when one AI service is not configured', async () => {
      isAvailable.mockReturnValue({ ocr: false, llm: true, available: false });

      await expect(controller.uploadReceipt(mockFile, user)).rejects.toThrow(
        'AI services are not configured. Missing: OCR_API_KEY.',
      );
      expect(processReceiptImage).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException listing both keys when neither is configured', async () => {
      isAvailable.mockReturnValue({ ocr: false, llm: false, available: false });

      const upload = controller.uploadReceipt(mockFile, user);

      await expect(upload).rejects.toThrow(BadRequestException);
      await expect(upload).rejects.toThrow('Missing: OCR_API_KEY, OPENAI_API_KEY.');
    });

    it('should process the image for the current user and return one dto per receipt', async () => {
      isAvailable.mockReturnValue({ ocr: true, llm: true, available: true });
      processReceiptImage.mockResolvedValue([
        mockReceipt,
        { ...mockReceipt, id: 'receipt-id-2', category: 'HEALTH' },
      ]);

      const result = await controller.uploadReceipt(mockFile, user);

      expect(processReceiptImage).toHaveBeenCalledWith(mockFile.buffer, 'image/jpeg', 'user-id');
      expect(result.map(r => [r.id, r.category])).toEqual([
        ['receipt-id', 'GROCERY'],
        ['receipt-id-2', 'HEALTH'],
      ]);
    });
  });
});
