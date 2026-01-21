import { Controller, Put, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '../../auth/presentation';
import { UpdateReceiptService } from '../application/update-receipt.service';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { ReceiptResponseDto } from '../dto/receipt-response.dto';
import { ReceiptMapper } from './receipt-mapper.helper';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsPutController {
  constructor(private readonly updateReceiptService: UpdateReceiptService) {}

  /**
   * Update receipt
   * PUT /api/receipts/:id
   */
  @Put(':id')
  async updateReceipt(
    @Param('id') id: string,
    @Body() updateReceiptDto: UpdateReceiptDto,
    @CurrentUser() user: { userId: string; email: string },
  ): Promise<ReceiptResponseDto> {
    const receipt = await this.updateReceiptService.execute(id, updateReceiptDto, user.userId);
    return ReceiptMapper.toResponseDto(receipt);
  }
}
