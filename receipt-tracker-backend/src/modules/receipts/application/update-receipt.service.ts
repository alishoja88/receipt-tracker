import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { Receipt, PaymentMethod } from '../entities/receipt.entity';
import { parseLocalDate } from '../../common/utils/date.util';

/**
 * Service for updating receipts
 */
@Injectable()
export class UpdateReceiptService {
  constructor(private readonly receiptsRepository: ReceiptsRepository) {}

  /**
   * Update receipt
   */
  async execute(id: string, dto: UpdateReceiptDto, userId: string): Promise<Receipt> {
    // Check if receipt exists and belongs to user
    const existingReceipt = await this.receiptsRepository.findById(id, userId);
    if (!existingReceipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    // Update receipt
    const updateData: Partial<Receipt> = {
      storeName: dto.storeName,
      receiptDate: dto.receiptDate ? parseLocalDate(dto.receiptDate) : undefined,
      subtotal: dto.subtotal,
      tax: dto.tax,
      total: dto.total,
      category: dto.category !== undefined ? dto.category : undefined,
      paymentMethod:
        dto.paymentMethod !== undefined
          ? dto.paymentMethod &&
            Object.values(PaymentMethod).includes(dto.paymentMethod as PaymentMethod)
            ? (dto.paymentMethod as PaymentMethod)
            : null
          : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await this.receiptsRepository.update(id, updateData, userId);

    // Note: Items are not stored in database - only category summaries are saved
    // Items are optional and will be ignored if provided

    // 4. Return updated receipt
    const result = await this.receiptsRepository.findById(id, userId);
    if (!result) {
      throw new NotFoundException(`Receipt with ID ${id} not found after update`);
    }
    return result;
  }
}
