import { Injectable, NotFoundException } from '@nestjs/common';
import { StoresRepository } from '../infrastructure/persistence/stores.repository';

/**
 * Service for deleting stores
 */
@Injectable()
export class DeleteStoreService {
  constructor(private readonly storesRepository: StoresRepository) {}

  /**
   * Delete store
   */
  async execute(id: string): Promise<void> {
    const store = await this.storesRepository.findById(id);
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    await this.storesRepository.delete(id);
  }
}
