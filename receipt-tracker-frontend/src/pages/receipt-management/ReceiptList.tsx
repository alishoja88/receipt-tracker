import { useState, useMemo, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
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

interface ReceiptListProps {
  limit?: number;
  filters?: ReceiptFilters;
}

const ReceiptList = ({ limit = 10, filters = {} }: ReceiptListProps) => {
  // Merge filters with default pagination
  const queryFilters: ReceiptFilters = {
    ...filters,
    limit: filters.limit || limit,
    page: filters.page || 1,
  };

  // React Query hook for fetching receipts
  const { data, isLoading, error } = useReceipts({
    ...queryFilters,
    limit: 10000, // Get all receipts for sorting and grouping
  });

  // React Query mutations
  const deleteMutation = useDeleteReceipt();
  const updateMutation = useUpdateReceipt();

  const allReceipts = data?.items || [];

  // Sort and selection state
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use custom hook for editing logic
  const {
    editingId,
    editedValues,
    hasUnsavedChanges,
    handleStartEdit,
    handleCancelEdit,
    handleFieldChange,
  } = useReceiptEditing();

  // Helper function to get current value (edited or original)
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

  // Save changes
  const handleSave = async (receipt: ReceiptListItem) => {
    const changes = editedValues[receipt.id];
    if (!changes || Object.keys(changes).length === 0) {
      return;
    }

    try {
      // Prepare update data
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

  // Sort and group receipts
  const sortedAndGroupedReceipts = useMemo(() => {
    let sorted = [...allReceipts];

    // If sorting by amount, sort all receipts by amount (no grouping by date)
    // Display as a single flat list sorted by amount
    if (sortOption === 'amount-high' || sortOption === 'amount-low') {
      // Sort all receipts by amount
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

      // Return as a single group with empty label (no date grouping)
      return [['', sorted]] as [string, ReceiptListItem[]][];
    }

    // For date sorting: sort receipts, then group, then sort groups
    if (sortOption === 'date-newest' || sortOption === 'date-oldest') {
      // Sort receipts by date
      sorted.sort((a, b) => {
        if (sortOption === 'date-newest') {
          return new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime();
        } else {
          return new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime();
        }
      });

      // Group by date
      const grouped: { [key: string]: ReceiptListItem[] } = {};
      sorted.forEach(receipt => {
        const groupKey = getDateGroupLabel(receipt.receiptDate);
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(receipt);
      });

      // Re-sort receipts within each group by date
      Object.keys(grouped).forEach(groupKey => {
        grouped[groupKey].sort((a, b) => {
          if (sortOption === 'date-newest') {
            return new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime();
          } else {
            return new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime();
          }
        });
      });

      // Sort groups by date
      const sortedGroups = Object.entries(grouped).sort(([keyA, receiptsA], [keyB, receiptsB]) => {
        // Always prioritize today's and yesterday's receipts
        if (keyA.startsWith('TODAY')) return -1;
        if (keyB.startsWith('TODAY')) return 1;
        if (keyA.startsWith('YESTERDAY')) return -1;
        if (keyB.startsWith('YESTERDAY')) return 1;

        // Sort groups by date based on sort option
        const dateA = new Date(receiptsA[0].receiptDate);
        const dateB = new Date(receiptsB[0].receiptDate);

        if (sortOption === 'date-oldest') {
          return dateA.getTime() - dateB.getTime();
        }
        // date-newest (default)
        return dateB.getTime() - dateA.getTime();
      });

      return sortedGroups;
    }

    // Default: no sorting
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

  // Flatten grouped receipts for pagination
  const allReceiptsFlat = useMemo(() => {
    return sortedAndGroupedReceipts.flatMap(([_, receipts]) => receipts);
  }, [sortedAndGroupedReceipts]);

  // Calculate pagination
  const totalPages = Math.ceil(allReceiptsFlat.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReceipts = allReceiptsFlat.slice(startIndex, endIndex);

  // Re-group paginated receipts
  const paginatedAndGroupedReceipts = useMemo(() => {
    // If sorting by amount, don't re-group by date
    if (sortOption === 'amount-high' || sortOption === 'amount-low') {
      // Return as a single group with empty label
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

  // Handle checkbox selection
  const handleSelectReceipt = (receiptId: string) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(receiptId)) {
      newSelected.delete(receiptId);
    } else {
      newSelected.add(receiptId);
    }
    setSelectedReceipts(newSelected);
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedReceipts.size === 0) return;
    setBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedReceipts);
    try {
      // Delete all selected receipts
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Loading receipts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          {error instanceof Error ? error.message : 'Failed to load receipts'}
        </p>
      </div>
    );
  }

  if (allReceipts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No receipts found</p>
      </div>
    );
  }

  return (
    <div className="w-full px-3 md:px-4 lg:px-0">
      {/* Header with Title and Sort */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Recent Receipts</h2>
        <ReceiptSort value={sortOption} onChange={setSortOption} />
      </div>

      {/* Bulk Actions Bar */}
      {selectedReceipts.size > 0 && (
        <div
          className="mb-4 p-4 rounded-lg flex items-center justify-between"
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <span className="text-sm font-medium text-white">
            {selectedReceipts.size} receipt{selectedReceipts.size > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#EF4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#DC2626';
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Receipt Groups */}
      <div className="space-y-6">
        {paginatedAndGroupedReceipts.map(([groupLabel, groupReceipts]) => (
          <div key={groupLabel || 'all-receipts'} className="space-y-3">
            {/* Group Header - only show if groupLabel is not empty */}
            {groupLabel && (
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: '#94A3B8' }}
              >
                {groupLabel}
              </h3>
            )}

            {/* Column Headers (Desktop only) */}
            <div className="hidden lg:grid lg:grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 mb-2 px-5">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={groupReceipts.every(r => selectedReceipts.has(r.id))}
                  onChange={() => {
                    const allSelected = groupReceipts.every(r => selectedReceipts.has(r.id));
                    const newSelected = new Set(selectedReceipts);
                    if (allSelected) {
                      groupReceipts.forEach(r => newSelected.delete(r.id));
                    } else {
                      groupReceipts.forEach(r => newSelected.add(r.id));
                    }
                    setSelectedReceipts(newSelected);
                  }}
                  className="w-5 h-5 rounded border-slate-600 accent-blue-500 cursor-pointer"
                />
              </div>
              <div className="col-span-1">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                  STORE
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                  DATE
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                  AMOUNT
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                  PAYMENT
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                  CATEGORY
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                  ACTIONS
                </p>
              </div>
            </div>

            {/* Receipt Rows */}
            <div className="space-y-2">
              {groupReceipts.map((receipt, index) => {
                const isSelected = selectedReceipts.has(receipt.id);
                const isEditing = editingId === receipt.id;
                const hasChanges = hasUnsavedChanges(receipt.id, allReceipts);

                return (
                  <div key={receipt.id}>
                    {/* Desktop View */}
                    <div
                      className={`
                        hidden lg:grid lg:grid-cols-[auto_1fr] gap-5 items-center p-5
                        rounded-xl transition-all duration-200
                        ${
                          isEditing
                            ? 'bg-blue-500/8 border border-blue-500/50 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                            : isSelected
                              ? 'bg-slate-800/80 border border-blue-500/30'
                              : 'bg-slate-800/60 border border-slate-700/80'
                        }
                        hover:bg-slate-800/80 hover:border-slate-600/90
                        animate-fade-in
                      `}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Checkbox */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectReceipt(receipt.id)}
                          className="w-5 h-5 rounded border-slate-600 accent-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Receipt Info Grid */}
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center">
                        {/* Store Name */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                            STORE
                          </span>
                          {isEditing ? (
                            <ReceiptEditableField
                              receipt={receipt}
                              field="storeName"
                              isEditing={isEditing}
                              value={getFieldValue(receipt, 'storeName') as string}
                              onFieldChange={handleFieldChange}
                              className="text-[1.0625rem]"
                            />
                          ) : (
                            <span className="text-[1.0625rem] font-bold text-slate-100">
                              {receipt.storeName}
                            </span>
                          )}
                        </div>

                        {/* Date */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                            DATE
                          </span>
                          {isEditing ? (
                            <ReceiptEditableField
                              receipt={receipt}
                              field="receiptDate"
                              type="date"
                              isEditing={isEditing}
                              value={getFieldValue(receipt, 'receiptDate') as string}
                              onFieldChange={handleFieldChange}
                              className="text-[0.9375rem]"
                            />
                          ) : (
                            <span className="text-[0.9375rem] font-semibold text-slate-200">
                              {formatDate(receipt.receiptDate)}
                            </span>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                            AMOUNT
                          </span>
                          {isEditing ? (
                            <ReceiptEditableField
                              receipt={receipt}
                              field="total"
                              type="number"
                              isEditing={isEditing}
                              value={getFieldValue(receipt, 'total') as number}
                              onFieldChange={handleFieldChange}
                              className="text-[1.125rem]"
                            />
                          ) : (
                            <span className="text-[1.125rem] font-extrabold text-blue-500">
                              ${(receipt.total || 0).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Payment */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                            PAYMENT
                          </span>
                          {isEditing ? (
                            <ReceiptEditableSelect
                              receipt={receipt}
                              type="paymentMethod"
                              isEditing={isEditing}
                              value={getFieldValue(receipt, 'paymentMethod') as string | null}
                              onFieldChange={handleFieldChange}
                            />
                          ) : receipt.paymentMethod ? (
                            <span className="inline-block px-3 py-1 text-[0.75rem] font-bold rounded-xl text-lime-200 bg-lime-500/15 border border-lime-500/30">
                              {receipt.paymentMethod === PaymentMethod.CARD
                                ? 'Card'
                                : receipt.paymentMethod === PaymentMethod.CASH
                                  ? 'Cash'
                                  : receipt.paymentMethod}
                            </span>
                          ) : (
                            <span className="text-[0.9375rem] font-semibold text-slate-400">-</span>
                          )}
                        </div>

                        {/* Category */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                            CATEGORY
                          </span>
                          {isEditing ? (
                            <ReceiptEditableSelect
                              receipt={receipt}
                              type="category"
                              isEditing={isEditing}
                              value={getFieldValue(receipt, 'category') as string | null}
                              onFieldChange={handleFieldChange}
                            />
                          ) : receipt.category ? (
                            <span className="inline-block px-3 py-1 text-[0.75rem] font-bold rounded-xl text-blue-200 bg-blue-500/20 border border-blue-500/40">
                              {getCategoryLabel(receipt.category)}
                            </span>
                          ) : (
                            <span className="text-[0.9375rem] font-semibold text-slate-400">-</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500 opacity-0">
                            ACTIONS
                          </span>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSave(receipt)}
                                  disabled={!hasChanges || updateMutation.isPending}
                                  className="px-4 py-2 text-[0.8125rem] font-semibold rounded-lg transition-all duration-200 text-green-200 bg-green-500/15 border border-green-500/30 hover:bg-green-500/25 hover:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => handleCancelEdit(receipt.id)}
                                  disabled={updateMutation.isPending}
                                  className="px-4 py-2 text-[0.8125rem] font-semibold rounded-lg transition-all duration-200 text-slate-200 bg-slate-500/15 border border-slate-500/30 hover:bg-slate-500/25 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(receipt)}
                                  className="px-4 py-2 text-[0.8125rem] font-semibold rounded-lg transition-all duration-200 text-blue-200 bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/25 hover:border-blue-500/50"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(receipt.id)}
                                  className="px-4 py-2 text-[0.8125rem] font-semibold rounded-lg transition-all duration-200 text-red-200 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 hover:border-red-500/50"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile/Tablet Card */}
                    <div
                      className={`
                      lg:hidden rounded-xl p-4 md:p-5 transition-all duration-200 animate-fade-in relative
                      ${
                        isEditing
                          ? 'bg-blue-500/8 border border-blue-500/50 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                          : isSelected
                            ? 'bg-slate-800/80 border border-blue-500/30'
                            : 'bg-slate-800/60 border border-slate-700/80'
                      }
                      hover:bg-slate-800/80 hover:border-slate-600/90
                    `}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Checkbox - Absolute positioned in top-left corner */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectReceipt(receipt.id)}
                        className="absolute top-4 left-4 w-5 h-5 rounded border-slate-600 accent-blue-500 cursor-pointer z-10"
                      />

                      {/* Grid Layout for Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-2.5 md:gap-3.5 pt-1 pl-9 md:pl-0">
                        {/* Row 1: Store Name (Full Width) */}
                        <div className="col-span-1 md:col-span-3 grid grid-cols-[90px_1fr] md:flex md:flex-col gap-2 md:gap-1 items-center md:items-start">
                          <span className="text-[0.75rem] md:text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500 text-left">
                            STORE
                          </span>
                          {isEditing ? (
                            <ReceiptEditableField
                              receipt={receipt}
                              field="storeName"
                              isEditing={isEditing}
                              value={getFieldValue(receipt, 'storeName') as string}
                              onFieldChange={handleFieldChange}
                              className="text-[0.875rem] md:text-[1.0625rem] font-bold text-slate-100 text-right md:text-left"
                            />
                          ) : (
                            <span className="text-[0.875rem] md:text-[1.0625rem] font-bold text-slate-100 text-right md:text-left">
                              {receipt.storeName}
                            </span>
                          )}
                        </div>

                        {/* Row 2: Date (Column 1) */}
                        <div className="col-span-1 grid grid-cols-[90px_1fr] md:flex md:flex-col gap-2 md:gap-1 items-center md:items-start">
                          <span className="text-[0.75rem] md:text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500 text-left">
                            DATE
                          </span>
                          {isEditing ? (
                            <ReceiptEditableField
                              receipt={receipt}
                              field="receiptDate"
                              type="date"
                              isEditing={isEditing}
                              value={getFieldValue(receipt, 'receiptDate') as string}
                              onFieldChange={handleFieldChange}
                              className="text-[0.875rem] md:text-[0.9375rem] font-semibold text-slate-200 text-right md:text-left"
                            />
                          ) : (
                            <span className="text-[0.875rem] md:text-[0.9375rem] font-semibold text-slate-200 text-right md:text-left">
                              {formatDate(receipt.receiptDate)}
                            </span>
                          )}
                        </div>

                        {/* Row 2: Amount (Columns 2-3) */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-[90px_1fr] md:flex md:flex-col gap-2 md:gap-1 items-center md:items-start">
                          <span className="text-[0.75rem] md:text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500 text-left">
                            AMOUNT
                          </span>
                          {isEditing ? (
                            <ReceiptEditableField
                              receipt={receipt}
                              field="total"
                              type="number"
                              isEditing={isEditing}
                              value={getFieldValue(receipt, 'total') as number}
                              onFieldChange={handleFieldChange}
                              className="text-[0.875rem] md:text-[1.125rem] font-extrabold text-blue-500 text-right md:text-left"
                            />
                          ) : (
                            <span className="text-[0.875rem] md:text-[1.125rem] font-extrabold text-blue-500 text-right md:text-left">
                              ${(receipt.total || 0).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Row 3: Payment (Column 1) */}
                        <div className="col-span-1 grid grid-cols-[90px_1fr] md:flex md:flex-col gap-2 md:gap-1 items-center md:items-start">
                          <span className="text-[0.75rem] md:text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500 text-left">
                            PAYMENT
                          </span>
                          <div className="justify-self-end md:justify-self-start">
                            {isEditing ? (
                              <ReceiptEditableSelect
                                receipt={receipt}
                                type="paymentMethod"
                                isEditing={isEditing}
                                value={getFieldValue(receipt, 'paymentMethod') as string | null}
                                onFieldChange={handleFieldChange}
                              />
                            ) : receipt.paymentMethod ? (
                              <span className="inline-block w-fit px-3 py-1 text-[0.6875rem] md:text-[0.75rem] font-bold rounded-xl text-lime-200 bg-lime-500/15 border border-lime-500/30">
                                {receipt.paymentMethod === PaymentMethod.CARD
                                  ? 'Card'
                                  : receipt.paymentMethod === PaymentMethod.CASH
                                    ? 'Cash'
                                    : receipt.paymentMethod}
                              </span>
                            ) : (
                              <span className="text-[0.875rem] md:text-[0.9375rem] font-semibold text-slate-400">
                                -
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Row 3: Category (Columns 2-3) */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-[90px_1fr] md:flex md:flex-col gap-2 md:gap-1 items-center md:items-start">
                          <span className="text-[0.75rem] md:text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-slate-500 text-left">
                            CATEGORY
                          </span>
                          <div className="justify-self-end md:justify-self-start">
                            {isEditing ? (
                              <ReceiptEditableSelect
                                receipt={receipt}
                                type="category"
                                isEditing={isEditing}
                                value={getFieldValue(receipt, 'category') as string | null}
                                onFieldChange={handleFieldChange}
                              />
                            ) : receipt.category ? (
                              <span className="inline-block w-fit px-3 py-1 text-[0.6875rem] md:text-[0.75rem] font-bold rounded-xl text-blue-200 bg-blue-500/20 border border-blue-500/40">
                                {getCategoryLabel(receipt.category)}
                              </span>
                            ) : (
                              <span className="text-[0.875rem] md:text-[0.9375rem] font-semibold text-slate-400">
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="w-full flex items-center justify-center gap-2 pt-3 mt-3 border-t border-slate-700/30">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(receipt)}
                              disabled={!hasChanges || updateMutation.isPending}
                              className="flex-1 px-4 py-2.5 text-[0.8125rem] font-semibold rounded-lg transition-all duration-200 text-green-200 bg-green-500/15 border border-green-500/30 hover:bg-green-500/25 hover:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updateMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => handleCancelEdit(receipt.id)}
                              disabled={updateMutation.isPending}
                              className="flex-1 px-4 py-2.5 text-[0.8125rem] font-semibold rounded-lg transition-all duration-200 text-slate-200 bg-slate-500/15 border border-slate-500/30 hover:bg-slate-500/25 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(receipt)}
                              className="flex-1 px-4 py-2.5 text-[0.8125rem] font-semibold rounded-lg transition-all duration-200 text-blue-200 bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/25 hover:border-blue-500/50 justify-center"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(receipt.id)}
                              className="flex-1 px-4 py-2.5 text-[0.8125rem] font-semibold rounded-lg transition-all duration-200 text-red-200 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 hover:border-red-500/50 justify-center"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
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
