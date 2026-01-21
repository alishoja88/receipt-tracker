import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { OcrService } from './ocr.service';
import { LlmService } from './llm.service';
import { ReceiptsRepository } from '../../receipts/infrastructure/persistence/receipts.repository';
import { Receipt, ReceiptStatus, PaymentMethod } from '../../receipts/entities/receipt.entity';
import { parseLocalDate } from '../../common/utils/date.util';

/**
 * Receipt Processing Service
 * Orchestrates the full pipeline: Image -> OCR -> LLM -> Database
 */
@Injectable()
export class ReceiptProcessingService {
  private readonly logger = new Logger(ReceiptProcessingService.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly llmService: LlmService,
    private readonly receiptsRepository: ReceiptsRepository,
  ) {}

  /**
   * Process receipt image and save to database
   * Returns array of receipts (one per category)
   */
  async processReceiptImage(
    imageBuffer: Buffer,
    mimetype: string,
    userId: string,
  ): Promise<Receipt[]> {
    this.logger.log('Starting receipt processing pipeline...');

    try {
      // Step 1: Validate image format
      if (!this.ocrService.isValidImageFormat(mimetype)) {
        throw new InternalServerErrorException(
          `Invalid image format: ${mimetype}. Supported formats: jpg, jpeg, png, pdf`,
        );
      }

      // Step 2: Extract text using OCR
      this.logger.log('Step 1/3: Extracting text with OCR...');
      const ocrResult = await this.ocrService.extractText(imageBuffer);

      if (!ocrResult.rawText || ocrResult.rawText.trim().length === 0) {
        throw new InternalServerErrorException('No text could be extracted from the image');
      }

      this.logger.log(`OCR completed. Text length: ${ocrResult.rawText.length} characters`);

      // Log FULL OCR text for debugging
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('📄 FULL OCR TEXT (Complete text extracted from receipt):');
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(ocrResult.rawText);
      this.logger.log('═══════════════════════════════════════════════════════════');

      // Try to find date patterns in OCR text
      const datePatterns = [
        { name: 'YYYY/MM/DD', pattern: /\d{4}\/\d{2}\/\d{2}/g },
        { name: 'MM/DD/YYYY or DD/MM/YYYY', pattern: /\d{2}\/\d{2}\/\d{4}/g },
        { name: 'Month DD, YYYY', pattern: /[A-Za-z]+\s+\d{1,2},\s+\d{4}/g },
        { name: 'YYYY-MM-DD', pattern: /\d{4}-\d{2}-\d{2}/g },
      ];

      this.logger.log('📅 Searching for date patterns in OCR text:');
      datePatterns.forEach(({ name, pattern }) => {
        const matches = ocrResult.rawText.match(pattern);
        if (matches && matches.length > 0) {
          this.logger.log(`   ✓ Found "${name}": ${matches.join(', ')}`);
        } else {
          this.logger.log(`   ✗ No "${name}" pattern found`);
        }
      });

      // Step 3: Parse text using LLM
      this.logger.log('Step 2/3: Parsing text with AI...');
      const parsedReceipt = await this.llmService.parseReceiptText(ocrResult.rawText);

      this.logger.log(
        `Parsing completed. Store: ${parsedReceipt.store.name}, Categories: ${parsedReceipt.categoryReceipts.length}`,
      );

      // Step 4: Save to database (multiple receipts if multiple categories)
      this.logger.log('Step 3/3: Saving to database...');
      const receipts = await this.saveToDatabase(parsedReceipt, ocrResult.confidence, userId);

      this.logger.log(
        `Receipt processing completed successfully. Created ${receipts.length} receipt(s)`,
      );

      return receipts;
    } catch (error) {
      this.logger.error('Receipt processing failed', error);

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to process receipt: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Save parsed receipt to database
   * Creates one receipt record per category
   */
  private async saveToDatabase(
    parsedReceipt: any,
    ocrConfidence: number | undefined,
    userId: string,
  ): Promise<Receipt[]> {
    // 1. Get store name from parsed receipt
    const storeName = parsedReceipt.store.name || 'Unknown Store';

    // 2. Determine if receipt needs review
    const needsReview =
      parsedReceipt.needsReview === true || (ocrConfidence !== undefined && ocrConfidence < 0.7);

    // 3. Convert payment method string to enum
    let paymentMethod: PaymentMethod | null = null;
    if (parsedReceipt.paymentMethod) {
      const methodUpper = parsedReceipt.paymentMethod.toUpperCase();
      if (Object.values(PaymentMethod).includes(methodUpper as PaymentMethod)) {
        paymentMethod = methodUpper as PaymentMethod;
      } else {
        paymentMethod = PaymentMethod.OTHER;
      }
    }

    // 4. Calculate total amount (sum of all category receipts)
    // Parse date without timezone conversion to avoid off-by-one day errors
    // If parsedReceipt.receiptDate is "2025-11-21", create date as local midnight
    const receiptDate = parseLocalDate(parsedReceipt.receiptDate);
    const totalAmount = parsedReceipt.categoryReceipts.reduce(
      (sum, cat) => sum + (cat.total || 0),
      0,
    );

    this.logger.log(
      `Checking for duplicate: Store: ${storeName}, Date: ${receiptDate.toISOString()}, Total: ${totalAmount}, Categories: ${parsedReceipt.categoryReceipts.length}`,
    );

    // 5. Check for duplicate receipt before saving
    // Check if a receipt with same store, date, and total already exists
    const duplicateReceipt = await this.receiptsRepository.findDuplicate(
      userId,
      storeName,
      receiptDate,
      totalAmount,
    );

    if (duplicateReceipt) {
      this.logger.warn(
        `Duplicate receipt detected for user ${userId}: Store: ${storeName}, Date: ${receiptDate.toISOString()}, Total: ${totalAmount}`,
      );
      throw new BadRequestException(
        `This receipt appears to be a duplicate. A receipt from ${storeName} with the same date and amount already exists in your account.`,
      );
    }

    // 6. Create one receipt per category
    const savedReceipts: Receipt[] = [];

    for (const categoryReceipt of parsedReceipt.categoryReceipts) {
      // Store category as string (directly from LLM)
      const receiptCategory = categoryReceipt.category || null;

      // Create receipt for this category
      const receipt = new Receipt();
      receipt.userId = userId;
      receipt.storeName = storeName;
      receipt.receiptDate = receiptDate;
      receipt.category = receiptCategory;
      receipt.paymentMethod = paymentMethod;
      receipt.subtotal = categoryReceipt.subtotal || null;
      receipt.tax = categoryReceipt.tax || null;
      receipt.total = categoryReceipt.total;
      receipt.status = needsReview ? ReceiptStatus.NEEDS_REVIEW : ReceiptStatus.COMPLETED;
      receipt.needsReview = needsReview;

      const savedReceipt = await this.receiptsRepository.create(receipt);

      // Note: Items are not stored in database - only category summaries are saved

      savedReceipts.push(savedReceipt);
    }

    return savedReceipts;
  }

  /**
   * Check if AI services are available
   */
  isAvailable(): { ocr: boolean; llm: boolean; available: boolean } {
    const ocr = this.ocrService.isAvailable();
    const llm = this.llmService.isAvailable();

    return {
      ocr,
      llm,
      available: ocr && llm,
    };
  }
}
