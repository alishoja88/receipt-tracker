import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '../../auth/presentation';
import { ExpensesService } from '../application/expenses.service';
import {
  ExpensesSummaryDto,
  ExpensesByCategoryResponseDto,
  DailyExpensesResponseDto,
  ExpensesByStoreResponseDto,
  ExpensesByPaymentMethodResponseDto,
} from '../dto/expenses-summary.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /**
   * Get expenses summary
   * GET /api/expenses/summary
   */
  @Get('summary')
  async getSummary(
    @CurrentUser() user: { userId: string; email: string },
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<ExpensesSummaryDto> {
    return this.expensesService.getSummary(user.userId, dateFrom, dateTo);
  }

  /**
   * Get expenses by category
   * GET /api/expenses/by-category
   */
  @Get('by-category')
  async getByCategory(
    @CurrentUser() user: { userId: string; email: string },
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<ExpensesByCategoryResponseDto> {
    return this.expensesService.getByCategory(user.userId, dateFrom, dateTo);
  }

  /**
   * Get daily expenses
   * GET /api/expenses/daily
   */
  @Get('daily')
  async getDaily(
    @CurrentUser() user: { userId: string; email: string },
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<DailyExpensesResponseDto> {
    return this.expensesService.getDaily(user.userId, dateFrom, dateTo);
  }

  /**
   * Get expenses by store
   * GET /api/expenses/by-store
   */
  @Get('by-store')
  async getByStore(
    @CurrentUser() user: { userId: string; email: string },
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ): Promise<ExpensesByStoreResponseDto> {
    return this.expensesService.getByStore(
      user.userId,
      dateFrom,
      dateTo,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /**
   * Get expenses by payment method
   * GET /api/expenses/by-payment-method
   */
  @Get('by-payment-method')
  async getByPaymentMethod(
    @CurrentUser() user: { userId: string; email: string },
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<ExpensesByPaymentMethodResponseDto> {
    return this.expensesService.getByPaymentMethod(user.userId, dateFrom, dateTo);
  }
}
