import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, ILike } from 'typeorm';
import { Receipt, ReceiptStatus } from '../../entities/receipt.entity';

export interface ReceiptFilters {
  dateFrom?: string;
  dateTo?: string;
  storeName?: string;
  status?: ReceiptStatus;
  category?: string;
  paymentMethod?: string;
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
  ) {}

  /**
   * Create a new receipt
   */
  async create(receipt: Receipt): Promise<Receipt> {
    return this.receiptRepository.save(receipt);
  }

  /**
   * Find receipt by ID
   */
  async findById(id: string, userId?: string): Promise<Receipt | null> {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    return this.receiptRepository.findOne({
      where,
    });
  }

  /**
   * Find all receipts with filters and pagination
   */
  async findAll(
    filters: ReceiptFilters = {},
    pagination: PaginationOptions = {},
    userId?: string,
  ): Promise<PaginatedResult<Receipt>> {
    const { page = 1, limit = 20 } = pagination;

    const where: FindOptionsWhere<Receipt> = {};

    // Always filter by userId if provided
    if (userId) {
      where.userId = userId;
    }

    // Apply filters
    // Store name filter with partial match (case-insensitive)
    if (filters.storeName && filters.storeName.trim()) {
      where.storeName = ILike(`%${filters.storeName.trim()}%`);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod as any;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1970-01-01');
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date('9999-12-31');

      where.receiptDate = Between(dateFrom, dateTo);
    }

    console.log('🔴 REPOSITORY - Query where clause:', JSON.stringify(where, null, 2));

    // Get total count
    const totalItems = await this.receiptRepository.count({ where });
    console.log('🔴 REPOSITORY - Total items count:', totalItems);

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    // Get paginated results
    const items = await this.receiptRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    console.log('🔴 REPOSITORY - Found items from database:', {
      count: items.length,
      items: items.map(r => ({
        id: r.id,
        userId: r.userId,
        storeName: r.storeName,
        total: r.total,
        receiptDate: r.receiptDate,
        category: r.category,
        createdAt: r.createdAt,
      })),
    });

    // Also check ALL receipts in database (for debugging)
    const allReceipts = await this.receiptRepository.find({
      select: ['id', 'userId', 'storeName', 'total', 'receiptDate', 'category', 'createdAt'],
      order: {
        createdAt: 'DESC',
      },
    });
    console.log('🔴 REPOSITORY - ALL receipts in database (no filter):', {
      totalCount: allReceipts.length,
      receipts: allReceipts.map(r => ({
        id: r.id,
        userId: r.userId,
        storeName: r.storeName,
        total: r.total,
        receiptDate: r.receiptDate,
        category: r.category,
      })),
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
  async update(id: string, data: Partial<Receipt>, userId: string): Promise<Receipt> {
    // Ensure receipt belongs to user
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    await this.receiptRepository.update({ id, userId }, data);
    const updated = await this.findById(id, userId);
    if (!updated) {
      throw new NotFoundException(`Receipt with ID ${id} not found after update`);
    }
    return updated;
  }

  /**
   * Delete receipt
   */
  async delete(id: string, userId: string): Promise<void> {
    // Ensure receipt belongs to user
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    await this.receiptRepository.delete({ id, userId });
  }

  /**
   * Find receipts by date range
   */
  async findByDateRange(from: Date, to: Date, userId: string): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: {
        receiptDate: Between(from, to),
        userId,
      },
      order: {
        receiptDate: 'ASC',
      },
    });
  }

  /**
   * Find receipts by store name
   */
  async findByStoreName(storeName: string, userId: string): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { storeName, userId },
      order: {
        receiptDate: 'DESC',
      },
    });
  }

  /**
   * Find receipts by status
   */
  async findByStatus(status: ReceiptStatus, userId: string): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { status, userId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Count receipts
   */
  async count(filters: ReceiptFilters = {}, userId?: string): Promise<number> {
    const where: FindOptionsWhere<Receipt> = {};

    // Always filter by userId if provided
    if (userId) {
      where.userId = userId;
    }

    if (filters.storeName) {
      where.storeName = filters.storeName;
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

  /**
   * Normalize store name for comparison
   * - Removes leading "THE"
   * - Removes extra whitespace
   * - Converts to uppercase
   * - Removes special characters
   */
  private normalizeStoreName(storeName: string): string {
    return storeName
      .trim()
      .toUpperCase()
      .replace(/^THE\s+/i, '') // Remove leading "THE"
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  }

  /**
   * Check if a duplicate receipt exists for the user
   * A receipt is considered duplicate if:
   * - Same userId
   * - Same storeName (normalized, case-insensitive, ignoring "THE" prefix)
   * - Same receiptDate (same day)
   * - Same total amount (within 0.05 tolerance)
   *
   * For receipts with multiple categories, we check if the sum of all category totals
   * matches the sum of existing receipt totals for the same store and date.
   */
  async findDuplicate(
    userId: string,
    storeName: string,
    receiptDate: Date,
    total: number,
  ): Promise<Receipt | null> {
    // Normalize store name for comparison
    const normalizedStoreName = this.normalizeStoreName(storeName);
    console.log(
      `🔍 DUPLICATE CHECK START - Original Store: "${storeName}" → Normalized: "${normalizedStoreName}"`,
    );

    // Get start and end of the day for receiptDate
    const startOfDay = new Date(receiptDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(receiptDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all receipts with same userId, storeName, and date
    const receipts = await this.receiptRepository.find({
      where: {
        userId,
        receiptDate: Between(startOfDay, endOfDay),
      },
    });

    // Group receipts by normalized storeName and calculate sum of totals
    const receiptsByStore = new Map<string, { receipts: Receipt[]; sumTotal: number }>();

    for (const receipt of receipts) {
      // Normalize the receipt's store name for comparison
      const receiptStoreName = this.normalizeStoreName(receipt.storeName);

      // Compare normalized store names
      if (receiptStoreName === normalizedStoreName) {
        console.log(
          `  ✓ Match found - Receipt ID: ${receipt.id}, Original: "${receipt.storeName}" → Normalized: "${receiptStoreName}"`,
        );
        // Use normalized name as key to group similar store names together
        if (!receiptsByStore.has(receiptStoreName)) {
          receiptsByStore.set(receiptStoreName, { receipts: [], sumTotal: 0 });
        }

        const group = receiptsByStore.get(receiptStoreName)!;
        group.receipts.push(receipt);
        group.sumTotal += Number(receipt.total);
      } else {
        console.log(
          `  ✗ No match - Receipt ID: ${receipt.id}, Original: "${receipt.storeName}" → Normalized: "${receiptStoreName}" (looking for: "${normalizedStoreName}")`,
        );
      }
    }

    // Check if any group has a sum total that matches (within tolerance)
    for (const [storeNameKey, group] of receiptsByStore) {
      const totalDiff = Math.abs(group.sumTotal - total);
      const tolerance = 0.05; // 5 cents tolerance to account for OCR/LLM variations

      console.log(
        `🔍 DUPLICATE CHECK - Store: ${storeNameKey}, Existing Total: ${group.sumTotal}, New Total: ${total}, Diff: ${totalDiff}, Tolerance: ${tolerance}`,
      );

      if (totalDiff < tolerance) {
        console.log(
          `✅ DUPLICATE FOUND - Store: ${storeNameKey}, Date: ${receiptDate.toISOString()}, Total: ${total}, Existing Total: ${group.sumTotal}`,
        );
        // Return the first receipt from this group as the duplicate
        return group.receipts[0];
      }
    }

    console.log(
      `❌ NO DUPLICATE - Store: ${normalizedStoreName}, Date: ${receiptDate.toISOString()}, Total: ${total}`,
    );
    return null;
  }

  /**
   * DEBUG: Find all receipts without any filter (for debugging only)
   */
  async findAllDebug(): Promise<Receipt[]> {
    return this.receiptRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
