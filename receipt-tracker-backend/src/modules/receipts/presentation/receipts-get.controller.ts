import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetReceiptsService } from '../application/get-receipts.service';
import { ReceiptResponseDto } from '../dto/receipt-response.dto';
import {
  ReceiptFilters,
  PaginationOptions,
} from '../infrastructure/persistence/receipts.repository';
import { ReceiptStatus } from '../entities/receipt.entity';
import { ReceiptMapper } from './receipt-mapper.helper';

@Controller('receipts')
export class ReceiptsGetController {
  constructor(private readonly getReceiptsService: GetReceiptsService) {}

  /**
   * Get all receipts with filters and pagination
   * GET /api/receipts
   */
  @Get()
  async getReceipts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('storeId') storeId?: string,
    @Query('status') status?: ReceiptStatus,
  ) {
    const filters: ReceiptFilters = {
      dateFrom,
      dateTo,
      storeId,
      status,
    };

    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    const result = await this.getReceiptsService.getAll(filters, pagination);

    return {
      items: result.items.map(receipt => ReceiptMapper.toListItemDto(receipt)),
      pagination: result.pagination,
    };
  }

  /**
   * Get receipt by ID
   * GET /api/receipts/:id
   */
  @Get(':id')
  async getReceiptById(@Param('id') id: string): Promise<ReceiptResponseDto> {
    const receipt = await this.getReceiptsService.getById(id);
    return ReceiptMapper.toResponseDto(receipt);
  }
}
