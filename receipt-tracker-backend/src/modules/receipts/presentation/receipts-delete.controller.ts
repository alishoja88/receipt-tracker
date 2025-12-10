import { Controller, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { DeleteReceiptService } from '../application/delete-receipt.service';

@Controller('receipts')
export class ReceiptsDeleteController {
  constructor(private readonly deleteReceiptService: DeleteReceiptService) {}

  /**
   * Delete receipt
   * DELETE /api/receipts/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReceipt(@Param('id') id: string): Promise<void> {
    await this.deleteReceiptService.execute(id);
  }
}
