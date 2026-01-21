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
    console.log('🟡 BACKEND CONTROLLER - getReceipts called:', {
      userId: user.userId,
      userEmail: user.email,
      page,
      limit,
      filters: { dateFrom, dateTo, storeName, status, category, paymentMethod },
    });

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

    console.log('🟡 BACKEND CONTROLLER - Result from service:', {
      itemsCount: result.items.length,
      totalItems: result.pagination.totalItems,
      items: result.items.map(r => ({
        id: r.id,
        userId: r.userId,
        storeName: r.storeName,
        total: r.total,
        receiptDate: r.receiptDate,
        category: r.category,
      })),
      pagination: result.pagination,
    });

    const response = {
      items: result.items.map(receipt => ReceiptMapper.toListItemDto(receipt)),
      pagination: result.pagination,
    };

    console.log('🟡 BACKEND CONTROLLER - Sending response to frontend:', {
      itemsCount: response.items.length,
      totalItems: response.pagination.totalItems,
      items: response.items.map((r: any) => ({
        id: r.id,
        storeName: r.storeName,
        total: r.total,
        receiptDate: r.receiptDate,
        category: r.category,
      })),
    });

    return response;
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

  /**
   * DEBUG: Get all receipts without user filter (for debugging only)
   * GET /api/receipts/debug/all
   * Note: This endpoint requires authentication
   */
  @Get('debug/all')
  @UseGuards(JwtAuthGuard)
  async getAllReceiptsDebug(@CurrentUser() user: { userId: string; email: string }) {
    console.log('🔵 DEBUG ENDPOINT - Current user:', {
      userId: user.userId,
      email: user.email,
    });

    const allReceipts = await this.getReceiptsService.getAllDebug();
    const userReceipts = await this.getReceiptsService.getAll({}, {}, user.userId);

    return {
      currentUser: {
        userId: user.userId,
        email: user.email,
      },
      allReceiptsInDatabase: {
        count: allReceipts.length,
        receipts: allReceipts.map(r => ({
          id: r.id,
          userId: r.userId,
          storeName: r.storeName,
          total: r.total,
          receiptDate: r.receiptDate,
          category: r.category,
          createdAt: r.createdAt,
        })),
      },
      userReceipts: {
        count: userReceipts.items.length,
        receipts: userReceipts.items.map(r => ({
          id: r.id,
          userId: r.userId,
          storeName: r.storeName,
          total: r.total,
          receiptDate: r.receiptDate,
          category: r.category,
        })),
      },
      receiptsWithoutUserId: {
        count: allReceipts.filter(r => !r.userId).length,
        receipts: allReceipts
          .filter(r => !r.userId)
          .map(r => ({
            id: r.id,
            userId: r.userId,
            storeName: r.storeName,
            total: r.total,
            receiptDate: r.receiptDate,
            category: r.category,
          })),
      },
    };
  }
}
