import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '../../auth/presentation';
import { GetReceiptsService } from '../application/get-receipts.service';
import { ReceiptResponseDto } from '../dto/receipt-response.dto';
import {
  ReceiptFilters,
  PaginationOptions,
} from '../infrastructure/persistence/receipts.repository';
import { ReceiptStatus } from '../entities/receipt.entity';
import { ReceiptMapper } from './receipt-mapper.helper';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsGetController {
  constructor(private readonly getReceiptsService: GetReceiptsService) {}

  /**
   * Get all receipts with filters and pagination
   * GET /api/receipts
   */
  @Get()
  async getReceipts(
    @CurrentUser() user: { userId: string; email: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('storeName') storeName?: string,
    @Query('status') status?: ReceiptStatus,
    @Query('category') category?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    const filters: ReceiptFilters = {
      dateFrom,
      dateTo,
      storeName,
      status,
      category,
      paymentMethod: paymentMethod as any,
    };

    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    const result = await this.getReceiptsService.getAll(filters, pagination, user.userId);

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
  async getReceiptById(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; email: string },
  ): Promise<ReceiptResponseDto> {
    const receipt = await this.getReceiptsService.getById(id, user.userId);
    return ReceiptMapper.toResponseDto(receipt);
  }
}
