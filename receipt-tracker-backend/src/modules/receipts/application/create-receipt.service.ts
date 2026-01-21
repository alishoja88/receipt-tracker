import { Injectable, BadRequestException } from '@nestjs/common';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { Receipt, ReceiptStatus, PaymentMethod } from '../entities/receipt.entity';
import { parseLocalDate } from '../../common/utils/date.util';

/**
 * Service for creating receipts
 */
@Injectable()
export class CreateReceiptService {
  constructor(private readonly receiptsRepository: ReceiptsRepository) {}

  /**
   * Create a new receipt
   */
  async execute(dto: CreateReceiptDto, userId: string): Promise<Receipt> {
    // Create receipt
    const receipt = new Receipt();
    receipt.userId = userId;
    receipt.storeName = dto.storeName;
    receipt.receiptDate = parseLocalDate(dto.receiptDate);
    receipt.subtotal = dto.subtotal || null;
    receipt.tax = dto.tax || null;
    receipt.total = dto.total;
    receipt.status = ReceiptStatus.COMPLETED;
    receipt.needsReview = false;

    // Set category and payment method if provided
    receipt.category = dto.category || null;
    receipt.paymentMethod =
      dto.paymentMethod && Object.values(PaymentMethod).includes(dto.paymentMethod as PaymentMethod)
        ? (dto.paymentMethod as PaymentMethod)
        : null;

    const savedReceipt = await this.receiptsRepository.create(receipt);

    // Note: Items are not stored in database - only category summaries are saved
    // Items are optional and will be ignored if provided

    // 4. Return receipt with relations
    const result = await this.receiptsRepository.findById(savedReceipt.id);
    if (!result) {
      throw new BadRequestException('Failed to create receipt');
    }
    return result;
  }
}
