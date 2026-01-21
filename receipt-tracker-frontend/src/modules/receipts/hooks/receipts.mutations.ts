import { useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptsApi } from '../api/receipts.api';
import { receiptKeys } from './receipts.queries';
import type { Receipt } from '../types/receipt.types';

/**
 * Upload receipt image mutation
 */
export const useUploadReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => receiptsApi.upload(file),
    onSuccess: () => {
      // Invalidate all receipt lists to refetch after upload
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
};

/**
 * Create receipt manually mutation
 */
export const useCreateReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiptData: unknown) => receiptsApi.create(receiptData),
    onSuccess: () => {
      // Invalidate all receipt lists
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
};

/**
 * Update receipt mutation
 */
export const useUpdateReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => receiptsApi.update(id, data),
    onSuccess: (data: Receipt) => {
      // Invalidate specific receipt detail
      queryClient.invalidateQueries({ queryKey: receiptKeys.detail(data.id) });
      // Invalidate all receipt lists
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
};

/**
 * Delete receipt mutation
 */
export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => receiptsApi.delete(id),
    onSuccess: () => {
      // Invalidate all receipt lists
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
};
