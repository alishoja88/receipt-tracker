import { Injectable, NotFoundException } from '@nestjs/common';
import {
  StoresRepository,
  StoreFilters,
  PaginationOptions,
  PaginatedResult,
} from '../infrastructure/persistence/stores.repository';
import { Store } from '../entities/store.entity';

/**
 * Service for getting stores
 */
@Injectable()
export class GetStoresService {
  constructor(private readonly storesRepository: StoresRepository) {}

  /**
   * Get all stores with filters and pagination
   */
  async getAll(
    filters: StoreFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<Store>> {
    return this.storesRepository.findAll(filters, pagination);
  }

  /**
   * Get store by ID
   */
  async getById(id: string): Promise<Store> {
    const store = await this.storesRepository.findById(id);
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }
}
