import { Controller, Put, Param, Body } from '@nestjs/common';
import { UpdateStoreService } from '../application/update-store.service';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { StoreResponseDto } from '../dto/store-response.dto';
import { StoreMapper } from './store-mapper.helper';

@Controller('stores')
export class StoresPutController {
  constructor(private readonly updateStoreService: UpdateStoreService) {}

  /**
   * Update store
   * PUT /api/stores/:id
   */
  @Put(':id')
  async updateStore(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<StoreResponseDto> {
    const store = await this.updateStoreService.execute(id, updateStoreDto);
    return StoreMapper.toResponseDto(store);
  }
}
