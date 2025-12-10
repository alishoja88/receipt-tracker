import { Controller, Put, Param, Body } from '@nestjs/common';
import { UpdateReceiptService } from '../application/update-receipt.service';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { ReceiptResponseDto } from '../dto/receipt-response.dto';
import { ReceiptMapper } from './receipt-mapper.helper';

@Controller('receipts')
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
  ): Promise<ReceiptResponseDto> {
    const receipt = await this.updateReceiptService.execute(id, updateReceiptDto);
    return ReceiptMapper.toResponseDto(receipt);
  }
}
