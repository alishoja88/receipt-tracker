import { Injectable, BadRequestException } from '@nestjs/common';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { ReceiptItem } from '../entities/receipt-item.entity';
import { SharedReceiptService } from './shared-receipt.service';

/**
 * Service for creating receipts
 */
@Injectable()
export class CreateReceiptService {
  constructor(
    private readonly receiptsRepository: ReceiptsRepository,
    private readonly sharedReceiptService: SharedReceiptService,
  ) {}

  /**
   * Create a new receipt
   */
  async execute(dto: CreateReceiptDto): Promise<Receipt> {
    // 1. Find or create store category (if provided)
    let categoryId: string | null = null;
    if (dto.storeCategoryName) {
      const category = await this.sharedReceiptService.findOrCreateCategory(dto.storeCategoryName);
      categoryId = category.id;
    }

    // 2. Find or create store
    const store = await this.sharedReceiptService.findOrCreateStore(
      dto.storeName,
      dto.storeAddress,
      dto.storePhone,
      categoryId,
    );

    // 3. Create receipt
    const receipt = new Receipt();
    receipt.storeId = store.id;
    receipt.receiptDate = new Date(dto.receiptDate);
    receipt.currency = dto.currency || null;
    receipt.subtotal = dto.subtotal || null;
    receipt.tax = dto.tax || null;
    receipt.total = dto.total;
    receipt.status = ReceiptStatus.COMPLETED;
    receipt.needsReview = false;

    const savedReceipt = await this.receiptsRepository.create(receipt);

    // 4. Create receipt items
    const receiptItems = dto.items.map(itemDto => {
      const item = new ReceiptItem();
      item.receiptId = savedReceipt.id;
      item.name = itemDto.name;
      item.total = itemDto.total;
      return item;
    });

    await this.receiptsRepository.createItems(receiptItems);

    // 5. Return receipt with relations
    const result = await this.receiptsRepository.findById(savedReceipt.id);
    if (!result) {
      throw new BadRequestException('Failed to create receipt');
    }
    return result;
  }
}
