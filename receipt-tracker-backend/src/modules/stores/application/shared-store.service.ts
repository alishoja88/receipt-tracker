import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';
import { Category } from '../../receipts/entities/category.entity';

/**
 * Shared service for common store operations
 */
@Injectable()
export class SharedStoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

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
