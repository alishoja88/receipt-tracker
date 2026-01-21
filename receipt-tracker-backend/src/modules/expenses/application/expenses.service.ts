import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Receipt } from '../../receipts/entities/receipt.entity';
import {
  ExpensesSummaryDto,
  ExpensesByCategoryResponseDto,
  DailyExpensesResponseDto,
  ExpensesByStoreResponseDto,
  ExpensesByPaymentMethodResponseDto,
} from '../dto/expenses-summary.dto';
import { formatDateToISO } from '../../common/utils/date.util';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
  ) {}

  async getSummary(
    userId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ExpensesSummaryDto> {
    const whereConditions: any = { userId };

    if (dateFrom && dateTo) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date('2100-01-01'));
    } else if (dateTo) {
      whereConditions.receiptDate = Between(new Date('1900-01-01'), new Date(dateTo));
    }

    // Get all receipts
    const receipts = await this.receiptRepository.find({
      where: whereConditions,
      order: { createdAt: 'ASC' },
    });

    // Group receipts by storeName + receiptDate + createdAt (within 2 seconds)
    // This identifies receipts that came from the same original receipt image
    const receiptGroups = new Map<string, Receipt[]>();

    receipts.forEach(receipt => {
      const dateKey = new Date(receipt.receiptDate).toISOString().split('T')[0];
      const storeKey = receipt.storeName.toLowerCase().trim();

      // Try to find existing group for this store+date combination
      let foundGroup = false;
      for (const [groupKey, groupReceipts] of receiptGroups.entries()) {
        const [groupStore, groupDate] = groupKey.split('|');
        if (groupStore === storeKey && groupDate === dateKey) {
          // Check if this receipt was created within 2 seconds of any receipt in this group
          const receiptTime = new Date(receipt.createdAt).getTime();
          const groupTimes = groupReceipts.map(r => new Date(r.createdAt).getTime());
          const minGroupTime = Math.min(...groupTimes);
          const maxGroupTime = Math.max(...groupTimes);

          // If receipt is within 2 seconds of the group, add it to the group
          if (
            Math.abs(receiptTime - minGroupTime) < 2000 ||
            Math.abs(receiptTime - maxGroupTime) < 2000
          ) {
            groupReceipts.push(receipt);
            foundGroup = true;
            break;
          }
        }
      }

      // If no group found, create a new one
      if (!foundGroup) {
        const groupKey = `${storeKey}|${dateKey}`;
        receiptGroups.set(groupKey, [receipt]);
      }
    });

    // Calculate total spent: sum of totals from each group
    // This ensures we count each original receipt only once
    // If a group has multiple receipts, they came from one original receipt split by categories
    // So we sum all receipts in the group to get the original total
    let totalSpent = 0;
    let totalReceiptGroups = 0;

    for (const groupReceipts of receiptGroups.values()) {
      // Sum all receipts in the group (whether 1 or multiple)
      // Multiple receipts = one original receipt split by categories
      const groupTotal = groupReceipts.reduce((sum, r) => sum + Number(r.total || 0), 0);
      totalSpent += groupTotal;
      totalReceiptGroups += 1; // Count as one original receipt
    }

    const totalReceipts = totalReceiptGroups; // Number of original receipts (groups)
    const avgPerReceipt = totalReceiptGroups > 0 ? totalSpent / totalReceiptGroups : 0;

    // Calculate top store
    const storeMap = new Map<string, { name: string; total: number }>();
    receipts.forEach(receipt => {
      if (receipt.storeName) {
        const storeName = receipt.storeName;
        const existing = storeMap.get(storeName) || { name: storeName, total: 0 };
        storeMap.set(storeName, {
          name: existing.name,
          total: existing.total + (receipt.total || 0),
        });
      }
    });

    let topStore: { id: string; name: string; total: number; percentage: number } | null = null;
    let maxStoreTotal = 0;
    storeMap.forEach((value, key) => {
      if (value.total > maxStoreTotal) {
        maxStoreTotal = value.total;
        topStore = {
          id: key,
          name: value.name,
          total: value.total,
          percentage: totalSpent > 0 ? (value.total / totalSpent) * 100 : 0,
        };
      }
    });

    // Calculate top category
    const categoryMap = new Map<string, number>();
    receipts.forEach(receipt => {
      if (receipt.category) {
        const existing = categoryMap.get(receipt.category) || 0;
        categoryMap.set(receipt.category, existing + (receipt.total || 0));
      }
    });

    let topCategory: { id: string; name: string; total: number; percentage: number } | null = null;
    let maxCategoryTotal = 0;
    categoryMap.forEach((total, category) => {
      if (total > maxCategoryTotal) {
        maxCategoryTotal = total;
        topCategory = {
          id: category,
          name: category,
          total: total,
          percentage: totalSpent > 0 ? (total / totalSpent) * 100 : 0,
        };
      }
    });

    // Calculate date range
    const dates = receipts.map(r => new Date(r.receiptDate).getTime()).filter(d => !isNaN(d));
    const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
    const daysCount = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate trends (this month vs last month) using receipt groups
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let thisMonth = 0;
    let lastMonth = 0;

    for (const groupReceipts of receiptGroups.values()) {
      // Get the receipt date from the first receipt in the group
      const groupDate = new Date(groupReceipts[0].receiptDate);
      const groupTotal = groupReceipts.reduce((sum, r) => sum + Number(r.total || 0), 0);

      if (groupDate >= thisMonthStart && groupDate <= thisMonthEnd) {
        thisMonth += groupTotal;
      } else if (groupDate >= lastMonthStart && groupDate <= lastMonthEnd) {
        lastMonth += groupTotal;
      }
    }

    const change = thisMonth - lastMonth;
    const changePercentage = lastMonth > 0 ? (change / lastMonth) * 100 : 0;

    return {
      totalSpent,
      totalReceipts,
      totalItems: totalReceipts, // Assuming 1 receipt = 1 item for now
      avgPerReceipt,
      avgPerItem: avgPerReceipt,
      topStore,
      topCategory,
      dateRange: {
        from: minDate.toISOString().split('T')[0],
        to: maxDate.toISOString().split('T')[0],
        daysCount,
      },
      trends: {
        thisMonth,
        lastMonth,
        change,
        changePercentage,
      },
    };
  }

  async getByCategory(
    userId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ExpensesByCategoryResponseDto> {
    const whereConditions: any = { userId };

    if (dateFrom && dateTo) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date('2100-01-01'));
    } else if (dateTo) {
      whereConditions.receiptDate = Between(new Date('1900-01-01'), new Date(dateTo));
    }

    const receipts = await this.receiptRepository.find({
      where: whereConditions,
    });

    const categoryMap = new Map<string, { total: number; count: number }>();
    receipts.forEach(receipt => {
      if (receipt.category) {
        const existing = categoryMap.get(receipt.category) || { total: 0, count: 0 };
        categoryMap.set(receipt.category, {
          total: existing.total + (receipt.total || 0),
          count: existing.count + 1,
        });
      }
    });

    const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
    const items = Array.from(categoryMap.entries()).map(([category, data]) => ({
      categoryId: category,
      categoryName: category,
      total: data.total,
      itemsCount: data.count,
      receiptsCount: data.count,
      percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
    }));

    return {
      items,
      summary: {
        totalSpent,
        totalItems: receipts.length,
        totalReceipts: receipts.length,
      },
    };
  }

  async getDaily(
    userId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<DailyExpensesResponseDto> {
    const whereConditions: any = { userId };

    if (dateFrom && dateTo) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date('2100-01-01'));
    } else if (dateTo) {
      whereConditions.receiptDate = Between(new Date('1900-01-01'), new Date(dateTo));
    }

    const receipts = await this.receiptRepository.find({
      where: whereConditions,
      order: { receiptDate: 'ASC' },
    });

    const dailyMap = new Map<string, { total: number; count: number }>();
    receipts.forEach(receipt => {
      // Use formatDateToISO to avoid timezone conversion issues
      const date =
        receipt.receiptDate instanceof Date
          ? formatDateToISO(receipt.receiptDate)
          : receipt.receiptDate;
      const existing = dailyMap.get(date) || { total: 0, count: 0 };
      dailyMap.set(date, {
        total: existing.total + (receipt.total || 0),
        count: existing.count + 1,
      });
    });

    const items = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        total: data.total,
        receiptsCount: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { items };
  }

  async getByStore(
    userId: string,
    dateFrom?: string,
    dateTo?: string,
    limit: number = 10,
  ): Promise<ExpensesByStoreResponseDto> {
    const whereConditions: any = { userId };

    if (dateFrom && dateTo) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date('2100-01-01'));
    } else if (dateTo) {
      whereConditions.receiptDate = Between(new Date('1900-01-01'), new Date(dateTo));
    }

    const receipts = await this.receiptRepository.find({
      where: whereConditions,
    });

    // Group receipts by storeName + receiptDate + createdAt (within 2 seconds)
    const receiptGroups = new Map<string, Receipt[]>();

    receipts.forEach(receipt => {
      const dateKey = new Date(receipt.receiptDate).toISOString().split('T')[0];
      const storeKey = receipt.storeName.toLowerCase().trim();

      let foundGroup = false;
      for (const [groupKey, groupReceipts] of receiptGroups.entries()) {
        const [groupStore, groupDate] = groupKey.split('|');
        if (groupStore === storeKey && groupDate === dateKey) {
          const receiptTime = new Date(receipt.createdAt).getTime();
          const groupTimes = groupReceipts.map(r => new Date(r.createdAt).getTime());
          const minGroupTime = Math.min(...groupTimes);
          const maxGroupTime = Math.max(...groupTimes);

          if (
            Math.abs(receiptTime - minGroupTime) < 2000 ||
            Math.abs(receiptTime - maxGroupTime) < 2000
          ) {
            groupReceipts.push(receipt);
            foundGroup = true;
            break;
          }
        }
      }

      if (!foundGroup) {
        const groupKey = `${storeKey}|${dateKey}`;
        receiptGroups.set(groupKey, [receipt]);
      }
    });

    // Calculate totals per store (using groups)
    const storeMap = new Map<string, { name: string; total: number; count: number }>();

    for (const groupReceipts of receiptGroups.values()) {
      const storeName = groupReceipts[0].storeName;
      const groupTotal = groupReceipts.reduce((sum, r) => sum + Number(r.total || 0), 0);

      const existing = storeMap.get(storeName) || { name: storeName, total: 0, count: 0 };
      storeMap.set(storeName, {
        name: existing.name,
        total: existing.total + groupTotal,
        count: existing.count + 1,
      });
    }

    const totalSpent = Array.from(storeMap.values()).reduce((sum, s) => sum + s.total, 0);

    const items = Array.from(storeMap.entries())
      .map(([storeName, data]) => ({
        storeName,
        total: data.total,
        receiptsCount: data.count,
        percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    return {
      items,
      summary: {
        totalSpent,
        totalStores: items.length,
        totalReceipts: receipts.length,
      },
    };
  }

  async getByPaymentMethod(
    userId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ExpensesByPaymentMethodResponseDto> {
    const whereConditions: any = { userId };

    if (dateFrom && dateTo) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      whereConditions.receiptDate = Between(new Date(dateFrom), new Date('2100-01-01'));
    } else if (dateTo) {
      whereConditions.receiptDate = Between(new Date('1900-01-01'), new Date(dateTo));
    }

    const receipts = await this.receiptRepository.find({
      where: whereConditions,
    });

    // Group receipts by storeName + receiptDate + createdAt (within 2 seconds)
    const receiptGroups = new Map<string, Receipt[]>();

    receipts.forEach(receipt => {
      const dateKey = new Date(receipt.receiptDate).toISOString().split('T')[0];
      const storeKey = receipt.storeName.toLowerCase().trim();

      let foundGroup = false;
      for (const [groupKey, groupReceipts] of receiptGroups.entries()) {
        const [groupStore, groupDate] = groupKey.split('|');
        if (groupStore === storeKey && groupDate === dateKey) {
          const receiptTime = new Date(receipt.createdAt).getTime();
          const groupTimes = groupReceipts.map(r => new Date(r.createdAt).getTime());
          const minGroupTime = Math.min(...groupTimes);
          const maxGroupTime = Math.max(...groupTimes);

          if (
            Math.abs(receiptTime - minGroupTime) < 2000 ||
            Math.abs(receiptTime - maxGroupTime) < 2000
          ) {
            groupReceipts.push(receipt);
            foundGroup = true;
            break;
          }
        }
      }

      if (!foundGroup) {
        const groupKey = `${storeKey}|${dateKey}`;
        receiptGroups.set(groupKey, [receipt]);
      }
    });

    // Calculate totals per payment method (using groups)
    const paymentMethodMap = new Map<string, { total: number; count: number }>();

    for (const groupReceipts of receiptGroups.values()) {
      const paymentMethod = groupReceipts[0].paymentMethod || 'OTHER';
      const groupTotal = groupReceipts.reduce((sum, r) => sum + Number(r.total || 0), 0);

      const existing = paymentMethodMap.get(paymentMethod) || { total: 0, count: 0 };
      paymentMethodMap.set(paymentMethod, {
        total: existing.total + groupTotal,
        count: existing.count + 1,
      });
    }

    const totalSpent = Array.from(paymentMethodMap.values()).reduce((sum, p) => sum + p.total, 0);

    const items = Array.from(paymentMethodMap.entries())
      .map(([paymentMethod, data]) => ({
        paymentMethod,
        total: data.total,
        receiptsCount: data.count,
        percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      items,
      summary: {
        totalSpent,
      },
    };
  }
}
