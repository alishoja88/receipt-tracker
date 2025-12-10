import { Injectable, NotFoundException } from '@nestjs/common';
import { StoresRepository } from '../infrastructure/persistence/stores.repository';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { Store } from '../entities/store.entity';
import { SharedStoreService } from './shared-store.service';

/**
 * Service for updating stores
 */
@Injectable()
export class UpdateStoreService {
  constructor(
    private readonly storesRepository: StoresRepository,
    private readonly sharedStoreService: SharedStoreService,
  ) {}

  /**
   * Update store
   */
  async execute(id: string, dto: UpdateStoreDto): Promise<Store> {
    // Check if store exists
    const existingStore = await this.storesRepository.findById(id);
    if (!existingStore) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    // 1. Handle category (if provided)
    let categoryId: string | null = existingStore.categoryId;
    if (dto.categoryName) {
      const category = await this.sharedStoreService.findOrCreateCategory(dto.categoryName);
      categoryId = category.id;
    }

    // 2. Update store
    const updateData: Partial<Store> = {
      name: dto.name,
      address: dto.address,
      phone: dto.phone,
      categoryId: categoryId,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    return this.storesRepository.update(id, updateData);
  }
}
