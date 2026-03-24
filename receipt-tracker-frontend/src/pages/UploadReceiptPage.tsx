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

  const handleFiltersChange = useCallback((newFilters: ReceiptFilters) => {
    setFilters(newFilters);
  }, []);

  const handleActiveFiltersChange = useCallback((filters: ActiveFilter[]) => {
    const datePresetFilter = filters.find(f => f.key === 'dateRangePreset');
    if (datePresetFilter) {
      setDateRangePreset(datePresetFilter.value as 'all' | 'today' | 'thisWeek' | 'thisMonth');
    } else {
      setDateRangePreset('all');
    }
  }, []);

  const { data: receiptsData } = useReceipts({
    ...filters,
    limit: 10000,
  });

  const calculateSummary = () => {
    const receipts = receiptsData?.items || [];
    const totalReceipts = receiptsData?.pagination?.totalItems || receipts.length;
    const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.total || 0), 0);

    let dateRangeText = 'All Time';
    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      const fmt = (d: Date) =>
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      dateRangeText = `${fmt(fromDate)} – ${fmt(toDate)}`;
    } else if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      dateRangeText = `From ${fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      dateRangeText = `Until ${toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (dateRangePreset === 'today') {
      dateRangeText = new Date().toLocaleDateString('en-US', {
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

    return { totalReceipts, totalAmount, dateRangeText };
  };

  const summary = calculateSummary();

  const uploadMutation = useUploadReceipt();

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file format. Please select JPG, PNG, or PDF.');
      return;
    }
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
      setFile(null);
      setError(null);
    } catch (err: any) {
      const userFriendlyError = getErrorMessage(err);
      setError(userFriendlyError);
      if (!isRecoverableError(err)) {
        setFile(null);
      }
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setFile(null);
  };

  const steps = [
    { n: 1, title: 'Upload your receipt', desc: 'JPG, PNG, or PDF format' },
    { n: 2, title: 'AI extracts data', desc: 'Automatically captures all details' },
    { n: 3, title: 'Review and save', desc: 'Edit and organize your receipts' },
  ];

  const cardStyle = {
    background: 'linear-gradient(180deg, rgba(18,27,39,0.92), rgba(12,19,30,0.96))',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent 70%)' }}
        />
        <div
          className="absolute -right-40 -top-20 h-[500px] w-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Upload Receipts
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400 md:text-base">
              Upload and manage all of your receipts in one place
            </p>
          </div>
          <button
            onClick={() => setIsAddReceiptModalOpen(true)}
            className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-5 py-2.5 text-sm font-medium text-slate-200 transition-all duration-[180ms] hover:border-white/[0.14] hover:bg-white/[0.08] sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Manually</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        <main className="space-y-10 lg:space-y-12">
          {/* Upload component */}
          <ReceiptUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleRemoveFile}
            file={file}
            isUploading={uploadMutation.isPending}
            error={error}
            onUpload={handleUpload}
            onTryAgain={handleTryAgain}
          />

          {/* Processing state */}
          {uploadMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-teal-400" />
              <p className="text-lg font-semibold text-slate-100">Processing receipt...</p>
              <p className="mt-2 text-sm text-slate-400">
                Please wait while we extract and analyze your receipt
              </p>
            </div>
          )}

          {/* How It Works */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              How It Works
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {steps.map(s => (
                <div
                  key={s.n}
                  className="rounded-[22px] border border-white/[0.08] p-6 transition-all duration-[200ms] hover:-translate-y-0.5 hover:border-teal-500/20 hover:shadow-[0_0_20px_rgba(20,184,166,0.08),0_0_40px_rgba(20,184,166,0.04)]"
                  style={cardStyle}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-sm font-bold text-teal-300">
                    {s.n}
                  </div>
                  <p className="text-base font-semibold text-white">{s.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Receipts section */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Receipts
            </p>

            <ReceiptSearch
              onFiltersChange={handleFiltersChange}
              onActiveFiltersChange={handleActiveFiltersChange}
            />

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div
                className="flex items-center gap-4 rounded-[22px] border border-white/[0.08] p-5 transition-all duration-[200ms] hover:border-teal-500/20 hover:shadow-[0_0_20px_rgba(20,184,166,0.08),0_0_40px_rgba(20,184,166,0.04)]"
                style={cardStyle}
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                  <Receipt className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Total Receipts
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">{summary.totalReceipts}</p>
                </div>
              </div>

              <div
                className="flex items-center gap-4 rounded-[22px] border border-white/[0.08] p-5 transition-all duration-[200ms] hover:border-teal-500/20 hover:shadow-[0_0_20px_rgba(20,184,166,0.08),0_0_40px_rgba(20,184,166,0.04)]"
                style={cardStyle}
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
                  <DollarSign className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Total Amount
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    ${summary.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-4 rounded-[22px] border border-white/[0.08] p-5 transition-all duration-[200ms] hover:border-teal-500/20 hover:shadow-[0_0_20px_rgba(20,184,166,0.08),0_0_40px_rgba(20,184,166,0.04)]"
                style={cardStyle}
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                  <Calendar className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Period
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">{summary.dateRangeText}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt List */}
          <ReceiptList limit={10} filters={filters} />
        </main>
      </div>

      {/* Add Receipt Modal */}
      <AddReceiptModal
        open={isAddReceiptModalOpen}
        onClose={() => setIsAddReceiptModalOpen(false)}
      />
    </div>
  );
};

export default UploadReceiptPage;
