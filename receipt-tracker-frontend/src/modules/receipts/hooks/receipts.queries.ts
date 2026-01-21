import { useQuery } from '@tanstack/react-query';
import { receiptsApi } from '../api/receipts.api';
import type { ReceiptFilters } from '../types/receipt.types';

/**
 * Query keys for receipts
 */
export const receiptKeys = {
  all: ['receipts'] as const,
  lists: () => [...receiptKeys.all, 'list'] as const,
  list: (filters: ReceiptFilters) => [...receiptKeys.lists(), filters] as const,
  details: () => [...receiptKeys.all, 'detail'] as const,
  detail: (id: string) => [...receiptKeys.details(), id] as const,
};

/**
 * Get all receipts with filters and pagination
 */
export const useReceipts = (filters: ReceiptFilters = {}) => {
  return useQuery({
    queryKey: receiptKeys.list(filters),
    queryFn: () => receiptsApi.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds - reduced for fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get receipt by ID
 */
export const useReceipt = (id: string) => {
  return useQuery({
    queryKey: receiptKeys.detail(id),
    queryFn: () => receiptsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
