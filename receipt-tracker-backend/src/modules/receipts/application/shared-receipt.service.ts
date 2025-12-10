import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../entities/category.entity';

/**
 * Shared service for common receipt operations
 */
@Injectable()
export class SharedReceiptService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Find or create store
   */
  async findOrCreateStore(
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
  async findOrCreateCategory(name: string): Promise<Category> {
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
