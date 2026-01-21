export interface MonthlyExpense {
  month: string;
  year: number;
  monthName: string;
  total: number;
  receiptsCount: number;
  itemsCount: number;
  avgPerReceipt: number;
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  total: number;
  itemsCount: number;
  receiptsCount: number;
  percentage: number;
}

export interface ExpensesSummary {
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

export interface DailyExpense {
  date: string;
  total: number;
  receiptsCount: number;
}

export interface StoreExpense {
  storeName: string;
  total: number;
  receiptsCount: number;
  percentage: number;
}

export interface ExpensesByStoreResponse {
  items: StoreExpense[];
  summary: {
    totalSpent: number;
    totalStores: number;
    totalReceipts: number;
  };
}

export interface PaymentMethodExpense {
  paymentMethod: string;
  total: number;
  receiptsCount: number;
  percentage: number;
}

export interface ExpensesByPaymentMethodResponse {
  items: PaymentMethodExpense[];
  summary: {
    totalSpent: number;
  };
}
