export class ExpensesSummaryDto {
  totalSpent: number;
  totalReceipts: number;
  totalItems: number;
  avgPerReceipt: number;
  avgPerItem: number;
  topStore: {
    id: string;
    name: string;
    total: number;
    percentage: number;
  } | null;
  topCategory: {
    id: string;
    name: string;
    total: number;
    percentage: number;
  } | null;
  dateRange: {
    from: string;
    to: string;
    daysCount: number;
  };
  trends: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    changePercentage: number;
  };
}

export class CategoryExpenseDto {
  categoryId: string;
  categoryName: string;
  total: number;
  itemsCount: number;
  receiptsCount: number;
  percentage: number;
}

export class ExpensesByCategoryResponseDto {
  items: CategoryExpenseDto[];
  summary: {
    totalSpent: number;
    totalItems: number;
    totalReceipts: number;
  };
}

export class DailyExpenseDto {
  date: string;
  total: number;
  receiptsCount: number;
}

export class DailyExpensesResponseDto {
  items: DailyExpenseDto[];
}

export class StoreExpenseDto {
  storeName: string;
  total: number;
  receiptsCount: number;
  percentage: number;
}

export class ExpensesByStoreResponseDto {
  items: StoreExpenseDto[];
  summary: {
    totalSpent: number;
    totalStores: number;
    totalReceipts: number;
  };
}

export class PaymentMethodExpenseDto {
  paymentMethod: string;
  total: number;
  receiptsCount: number;
  percentage: number;
}

export class ExpensesByPaymentMethodResponseDto {
  items: PaymentMethodExpenseDto[];
  summary: {
    totalSpent: number;
  };
}
