import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { Receipt, ReceiptStatus } from '../../entities/receipt.entity';
import { ReceiptItem } from '../../entities/receipt-item.entity';

export interface ReceiptFilters {
  dateFrom?: string;
  dateTo?: string;
  storeId?: string;
  status?: ReceiptStatus;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class ReceiptsRepository {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    @InjectRepository(ReceiptItem)
    private readonly receiptItemRepository: Repository<ReceiptItem>,
  ) {}

  /**
   * Create a new receipt
   */
  async create(receipt: Receipt): Promise<Receipt> {
    return this.receiptRepository.save(receipt);
  }

  /**
   * Find receipt by ID with relations
   */
  async findById(id: string): Promise<Receipt | null> {
    return this.receiptRepository.findOne({
      where: { id },
      relations: ['store', 'store.category', 'items'],
      order: {
        items: {
          createdAt: 'ASC',
        },
      },
    });
  }

  /**
   * Find all receipts with filters and pagination
   */
  async findAll(
    filters: ReceiptFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<Receipt>> {
    const { page = 1, limit = 20 } = pagination;

    const where: FindOptionsWhere<Receipt> = {};

    // Apply filters
    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1970-01-01');
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date('9999-12-31');

      where.receiptDate = Between(dateFrom, dateTo);
    }

    // Get total count
    const totalItems = await this.receiptRepository.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    // Get paginated results
    const items = await this.receiptRepository.find({
      where,
      relations: ['store', 'store.category'],
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Update receipt
   */
  async update(id: string, data: Partial<Receipt>): Promise<Receipt> {
    await this.receiptRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException(`Receipt with ID ${id} not found after update`);
    }
    return updated;
  }

  /**
   * Delete receipt (cascade delete items)
   */
  async delete(id: string): Promise<void> {
    await this.receiptRepository.delete(id);
  }

  /**
   * Find receipts by date range
   */
  async findByDateRange(from: Date, to: Date): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: {
        receiptDate: Between(from, to),
      },
      relations: ['store', 'items'],
      order: {
        receiptDate: 'ASC',
      },
    });
  }

  /**
   * Find receipts by store ID
   */
  async findByStoreId(storeId: string): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { storeId },
      relations: ['store', 'items'],
      order: {
        receiptDate: 'DESC',
      },
    });
  }

  /**
   * Find receipts by status
   */
  async findByStatus(status: ReceiptStatus): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { status },
      relations: ['store', 'items'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Create receipt items
   */
  async createItems(items: ReceiptItem[]): Promise<ReceiptItem[]> {
    return this.receiptItemRepository.save(items);
  }

  /**
   * Delete receipt items by receipt ID
   */
  async deleteItemsByReceiptId(receiptId: string): Promise<void> {
    await this.receiptItemRepository.delete({ receiptId });
  }

  /**
   * Count receipts
   */
  async count(filters: ReceiptFilters = {}): Promise<number> {
    const where: FindOptionsWhere<Receipt> = {};

    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1970-01-01');
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date('9999-12-31');

      where.receiptDate = Between(dateFrom, dateTo);
    }

    return this.receiptRepository.count({ where });
  }
}
