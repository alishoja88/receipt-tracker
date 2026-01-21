import { useState, useCallback } from 'react';
import { Loader2, Receipt, DollarSign, Calendar, Plus } from 'lucide-react';
import { ReceiptUpload, ReceiptList, ReceiptSearch } from './receipt-management';
import { useUploadReceipt } from '@/modules/receipts/hooks/receipts.mutations';
import { useReceipts } from '@/modules/receipts/hooks/receipts.queries';
import { getErrorMessage, isRecoverableError } from '@/utils/error-messages';
import type { ReceiptFilters } from '@/modules/receipts/types/receipt.types';
import { AddReceiptModal } from './receipt-management/components';

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

const UploadReceiptPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReceiptFilters>({});
  const [dateRangePreset, setDateRangePreset] = useState<
    'all' | 'today' | 'thisWeek' | 'thisMonth'
  >('all');
  const [isAddReceiptModalOpen, setIsAddReceiptModalOpen] = useState(false);

  // Memoize the filter change handler to prevent unnecessary re-renders
  const handleFiltersChange = useCallback((newFilters: ReceiptFilters) => {
    console.log('🟡 UPLOAD PAGE - Filters changed:', newFilters);
    setFilters(newFilters);
  }, []);

  // Handle active filters change from ReceiptSearch
  const handleActiveFiltersChange = useCallback((filters: ActiveFilter[]) => {
    // Extract date range preset from active filters
    const datePresetFilter = filters.find(f => f.key === 'dateRangePreset');
    if (datePresetFilter) {
      setDateRangePreset(datePresetFilter.value as 'all' | 'today' | 'thisWeek' | 'thisMonth');
    } else {
      setDateRangePreset('all');
    }
  }, []);

  // Fetch receipts for summary calculation
  const { data: receiptsData } = useReceipts({
    ...filters,
    limit: 10000, // Get all receipts for summary calculation
  });

  // Calculate summary statistics
  const calculateSummary = () => {
    const receipts = receiptsData?.items || [];
    const totalReceipts = receiptsData?.pagination?.totalItems || receipts.length;
    const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.total || 0), 0);

    // Format date range
    let dateRangeText = 'All Time';
    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      };
      dateRangeText = `${formatDate(fromDate)} – ${formatDate(toDate)}`;
    } else if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      dateRangeText = `From ${fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      dateRangeText = `Until ${toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (dateRangePreset === 'today') {
      const today = new Date();
      dateRangeText = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } else if (dateRangePreset === 'thisWeek') {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      dateRangeText = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (dateRangePreset === 'thisMonth') {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dateRangeText = `${monthStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${monthEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    return {
      totalReceipts,
      totalAmount,
      dateRangeText,
    };
  };

  const summary = calculateSummary();

  // React Query mutation for upload
  const uploadMutation = useUploadReceipt();

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file format. Please select JPG, PNG, or PDF.');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB. Please select a smaller file.');
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setError(null);

    try {
      await uploadMutation.mutateAsync(file);
      // Clear file after successful upload
      setFile(null);
      setError(null);
      // React Query will automatically refetch receipt list
    } catch (err: any) {
      // Use error message utility to get user-friendly message
      const userFriendlyError = getErrorMessage(err);
      setError(userFriendlyError);
      // Keep the file so user can try again if error is recoverable
      // Only clear file if error is not recoverable (e.g., configuration issues)
      if (!isRecoverableError(err)) {
        setFile(null);
      }
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setFile(null); // Clear file so user can select a new file or the same file again
  };

  return (
    <div
      className="min-h-screen -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12"
      style={{ backgroundColor: '#0F172A' }}
    >
      {/* Header Section */}
      <div
        className="w-full py-8"
        style={{
          backgroundColor: '#0F172A',
        }}
      >
        <div className="container mx-auto max-w-6xl px-3 md:px-4 lg:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              {/* Title */}
              <h1 className="text-3xl font-bold text-white mb-3">Receipt Dashboard</h1>

              {/* Description */}
              <p className="text-base" style={{ color: '#94A3B8' }}>
                Upload and manage all of your receipts in one place.
              </p>
            </div>

            {/* Add Receipt Manually Button */}
            <button
              onClick={() => setIsAddReceiptModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Receipts Manually</span>
              <span className="sm:hidden">Add Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl py-12">
        {/* Upload Component */}
        <div className="space-y-6">
          <ReceiptUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleRemoveFile}
            file={file}
            isUploading={uploadMutation.isPending}
            error={error}
            onUpload={handleUpload}
            onTryAgain={handleTryAgain}
          />

          {/* Loading State */}
          {uploadMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                Processing receipt...
              </p>
              <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>
                Please wait while we extract and analyze your receipt
              </p>
            </div>
          )}
        </div>

        {/* Receipt Search/Filter */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 px-3 md:px-4 lg:px-0" style={{ color: '#F1F5F9' }}>
            Receipts
          </h2>
          <ReceiptSearch
            onFiltersChange={handleFiltersChange}
            onActiveFiltersChange={handleActiveFiltersChange}
          />

          {/* Summary Statistics */}
          <div
            className="rounded-2xl p-6 mt-6 mx-3 md:mx-4 lg:mx-0"
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Receipts */}
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                    TOTAL RECEIPTS
                  </p>
                  <p className="text-2xl font-bold text-white">{summary.totalReceipts}</p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                    TOTAL AMOUNT
                  </p>
                  <p className="text-2xl font-bold text-white">${summary.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Period */}
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                    PERIOD
                  </p>
                  <p className="text-lg font-semibold text-white">{summary.dateRangeText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt List */}
        <div className="mt-6">
          <ReceiptList limit={10} filters={filters} />
        </div>
      </div>

      {/* Add Receipt Modal */}
      <AddReceiptModal
        open={isAddReceiptModalOpen}
        onClose={() => setIsAddReceiptModalOpen(false)}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UploadReceiptPage;
