import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReceiptsRepository,
  ReceiptFilters,
  PaginationOptions,
} from '../infrastructure/persistence/receipts.repository';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { ReceiptResponseDto } from '../dto/receipt-response.dto';
import { Receipt, ReceiptStatus } from '../entities/receipt.entity';
import { ReceiptItem } from '../entities/receipt-item.entity';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class ReceiptService {
  constructor(
    private readonly receiptsRepository: ReceiptsRepository,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Create a new receipt
   */
  async createReceipt(dto: CreateReceiptDto): Promise<Receipt> {
    // 1. Find or create store category (if provided)
    let storeCategory: Category | null = null;
    if (dto.storeCategoryName) {
      storeCategory = await this.findOrCreateCategory(dto.storeCategoryName);
    }

    // 2. Find or create store
    const store = await this.findOrCreateStore(
      dto.storeName,
      dto.storeAddress,
      dto.storePhone,
      storeCategory?.id || null,
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

  /**
   * Get all receipts with filters and pagination
   */
  async getReceipts(filters: ReceiptFilters = {}, pagination: PaginationOptions = {}) {
    return this.receiptsRepository.findAll(filters, pagination);
  }

  /**
   * Get receipt by ID
   */
  async getReceiptById(id: string): Promise<Receipt> {
    const receipt = await this.receiptsRepository.findById(id);
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return receipt;
  }

  /**
   * Update receipt
   */
  async updateReceipt(id: string, dto: UpdateReceiptDto): Promise<Receipt> {
    // Check if receipt exists
    const existingReceipt = await this.receiptsRepository.findById(id);
    if (!existingReceipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    // 1. Handle store category (if provided)
    let storeCategory: Category | null = null;
    if (dto.storeCategoryName) {
      storeCategory = await this.findOrCreateCategory(dto.storeCategoryName);
    }

    // 2. Find or create store (if storeName provided)
    let store = existingReceipt.store;
    if (dto.storeName) {
      store = await this.findOrCreateStore(
        dto.storeName,
        dto.storeAddress,
        dto.storePhone,
        storeCategory?.id || null,
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

    const updatedReceipt = await this.receiptsRepository.update(id, updateData);

    // 4. Update items (delete old, create new)
    if (dto.items && dto.items.length > 0) {
      await this.receiptsRepository.deleteItemsByReceiptId(id);

      const receiptItems = dto.items.map(itemDto => {
        const item = new ReceiptItem();
        item.receiptId = id;
        item.name = itemDto.name;
        item.total = itemDto.total;
        return item;
      });

      await this.receiptsRepository.createItems(receiptItems);
    }

    // 5. Return updated receipt
    const result = await this.receiptsRepository.findById(id);
    if (!result) {
      throw new NotFoundException(`Receipt with ID ${id} not found after update`);
    }
    return result;
  }

  /**
   * Delete receipt
   */
  async deleteReceipt(id: string): Promise<void> {
    const receipt = await this.receiptsRepository.findById(id);
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    await this.receiptsRepository.delete(id);
  }

  /**
   * Find or create store
   */
  private async findOrCreateStore(
    name: string,
    address?: string,
    phone?: string,
    categoryId?: string | null,
  ): Promise<Store> {
    // Try to find existing store by name
    let store = await this.storeRepository.findOne({
      where: { name },
      relations: ['category'],
    });

    if (!store) {
      // Create new store
      store = this.storeRepository.create({
        name,
        address: address || null,
        phone: phone || null,
        categoryId: categoryId || null,
      });
      store = await this.storeRepository.save(store);

      // Reload with relations
      const savedStore = await this.storeRepository.findOne({
        where: { id: store.id },
        relations: ['category'],
      });
      if (savedStore) {
        store = savedStore;
      }
    } else {
      // Update store if new info provided
      const updateData: Partial<Store> = {};
      if (address !== undefined) updateData.address = address || null;
      if (phone !== undefined) updateData.phone = phone || null;
      if (categoryId !== undefined) updateData.categoryId = categoryId || null;

      if (Object.keys(updateData).length > 0) {
        await this.storeRepository.update(store.id, updateData);
        const updatedStore = await this.storeRepository.findOne({
          where: { id: store.id },
          relations: ['category'],
        });
        if (updatedStore) {
          store = updatedStore;
        }
      }
    }

    if (!store) {
      throw new BadRequestException('Failed to create or update store');
    }
    return store;
  }

  /**
   * Find or create category
   */
  private async findOrCreateCategory(name: string): Promise<Category> {
    let category = await this.categoryRepository.findOne({
      where: { name },
    });

    if (!category) {
      category = this.categoryRepository.create({
        name,
        description: null,
      });
      category = await this.categoryRepository.save(category);
    }

    return category;
  }
}
