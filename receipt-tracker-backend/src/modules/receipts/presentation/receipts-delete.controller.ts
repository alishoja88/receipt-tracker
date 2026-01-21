import { Controller, Delete, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '../../auth/presentation';
import { DeleteReceiptService } from '../application/delete-receipt.service';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsDeleteController {
  constructor(private readonly deleteReceiptService: DeleteReceiptService) {}

  /**
   * Delete receipt
   * DELETE /api/receipts/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReceipt(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; email: string },
  ): Promise<void> {
    await this.deleteReceiptService.execute(id, user.userId);
  }
}
