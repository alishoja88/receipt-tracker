import { Injectable } from '@nestjs/common';
import { StoresRepository } from '../infrastructure/persistence/stores.repository';
import { CreateStoreDto } from '../dto/create-store.dto';
import { Store } from '../entities/store.entity';
import { SharedStoreService } from './shared-store.service';

/**
 * Service for creating stores
 */
@Injectable()
export class CreateStoreService {
  constructor(
    private readonly storesRepository: StoresRepository,
    private readonly sharedStoreService: SharedStoreService,
  ) {}

  /**
   * Create a new store
   */
  async execute(dto: CreateStoreDto): Promise<Store> {
    // 1. Find or create category (if provided)
    let categoryId: string | null = null;
    if (dto.categoryName) {
      const category = await this.sharedStoreService.findOrCreateCategory(dto.categoryName);
      categoryId = category.id;
    }

    // 2. Check if store already exists
    const existingStore = await this.storesRepository.findByName(dto.name);
    if (existingStore) {
      // Update existing store if new info provided
      if (dto.address !== undefined || dto.phone !== undefined || categoryId) {
        const updateData: Partial<Store> = {};
        if (dto.address !== undefined) updateData.address = dto.address || null;
        if (dto.phone !== undefined) updateData.phone = dto.phone || null;
        if (categoryId) updateData.categoryId = categoryId;

        return this.storesRepository.update(existingStore.id, updateData);
      }
      return existingStore;
    }

    // 3. Create new store
    const store = new Store();
    store.name = dto.name;
    store.address = dto.address || null;
    store.phone = dto.phone || null;
    store.categoryId = categoryId;

    return this.storesRepository.create(store);
  }
}
