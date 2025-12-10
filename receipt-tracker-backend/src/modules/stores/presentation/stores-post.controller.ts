import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateStoreService } from '../application/create-store.service';
import { CreateStoreDto } from '../dto/create-store.dto';
import { StoreResponseDto } from '../dto/store-response.dto';
import { StoreMapper } from './store-mapper.helper';

@Controller('stores')
export class StoresPostController {
  constructor(private readonly createStoreService: CreateStoreService) {}

  /**
   * Create store
   * POST /api/stores
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStore(@Body() createStoreDto: CreateStoreDto): Promise<StoreResponseDto> {
    const store = await this.createStoreService.execute(createStoreDto);
    return StoreMapper.toResponseDto(store);
  }
}
