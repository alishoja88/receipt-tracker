import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceiptsRepository } from '../infrastructure/persistence/receipts.repository';

/**
 * Service for deleting receipts
 */
@Injectable()
export class DeleteReceiptService {
  constructor(private readonly receiptsRepository: ReceiptsRepository) {}

  /**
   * Delete receipt
   */
  async execute(id: string, userId: string): Promise<void> {
    const receipt = await this.receiptsRepository.findById(id, userId);
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    await this.receiptsRepository.delete(id, userId);
  }
}
