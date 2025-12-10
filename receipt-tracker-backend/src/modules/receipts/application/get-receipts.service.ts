import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ReceiptsRepository,
  ReceiptFilters,
  PaginationOptions,
  PaginatedResult,
} from '../infrastructure/persistence/receipts.repository';
import { Receipt } from '../entities/receipt.entity';

/**
 * Service for getting receipts
 */
@Injectable()
export class GetReceiptsService {
  constructor(private readonly receiptsRepository: ReceiptsRepository) {}

  /**
   * Get all receipts with filters and pagination
   */
  async getAll(
    filters: ReceiptFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<Receipt>> {
    return this.receiptsRepository.findAll(filters, pagination);
  }

  /**
   * Get receipt by ID
   */
  async getById(id: string): Promise<Receipt> {
    const receipt = await this.receiptsRepository.findById(id);
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return receipt;
  }
}
