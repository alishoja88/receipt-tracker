import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { Receipt } from '../entities/receipt.entity';
import { ReceiptItem } from '../entities/receipt-item.entity';
import { SharedReceiptService } from './shared-receipt.service';

/**
 * Service for updating receipts
 */
@Injectable()
export class UpdateReceiptService {
  constructor(
    private readonly receiptsRepository: ReceiptsRepository,
    private readonly sharedReceiptService: SharedReceiptService,
  ) {}

  /**
   * Update receipt
   */
  async execute(id: string, dto: UpdateReceiptDto): Promise<Receipt> {
    // Check if receipt exists
    const existingReceipt = await this.receiptsRepository.findById(id);
    if (!existingReceipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    // 1. Handle store category (if provided)
    let categoryId: string | null = null;
    if (dto.storeCategoryName) {
      const category = await this.sharedReceiptService.findOrCreateCategory(dto.storeCategoryName);
      categoryId = category.id;
    }

    // 2. Find or create store (if storeName provided)
    let store = existingReceipt.store;
    if (dto.storeName) {
      store = await this.sharedReceiptService.findOrCreateStore(
        dto.storeName,
        dto.storeAddress,
        dto.storePhone,
        categoryId,
      );
    }

    // 3. Update receipt
    const updateData: Partial<Receipt> = {
      storeId: store.id,
      receiptDate: dto.receiptDate ? new Date(dto.receiptDate) : undefined,
      currency: dto.currency,
      subtotal: dto.subtotal,
      tax: dto.tax,
      total: dto.total,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await this.receiptsRepository.update(id, updateData);

    // 4. Update items (delete old, create new)
    if (dto.items && dto.items.length >= 0) {
      await this.receiptsRepository.deleteItemsByReceiptId(id);

      if (dto.items.length > 0) {
        const receiptItems = dto.items.map(itemDto => {
          const item = new ReceiptItem();
          item.receiptId = id;
          item.name = itemDto.name;
          item.total = itemDto.total;
          return item;
        });

        await this.receiptsRepository.createItems(receiptItems);
      }
    }

    // 5. Return updated receipt
    const result = await this.receiptsRepository.findById(id);
    if (!result) {
      throw new NotFoundException(`Receipt with ID ${id} not found after update`);
    }
    return result;
  }
}
