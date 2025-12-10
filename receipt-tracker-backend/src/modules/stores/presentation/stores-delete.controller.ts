import { Controller, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { DeleteStoreService } from '../application/delete-store.service';

@Controller('stores')
export class StoresDeleteController {
  constructor(private readonly deleteStoreService: DeleteStoreService) {}

  /**
   * Delete store
   * DELETE /api/stores/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStore(@Param('id') id: string): Promise<void> {
    await this.deleteStoreService.execute(id);
  }
}
