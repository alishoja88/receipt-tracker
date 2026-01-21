import { api } from '@/lib/api/api';
import { receiptsApi } from '@/modules/receipts/api/receipts.api';
import type {
  ExpensesSummary,
  MonthlyExpense,
  CategoryExpense,
  DailyExpense,
  ExpensesByStoreResponse,
  ExpensesByPaymentMethodResponse,
} from '../types/expenses.types';

/**
 * Get expenses summary with key metrics
 */
export const getExpensesSummary = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}): Promise<ExpensesSummary> => {
  // If categories filter is specified, fetch receipts and calculate summary locally
  if (params?.categories && params.categories.length > 0) {
    return getFilteredSummaryFromReceipts(params);
  }

  return api.get<ExpensesSummary>('/api/expenses/summary', {
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
  });
};

/**
 * Helper function to calculate summary from filtered receipts
 */
const getFilteredSummaryFromReceipts = async (params: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}): Promise<ExpensesSummary> => {
  const receiptsData = await receiptsApi.getAll({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    limit: 10000, // Get all receipts in range
  });

  let receipts = receiptsData.items || [];

  // Filter by categories if specified
  if (params.categories && params.categories.length > 0) {
    receipts = receipts.filter(
      (receipt: any) =>
        receipt.category && params.categories!.includes(receipt.category.toUpperCase()),
    );
  }

  // Calculate summary
  const totalSpent = receipts.reduce((sum: number, r: any) => sum + (r.total || 0), 0);
  const totalReceipts = receipts.length;
  const avgPerReceipt = totalReceipts > 0 ? totalSpent / totalReceipts : 0;

  // Find top category
  const categoryMap = new Map<string, number>();
  receipts.forEach((receipt: any) => {
    if (receipt.category) {
      const existing = categoryMap.get(receipt.category) || 0;
      categoryMap.set(receipt.category, existing + (receipt.total || 0));
    }
  });

  let topCategory: { id: string; name: string; total: number; percentage: number } | null = null;
  if (categoryMap.size > 0) {
    const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);
    const [topCatName, topCatTotal] = sortedCategories[0];
    topCategory = {
      id: topCatName,
      name: topCatName,
      total: topCatTotal,
      percentage: totalSpent > 0 ? (topCatTotal / totalSpent) * 100 : 0,
    };
  }

  // Calculate trends (simplified - comparing with previous period)
  const dateFrom = params.dateFrom ? new Date(params.dateFrom) : new Date('1970-01-01');
  const dateTo = params.dateTo ? new Date(params.dateTo) : new Date();
  const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));

  // For trends, we'd need to fetch previous period data, but for now return 0
  const trends = {
    thisMonth: totalSpent,
    lastMonth: 0,
    change: 0,
    changePercentage: 0,
  };

  return {
    totalSpent,
    totalReceipts,
    totalItems: totalReceipts, // Simplified
    avgPerReceipt,
    avgPerItem: avgPerReceipt, // Simplified
    topStore: null,
    topCategory,
    dateRange: {
      from: params.dateFrom || '',
      to: params.dateTo || '',
      daysCount: daysDiff,
    },
    trends,
  };
};

/**
 * Get monthly expenses
 */
export const getMonthlyExpenses = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}): Promise<{ items: MonthlyExpense[]; summary: any }> => {
  // If categories filter is specified, we'd need to implement filtering
  // For now, just pass through to API (backend doesn't support category filter for monthly)
  return api.get<{ items: MonthlyExpense[]; summary: any }>('/api/expenses/monthly', {
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
  });
};

/**
 * Get expenses by category
 */
export const getExpensesByCategory = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}): Promise<{ items: CategoryExpense[]; summary: any }> => {
  // If categories filter is specified, fetch receipts and calculate locally
  if (params?.categories && params.categories.length > 0) {
    return getFilteredCategoryExpensesFromReceipts(params);
  }

  return api.get<{ items: CategoryExpense[]; summary: any }>('/api/expenses/by-category', {
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
  });
};

/**
 * Helper function to calculate category expenses from filtered receipts
 */
const getFilteredCategoryExpensesFromReceipts = async (params: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}): Promise<{ items: CategoryExpense[]; summary: any }> => {
  const receiptsData = await receiptsApi.getAll({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    limit: 10000,
  });

  let receipts = receiptsData.items || [];

  // Filter by categories if specified
  if (params.categories && params.categories.length > 0) {
    receipts = receipts.filter(
      (receipt: any) =>
        receipt.category && params.categories!.includes(receipt.category.toUpperCase()),
    );
  }

  const categoryMap = new Map<string, { total: number; count: number }>();
  receipts.forEach((receipt: any) => {
    if (receipt.category) {
      const existing = categoryMap.get(receipt.category) || { total: 0, count: 0 };
      categoryMap.set(receipt.category, {
        total: existing.total + (receipt.total || 0),
        count: existing.count + 1,
      });
    }
  });

  const totalSpent = receipts.reduce((sum: number, r: any) => sum + (r.total || 0), 0);
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
};

/**
 * Get daily expenses (for bar chart)
 * Note: This endpoint might not exist yet in backend, so we'll aggregate from receipts
 */
export const getDailyExpenses = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}): Promise<DailyExpense[]> => {
  // Always use receipts-based aggregation to ensure consistency with filters
  // This ensures that category filters work correctly and all receipts are included
  return getFilteredDailyExpensesFromReceipts(params);
};

/**
 * Helper function to calculate daily expenses from filtered receipts
 */
const getFilteredDailyExpensesFromReceipts = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}): Promise<DailyExpense[]> => {
  const receiptsData = await receiptsApi.getAll({
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    limit: 10000, // Get all receipts in range
  });

  let receipts = receiptsData.items || [];

  // Filter by categories if specified
  if (params?.categories && params.categories.length > 0) {
    receipts = receipts.filter(
      (receipt: any) =>
        receipt.category && params.categories!.includes(receipt.category.toUpperCase()),
    );
  }

  // Aggregate by date
  const dailyMap = new Map<string, { total: number; count: number }>();

  receipts.forEach((receipt: any) => {
    // Skip receipts without a valid date
    if (!receipt.receiptDate) {
      return;
    }

    // Handle date formatting - support both string and Date objects
    let date: string;
    if (receipt.receiptDate instanceof Date) {
      date = receipt.receiptDate.toISOString().split('T')[0];
    } else if (typeof receipt.receiptDate === 'string') {
      date = receipt.receiptDate.split('T')[0]; // Get YYYY-MM-DD
    } else {
      return; // Skip invalid date formats
    }

    // Ensure total is a number
    const receiptTotal =
      typeof receipt.total === 'number' ? receipt.total : parseFloat(receipt.total) || 0;

    const existing = dailyMap.get(date) || { total: 0, count: 0 };
    dailyMap.set(date, {
      total: existing.total + receiptTotal,
      count: existing.count + 1,
    });
  });

  // Convert to array and sort by date
  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      total: data.total,
      receiptsCount: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Get expenses by store
 */
export const getExpensesByStore = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  categories?: string[];
}): Promise<ExpensesByStoreResponse> => {
  // If categories filter is specified, fetch receipts and calculate locally
  if (params?.categories && params.categories.length > 0) {
    return getFilteredStoreExpensesFromReceipts(params);
  }

  return api.get<ExpensesByStoreResponse>('/api/expenses/by-store', {
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    limit: params?.limit || 10,
  });
};

/**
 * Helper function to calculate store expenses from filtered receipts
 */
const getFilteredStoreExpensesFromReceipts = async (params: {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  categories?: string[];
}): Promise<ExpensesByStoreResponse> => {
  const receiptsData = await receiptsApi.getAll({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    limit: 10000,
  });

  let receipts = receiptsData.items || [];

  // Filter by categories if specified
  if (params.categories && params.categories.length > 0) {
    receipts = receipts.filter(
      (receipt: any) =>
        receipt.category && params.categories!.includes(receipt.category.toUpperCase()),
    );
  }

  const storeMap = new Map<string, { total: number; count: number }>();
  receipts.forEach((receipt: any) => {
    const storeName = receipt.storeName || 'Unknown';
    const existing = storeMap.get(storeName) || { total: 0, count: 0 };
    storeMap.set(storeName, {
      total: existing.total + (receipt.total || 0),
      count: existing.count + 1,
    });
  });

  const totalSpent = receipts.reduce((sum: number, r: any) => sum + (r.total || 0), 0);
  const items = Array.from(storeMap.entries())
    .map(([storeName, data]) => ({
      storeName,
      total: data.total,
      receiptsCount: data.count,
      percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, params.limit || 10);

  return {
    items,
    summary: {
      totalSpent,
      totalStores: storeMap.size,
      totalReceipts: receipts.length,
    },
  };
};

/**
 * Get expenses by payment method
 */
export const getExpensesByPaymentMethod = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}): Promise<ExpensesByPaymentMethodResponse> => {
  // If categories filter is specified, fetch receipts and calculate locally
  if (params?.categories && params.categories.length > 0) {
    return getFilteredPaymentMethodExpensesFromReceipts(params);
  }

  return api.get<ExpensesByPaymentMethodResponse>('/api/expenses/by-payment-method', {
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
  });
};

/**
 * Helper function to calculate payment method expenses from filtered receipts
 */
const getFilteredPaymentMethodExpensesFromReceipts = async (params: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}): Promise<ExpensesByPaymentMethodResponse> => {
  const receiptsData = await receiptsApi.getAll({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    limit: 10000,
  });

  let receipts = receiptsData.items || [];

  // Filter by categories if specified
  if (params.categories && params.categories.length > 0) {
    receipts = receipts.filter(
      (receipt: any) =>
        receipt.category && params.categories!.includes(receipt.category.toUpperCase()),
    );
  }

  const paymentMethodMap = new Map<string, { total: number; count: number }>();
  receipts.forEach((receipt: any) => {
    const paymentMethod = receipt.paymentMethod || 'OTHER';
    const existing = paymentMethodMap.get(paymentMethod) || { total: 0, count: 0 };
    paymentMethodMap.set(paymentMethod, {
      total: existing.total + (receipt.total || 0),
      count: existing.count + 1,
    });
  });

  const totalSpent = receipts.reduce((sum: number, r: any) => sum + (r.total || 0), 0);
  const items = Array.from(paymentMethodMap.entries()).map(([paymentMethod, data]) => ({
    paymentMethod,
    total: data.total,
    receiptsCount: data.count,
    percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
  }));

  return {
    items,
    summary: {
      totalSpent,
    },
  };
};
