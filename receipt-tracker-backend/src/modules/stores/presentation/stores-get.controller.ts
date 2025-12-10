import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetStoresService } from '../application/get-stores.service';
import { StoreResponseDto } from '../dto/store-response.dto';
import { StoreFilters, PaginationOptions } from '../infrastructure/persistence/stores.repository';
import { StoreMapper } from './store-mapper.helper';

@Controller('stores')
export class StoresGetController {
  constructor(private readonly getStoresService: GetStoresService) {}

  /**
   * Get all stores with filters and pagination
   * GET /api/stores
   */
  @Get()
  async getStores(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('name') name?: string,
  ) {
    const filters: StoreFilters = {
      categoryId,
      name,
    };

    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    const result = await this.getStoresService.getAll(filters, pagination);

    return {
      items: result.items.map(store => StoreMapper.toListItemDto(store)),
      pagination: result.pagination,
    };
  }

  /**
   * Get store by ID
   * GET /api/stores/:id
   */
  @Get(':id')
  async getStoreById(@Param('id') id: string): Promise<StoreResponseDto> {
    const store = await this.getStoresService.getById(id);
    return StoreMapper.toResponseDto(store);
  }
}
