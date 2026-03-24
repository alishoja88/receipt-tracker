import { useState, useMemo, useEffect } from 'react';
import {
  Trash2,
  Pencil,
  Check,
  X,
  ShoppingCart,
  UtensilsCrossed,
  ShoppingBag,
  Heart,
  Film,
  Car,
  Zap,
  GraduationCap,
  Receipt,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import type { ReceiptFilters, ReceiptListItem } from '@/modules/receipts/types/receipt.types';
import { useReceipts } from '@/modules/receipts/hooks/receipts.queries';
import { useDeleteReceipt, useUpdateReceipt } from '@/modules/receipts/hooks/receipts.mutations';
import { useReceiptEditing } from './hooks/useReceiptEditing';
import {
  DeleteDialog,
  ErrorDialog,
  ReceiptSort,
  ReceiptEditableField,
  ReceiptEditableSelect,
  Pagination,
} from './components';
import type { SortOption } from './components';
import { getCategoryLabel } from './utils/receiptUtils';
import { PaymentMethod } from '@/modules/receipts/types/receipt.types';
import { formatDateToISO, parseLocalDate, formatDate as formatDateUtil } from '@/utils/date.util';

const categoryMeta: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  GROCERY: { icon: ShoppingCart, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  RESTAURANT: { icon: UtensilsCrossed, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  SHOPPING: { icon: ShoppingBag, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  HEALTH: { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ENTERTAINMENT: { icon: Film, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  TRANSPORTATION: { icon: Car, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  UTILITIES: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  EDUCATION: { icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  OTHER: { icon: Receipt, color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

const getCategoryMeta = (category: string | null | undefined) => {
  if (!category) return categoryMeta.OTHER;
  const upper = category.toUpperCase();
  return categoryMeta[upper] || categoryMeta.OTHER;
};

interface ReceiptListProps {
  limit?: number;
  filters?: ReceiptFilters;
}

const ReceiptList = ({ limit = 10, filters = {} }: ReceiptListProps) => {
  const queryFilters: ReceiptFilters = {
    ...filters,
    limit: filters.limit || limit,
    page: filters.page || 1,
  };

  const { data, isLoading, error } = useReceipts({
    ...queryFilters,
    limit: 10000,
  });

  const deleteMutation = useDeleteReceipt();
  const updateMutation = useUpdateReceipt();

  const allReceipts = data?.items || [];

  const [sortOption, setSortOption] = useState<SortOption>('date-newest');
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    editingId,
    editedValues,
    hasUnsavedChanges,
    handleStartEdit,
    handleCancelEdit,
    handleFieldChange,
  } = useReceiptEditing();

  const getFieldValue = (
    receipt: ReceiptListItem,
    field: 'storeName' | 'receiptDate' | 'total' | 'paymentMethod' | 'category',
  ): string | number | null => {
    if (editingId === receipt.id && editedValues[receipt.id]?.[field] !== undefined) {
      return editedValues[receipt.id][field] as string | number | null;
    }
    if (field === 'paymentMethod' || field === 'category') {
      return receipt[field] || null;
    }
    return receipt[field] as string | number;
  };

  const handleSave = async (receipt: ReceiptListItem) => {
    const changes = editedValues[receipt.id];
    if (!changes || Object.keys(changes).length === 0) {
      return;
    }

    try {
      const updateData: any = {};

      if (changes.storeName !== undefined) {
        updateData.storeName = changes.storeName;
      }

      if (changes.receiptDate !== undefined) {
        updateData.receiptDate = formatDateToISO(parseLocalDate(changes.receiptDate as string));
      }

      if (changes.total !== undefined) {
        updateData.total = changes.total;
      }

      if (changes.paymentMethod !== undefined) {
        const paymentValue = changes.paymentMethod as string | null;
        if (paymentValue && typeof paymentValue === 'string' && paymentValue.trim() !== '') {
          updateData.paymentMethod = paymentValue;
        } else {
          updateData.paymentMethod = null;
        }
      }

      if (changes.category !== undefined) {
        const categoryValue = changes.category as string | null;
        if (categoryValue && typeof categoryValue === 'string' && categoryValue.trim() !== '') {
          updateData.category = categoryValue;
        } else {
          updateData.category = null;
        }
      }

      await updateMutation.mutateAsync({
        id: receipt.id,
        data: updateData,
      });

      handleCancelEdit(receipt.id);
    } catch (err) {
      console.error('Error updating receipt:', err);

      let errorMessage = 'Failed to update receipt';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String(err.message);
      }

      setErrorDialog({
        open: true,
        title: 'Error Updating Receipt',
        message: errorMessage,
      });
    }
  };

  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: '',
    message: '',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    receiptId: string | null;
  }>({
    open: false,
    receiptId: null,
  });

  const formatDate = (dateString: string): string => {
    return formatDateUtil(dateString, 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDateGroupLabel = (dateString: string): string => {
    const date = parseLocalDate(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const receiptDate = new Date(date);
    receiptDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - receiptDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = formatDateUtil(dateString, 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();

    if (diffDays === 0) {
      return `TODAY - ${formattedDate}`;
    } else if (diffDays === 1) {
      return `YESTERDAY - ${formattedDate}`;
    } else {
      return formattedDate;
    }
  };

  const getNumericTotal = (receipt: ReceiptListItem): number => {
    const total = receipt.total;
    if (typeof total === 'number') return total;
    if (typeof total === 'string') {
      const parsed = parseFloat(total);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const sortedAndGroupedReceipts = useMemo(() => {
    let sorted = [...allReceipts];

    if (sortOption === 'amount-high' || sortOption === 'amount-low') {
      sorted.sort((a, b) => {
        const totalA = getNumericTotal(a);
        const totalB = getNumericTotal(b);

        if (sortOption === 'amount-high') {
          return totalB - totalA;
        } else if (sortOption === 'amount-low') {
          return totalA - totalB;
        }
        return 0;
      });

      return [['', sorted]] as [string, ReceiptListItem[]][];
    }

    if (sortOption === 'date-newest' || sortOption === 'date-oldest') {
      sorted.sort((a, b) => {
        if (sortOption === 'date-newest') {
          return new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime();
        } else {
          return new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime();
        }
      });

      const grouped: { [key: string]: ReceiptListItem[] } = {};
      sorted.forEach(receipt => {
        const groupKey = getDateGroupLabel(receipt.receiptDate);
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(receipt);
      });

      Object.keys(grouped).forEach(groupKey => {
        grouped[groupKey].sort((a, b) => {
          if (sortOption === 'date-newest') {
            return new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime();
          } else {
            return new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime();
          }
        });
      });

      const sortedGroups = Object.entries(grouped).sort(([keyA, receiptsA], [keyB, receiptsB]) => {
        if (keyA.startsWith('TODAY')) return -1;
        if (keyB.startsWith('TODAY')) return 1;
        if (keyA.startsWith('YESTERDAY')) return -1;
        if (keyB.startsWith('YESTERDAY')) return 1;

        const dateA = new Date(receiptsA[0].receiptDate);
        const dateB = new Date(receiptsB[0].receiptDate);

        if (sortOption === 'date-oldest') {
          return dateA.getTime() - dateB.getTime();
        }
        return dateB.getTime() - dateA.getTime();
      });

      return sortedGroups;
    }

    const grouped: { [key: string]: ReceiptListItem[] } = {};
    sorted.forEach(receipt => {
      const groupKey = getDateGroupLabel(receipt.receiptDate);
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(receipt);
    });

    const sortedGroups = Object.entries(grouped).sort(([keyA, receiptsA], [keyB, receiptsB]) => {
      if (keyA.startsWith('TODAY')) return -1;
      if (keyB.startsWith('TODAY')) return 1;
      if (keyA.startsWith('YESTERDAY')) return -1;
      if (keyB.startsWith('YESTERDAY')) return 1;
      const dateA = new Date(receiptsA[0].receiptDate);
      const dateB = new Date(receiptsB[0].receiptDate);
      return dateB.getTime() - dateA.getTime();
    });

    return sortedGroups;
  }, [allReceipts, sortOption]);

  const allReceiptsFlat = useMemo(() => {
    return sortedAndGroupedReceipts.flatMap(([_, receipts]) => receipts);
  }, [sortedAndGroupedReceipts]);

  const totalPages = Math.ceil(allReceiptsFlat.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReceipts = allReceiptsFlat.slice(startIndex, endIndex);

  const paginatedAndGroupedReceipts = useMemo(() => {
    if (sortOption === 'amount-high' || sortOption === 'amount-low') {
      return [['', paginatedReceipts]] as [string, ReceiptListItem[]][];
    }

    const grouped: { [key: string]: ReceiptListItem[] } = {};
    paginatedReceipts.forEach(receipt => {
      const groupKey = getDateGroupLabel(receipt.receiptDate);
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(receipt);
    });

    return Object.entries(grouped).sort(([keyA, receiptsA], [keyB, receiptsB]) => {
      if (keyA.startsWith('TODAY')) return -1;
      if (keyB.startsWith('TODAY')) return 1;
      if (keyA.startsWith('YESTERDAY')) return -1;
      if (keyB.startsWith('YESTERDAY')) return 1;
      const dateA = new Date(receiptsA[0].receiptDate);
      const dateB = new Date(receiptsB[0].receiptDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [paginatedReceipts, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption, filters]);

  const handleSelectReceipt = (receiptId: string) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(receiptId)) {
      newSelected.delete(receiptId);
    } else {
      newSelected.add(receiptId);
    }
    setSelectedReceipts(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedReceipts.size === 0) return;
    setBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedReceipts);
    try {
      await Promise.all(ids.map(id => deleteMutation.mutateAsync(id)));
      setSelectedReceipts(new Set());
      setBulkDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting receipts:', err);
      setBulkDeleteDialog(false);
      setErrorDialog({
        open: true,
        title: 'Error Deleting Receipts',
        message: err instanceof Error ? err.message : 'Failed to delete receipts',
      });
    }
  };

  const handleDelete = (receiptId: string) => {
    setDeleteDialog({
      open: true,
      receiptId,
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.receiptId) return;

    try {
      await deleteMutation.mutateAsync(deleteDialog.receiptId);
      setDeleteDialog({ open: false, receiptId: null });
    } catch (err) {
      console.error('Error deleting receipt:', err);
      setDeleteDialog({ open: false, receiptId: null });
      setErrorDialog({
        open: true,
        title: 'Error Deleting Receipt',
        message: err instanceof Error ? err.message : 'Failed to delete receipt',
      });
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, receiptId: null });
  };

  const formatPaymentLabel = (method: string) => {
    if (method === PaymentMethod.CARD) return 'Credit Card';
    if (method === PaymentMethod.CASH) return 'Cash';
    return method;
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400">Loading receipts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-400">
          {error instanceof Error ? error.message : 'Failed to load receipts'}
        </p>
      </div>
    );
  }

  if (allReceipts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400">No receipts found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white sm:text-xl">Recent Receipts</h2>
        <ReceiptSort value={sortOption} onChange={setSortOption} />
      </div>

      {/* Bulk Actions Bar */}
      {selectedReceipts.size > 0 && (
        <div
          className="mb-4 flex items-center justify-between rounded-2xl border border-white/[0.08] p-4"
          style={{
            background: 'linear-gradient(180deg, rgba(18,27,39,0.92), rgba(12,19,30,0.96))',
          }}
        >
          <span className="text-sm font-medium text-slate-200">
            {selectedReceipts.size} receipt{selectedReceipts.size > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition-all duration-[180ms] hover:bg-red-500/25"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Receipt Groups */}
      <div className="space-y-6">
        {paginatedAndGroupedReceipts.map(([groupLabel, groupReceipts]) => (
          <div key={groupLabel || 'all-receipts'} className="space-y-2.5">
            {groupLabel && (
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {groupLabel}
              </h3>
            )}

            {/* Receipt Rows */}
            <div className="space-y-2">
              {groupReceipts.map(receipt => {
                const isSelected = selectedReceipts.has(receipt.id);
                const isEditing = editingId === receipt.id;
                const hasChanges = hasUnsavedChanges(receipt.id, allReceipts);
                const meta = getCategoryMeta(receipt.category);
                const IconComponent = meta.icon;

                if (isEditing) {
                  return (
                    <div
                      key={receipt.id}
                      className="rounded-[18px] border border-teal-500/40 bg-teal-500/[0.06] p-5 shadow-[0_0_0_2px_rgba(20,184,166,0.08)] transition-all duration-[180ms]"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Store
                          </label>
                          <ReceiptEditableField
                            receipt={receipt}
                            field="storeName"
                            isEditing
                            value={getFieldValue(receipt, 'storeName') as string}
                            onFieldChange={handleFieldChange}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Date
                          </label>
                          <ReceiptEditableField
                            receipt={receipt}
                            field="receiptDate"
                            type="date"
                            isEditing
                            value={getFieldValue(receipt, 'receiptDate') as string}
                            onFieldChange={handleFieldChange}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Amount
                          </label>
                          <ReceiptEditableField
                            receipt={receipt}
                            field="total"
                            type="number"
                            isEditing
                            value={getFieldValue(receipt, 'total') as number}
                            onFieldChange={handleFieldChange}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Payment
                          </label>
                          <ReceiptEditableSelect
                            receipt={receipt}
                            type="paymentMethod"
                            isEditing
                            value={getFieldValue(receipt, 'paymentMethod') as string | null}
                            onFieldChange={handleFieldChange}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Category
                          </label>
                          <ReceiptEditableSelect
                            receipt={receipt}
                            type="category"
                            isEditing
                            value={getFieldValue(receipt, 'category') as string | null}
                            onFieldChange={handleFieldChange}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                        <button
                          onClick={() => handleSave(receipt)}
                          disabled={!hasChanges || updateMutation.isPending}
                          className="flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-medium text-teal-300 transition-all duration-[180ms] hover:bg-teal-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {updateMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => handleCancelEdit(receipt.id)}
                          disabled={updateMutation.isPending}
                          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-400 transition-all duration-[180ms] hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={receipt.id}
                    onClick={() => handleSelectReceipt(receipt.id)}
                    className={`group flex cursor-pointer items-center rounded-[18px] border px-5 py-3.5 transition-all duration-[200ms] ${
                      isSelected
                        ? 'border-teal-500/25 bg-white/[0.04]'
                        : 'border-white/[0.07] bg-white/[0.025]'
                    } hover:border-teal-500/20 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(20,184,166,0.08),0_0_40px_rgba(20,184,166,0.04)]`}
                  >
                    {/* Category Icon */}
                    <div
                      className={`mr-4 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${meta.bg}`}
                    >
                      <IconComponent className={`h-5 w-5 ${meta.color}`} />
                    </div>

                    {/* Info Block */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="truncate text-[0.9375rem] font-semibold text-white">
                          {receipt.storeName}
                        </span>
                        <span className="flex-shrink-0 text-[0.8125rem] text-slate-500">
                          {formatDate(receipt.receiptDate)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {receipt.paymentMethod && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-teal-500/20 bg-teal-500/[0.08] px-2 py-0.5 text-[0.6875rem] font-medium text-teal-300">
                            <CreditCard className="h-3 w-3" />
                            {formatPaymentLabel(receipt.paymentMethod)}
                          </span>
                        )}
                        {receipt.category && (
                          <span className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/[0.08] px-2 py-0.5 text-[0.6875rem] font-medium text-blue-300">
                            {getCategoryLabel(receipt.category)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <span className="ml-4 flex-shrink-0 text-base font-bold text-teal-400">
                      ${(receipt.total || 0).toFixed(2)}
                    </span>

                    {/* Actions — always visible */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleStartEdit(receipt);
                      }}
                      className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition-all duration-[180ms] hover:bg-white/[0.06] hover:text-slate-200"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(receipt.id);
                      }}
                      className="ml-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition-all duration-[180ms] hover:bg-red-500/10 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={allReceiptsFlat.length}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={open => !open && cancelDelete()}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteDialog
        open={bulkDeleteDialog}
        onOpenChange={open => setBulkDeleteDialog(open)}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteDialog(false)}
        isLoading={deleteMutation.isPending}
        title={`Delete ${selectedReceipts.size} receipt${selectedReceipts.size > 1 ? 's' : ''}?`}
        message={`Are you sure you want to delete ${selectedReceipts.size} selected receipt${selectedReceipts.size > 1 ? 's' : ''}? This action cannot be undone.`}
      />

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialog.open}
        onOpenChange={open => setErrorDialog({ ...errorDialog, open })}
        title={errorDialog.title}
        message={errorDialog.message}
      />
    </div>
  );
};

export default ReceiptList;
