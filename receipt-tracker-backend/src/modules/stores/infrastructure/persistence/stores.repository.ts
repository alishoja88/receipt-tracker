import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Store } from '../../entities/store.entity';

export interface StoreFilters {
  categoryId?: string;
  name?: string;
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
export class StoresRepository {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  /**
   * Create a new store
   */
  async create(store: Store): Promise<Store> {
    return this.storeRepository.save(store);
  }

  /**
   * Find store by ID with relations
   */
  async findById(id: string): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  /**
   * Find all stores with filters and pagination
   */
  async findAll(
    filters: StoreFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<Store>> {
    const { page = 1, limit = 20 } = pagination;

    const where: FindOptionsWhere<Store> = {};

    // Apply filters
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.name) {
      where.name = filters.name;
    }

    // Get total count
    const totalItems = await this.storeRepository.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    // Get paginated results
    const items = await this.storeRepository.find({
      where,
      relations: ['category'],
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
   * Find store by name
   */
  async findByName(name: string): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { name },
      relations: ['category'],
    });
  }

  /**
   * Update store
   */
  async update(id: string, data: Partial<Store>): Promise<Store> {
    await this.storeRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Store with ID ${id} not found after update`);
    }
    return updated;
  }

  /**
   * Delete store
   */
  async delete(id: string): Promise<void> {
    await this.storeRepository.delete(id);
  }

  /**
   * Count stores
   */
  async count(filters: StoreFilters = {}): Promise<number> {
    const where: FindOptionsWhere<Store> = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.name) {
      where.name = filters.name;
    }

    return this.storeRepository.count({ where });
  }
}
