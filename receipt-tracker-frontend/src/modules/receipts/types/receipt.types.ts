export const ReceiptStatus = {
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
} as const;

export type ReceiptStatus = (typeof ReceiptStatus)[keyof typeof ReceiptStatus];

// Category is now a string (not an enum) - can be any value from LLM
export type ReceiptCategory = string;

export const PaymentMethod = {
  CARD: 'CARD',
  CASH: 'CASH',
  OTHER: 'OTHER',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface Receipt {
  id: string;
  storeName: string;
  receiptDate: string;
  category: string | null;
  paymentMethod: PaymentMethod | null;
  subtotal: number | null;
  tax: number | null;
  total: number;
  status: ReceiptStatus;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptListItem {
  id: string;
  storeName: string;
  receiptDate: string;
  total: number;
  status: ReceiptStatus;
  needsReview: boolean;
  createdAt: string;
  category?: string | null;
  paymentMethod?: PaymentMethod | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ReceiptFilters {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  storeName?: string;
  status?: ReceiptStatus;
  category?: string;
  paymentMethod?: PaymentMethod;
}
