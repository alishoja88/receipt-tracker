import { api } from '@/lib/api/api';
import type {
  Receipt,
  ReceiptFilters,
  PaginatedResponse,
  ReceiptListItem,
} from '../types/receipt.types';

export const receiptsApi = {
  /**
   * Get all receipts with filters and pagination
   */
  getAll: async (filters: ReceiptFilters = {}): Promise<PaginatedResponse<ReceiptListItem>> => {
    console.log('🟢 FRONTEND API - Calling /api/receipts with filters:', filters);
    const data = await api.get<PaginatedResponse<ReceiptListItem>>('/api/receipts', filters);
    console.log('🟢 FRONTEND API - Response from backend:', {
      itemsCount: data?.items?.length,
      totalItems: data?.pagination?.totalItems,
      items: data?.items?.map((r: any) => ({
        id: r.id,
        storeName: r.storeName,
        total: r.total,
        receiptDate: r.receiptDate,
        category: r.category,
      })),
      pagination: data?.pagination,
    });
    return data;
  },

  /**
   * Get receipt by ID
   */
  getById: async (id: string): Promise<Receipt> => {
    return api.get<Receipt>(`/api/receipts/${id}`);
  },

  /**
   * Upload receipt image
   * Returns array of receipts (one per category)
   */
  upload: async (file: File): Promise<Receipt[]> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<Receipt[]>('/api/receipts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Create receipt manually
   */
  create: async (receiptData: unknown): Promise<Receipt> => {
    return api.post<Receipt>('/api/receipts/create', receiptData);
  },

  /**
   * Update receipt
   */
  update: async (id: string, receiptData: unknown): Promise<Receipt> => {
    return api.put<Receipt>(`/api/receipts/${id}`, receiptData);
  },

  /**
   * Delete receipt
   */
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(`/api/receipts/${id}`);
  },
};
