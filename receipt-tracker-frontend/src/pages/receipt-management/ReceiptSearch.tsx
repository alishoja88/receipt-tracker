import { useState, useEffect } from 'react';
import { Search, Calendar, ChevronDown, RotateCcw, X, SlidersHorizontal } from 'lucide-react';
import type { ReceiptFilters, PaymentMethod } from '@/modules/receipts/types/receipt.types';
import { PaymentMethod as PaymentMethodEnum } from '@/modules/receipts/types/receipt.types';

interface ReceiptSearchProps {
  onFiltersChange: (filters: ReceiptFilters) => void;
  initialFilters?: ReceiptFilters;
  onActiveFiltersChange?: (activeFilters: ActiveFilter[]) => void;
}

type DateRangePreset = 'all' | 'today' | 'thisWeek' | 'thisMonth';

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

const ReceiptSearch = ({ onFiltersChange, onActiveFiltersChange }: ReceiptSearchProps) => {
  const [storeName, setStoreName] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('all');

  const getDateRange = (preset: DateRangePreset): { from: string; to: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (preset) {
      case 'today': {
        const todayStr = today.toISOString().split('T')[0];
        return { from: todayStr, to: todayStr };
      }
      case 'thisWeek': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
          from: weekStart.toISOString().split('T')[0],
          to: weekEnd.toISOString().split('T')[0],
        };
      }
      case 'thisMonth': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          from: monthStart.toISOString().split('T')[0],
          to: monthEnd.toISOString().split('T')[0],
        };
      }
      default:
        return { from: '', to: '' };
    }
  };

  const handleDateRangePreset = (preset: DateRangePreset) => {
    setDateRangePreset(preset);
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else {
      const range = getDateRange(preset);
      setDateFrom(range.from);
      setDateTo(range.to);
    }
  };

  const handleResetFilters = () => {
    setStoreName('');
    setDateFrom('');
    setDateTo('');
    setCategory('');
    setPaymentMethod('all');
    setDateRangePreset('all');
  };

  const hasActiveFilters = () => {
    return (
      storeName.trim() !== '' ||
      dateFrom !== '' ||
      dateTo !== '' ||
      (category !== '' && category !== 'all') ||
      paymentMethod !== 'all' ||
      dateRangePreset !== 'all'
    );
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'GROCERY', label: 'Grocery' },
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'TRANSPORTATION', label: 'Transportation' },
    { value: 'UTILITIES', label: 'Utilities' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'OTHER', label: 'Other' },
  ];

  const paymentMethods = [
    { value: 'all', label: 'All Methods' },
    { value: PaymentMethodEnum.CARD, label: 'Credit Card' },
    { value: PaymentMethodEnum.CASH, label: 'Cash' },
    { value: PaymentMethodEnum.OTHER, label: 'Other' },
  ];

  const getActiveFilters = (): ActiveFilter[] => {
    const filters: ActiveFilter[] = [];

    if (dateRangePreset !== 'all') {
      const presetLabels: Record<DateRangePreset, string> = {
        all: 'All',
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
      };
      filters.push({
        key: 'dateRangePreset',
        label: presetLabels[dateRangePreset],
        value: dateRangePreset,
        onRemove: () => {
          setDateRangePreset('all');
          setDateFrom('');
          setDateTo('');
        },
      });
    }

    if (storeName.trim() !== '') {
      filters.push({
        key: 'storeName',
        label: `Store: ${storeName}`,
        value: storeName,
        onRemove: () => setStoreName(''),
      });
    }

    if (category && category !== 'all') {
      const categoryLabel = categories.find(c => c.value === category)?.label || category;
      filters.push({
        key: 'category',
        label: `Category: ${categoryLabel}`,
        value: category,
        onRemove: () => setCategory(''),
      });
    }

    if (paymentMethod !== 'all') {
      const paymentLabel =
        paymentMethods.find(m => m.value === paymentMethod)?.label || paymentMethod;
      filters.push({
        key: 'paymentMethod',
        label: `Payment: ${paymentLabel}`,
        value: paymentMethod,
        onRemove: () => setPaymentMethod('all'),
      });
    }

    if (dateFrom && dateRangePreset === 'all') {
      filters.push({
        key: 'dateFrom',
        label: `From: ${dateFrom}`,
        value: dateFrom,
        onRemove: () => setDateFrom(''),
      });
    }

    if (dateTo && dateRangePreset === 'all') {
      filters.push({
        key: 'dateTo',
        label: `To: ${dateTo}`,
        value: dateTo,
        onRemove: () => setDateTo(''),
      });
    }

    return filters;
  };

  useEffect(() => {
    const filters: ReceiptFilters = { page: 1, limit: 10 };
    if (storeName.trim()) filters.storeName = storeName.trim();
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (category && category !== 'all') filters.category = category;
    if (paymentMethod && paymentMethod !== 'all')
      filters.paymentMethod = paymentMethod as PaymentMethod;

    onFiltersChange(filters);
    if (onActiveFiltersChange) onActiveFiltersChange(getActiveFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeName, dateFrom, dateTo, category, paymentMethod, dateRangePreset]);

  const presetButtons: { key: DateRangePreset; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'thisWeek', label: 'Week' },
    { key: 'thisMonth', label: 'Month' },
  ];

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div
        className="group/bar flex flex-wrap items-center gap-3 rounded-2xl border p-4 transition-all duration-[200ms] hover:shadow-[0_0_24px_rgba(20,184,166,0.1),0_0_48px_rgba(20,184,166,0.05)] sm:gap-4 sm:px-6 sm:py-4"
        style={{
          background: 'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(30,41,59,0.6) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(20,184,166,0.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Filter Label */}
        <div className="hidden items-center gap-2 sm:flex">
          <SlidersHorizontal className="h-4 w-4 text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
            Filters
          </span>
        </div>

        {/* Separator */}
        <div className="hidden h-6 w-px bg-white/[0.08] sm:block" />

        {/* Search */}
        <div
          className="group/search flex min-w-0 flex-1 items-center rounded-[10px] border border-teal-500/20 px-3.5 transition-all duration-250 focus-within:border-teal-400 focus-within:shadow-[0_0_0_3px_rgba(20,184,166,0.1),inset_0_1px_3px_rgba(20,184,166,0.1)] sm:max-w-[240px] sm:flex-none"
          style={{ background: 'rgba(15,23,42,0.4)', height: '40px' }}
        >
          <Search className="mr-2 h-4 w-4 flex-shrink-0 text-slate-500 transition-all duration-200 group-focus-within/search:scale-110 group-focus-within/search:text-teal-400" />
          <input
            type="text"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-medium text-slate-200 outline-none placeholder:text-slate-500"
            placeholder="Search..."
          />
        </div>

        {/* Date Range Group */}
        <div className="flex items-center gap-2.5">
          <div
            className="group/date flex items-center rounded-[10px] border border-teal-500/20 px-3 transition-all duration-250 focus-within:border-teal-400 focus-within:shadow-[0_0_0_3px_rgba(20,184,166,0.1),inset_0_1px_3px_rgba(20,184,166,0.1)]"
            style={{ background: 'rgba(15,23,42,0.4)', height: '40px' }}
          >
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0 text-slate-500 transition-colors duration-200 group-focus-within/date:text-teal-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => {
                setDateFrom(e.target.value);
                setDateRangePreset('all');
              }}
              className="w-[120px] cursor-pointer border-none bg-transparent text-[13px] font-medium text-slate-200 outline-none [&::-webkit-calendar-picker-indicator]:invert"
              placeholder="yyyy-mm-dd"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <span className="text-xs font-semibold text-slate-600">to</span>

          <div
            className="group/date flex items-center rounded-[10px] border border-teal-500/20 px-3 transition-all duration-250 focus-within:border-teal-400 focus-within:shadow-[0_0_0_3px_rgba(20,184,166,0.1),inset_0_1px_3px_rgba(20,184,166,0.1)]"
            style={{ background: 'rgba(15,23,42,0.4)', height: '40px' }}
          >
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0 text-slate-500 transition-colors duration-200 group-focus-within/date:text-teal-400" />
            <input
              type="date"
              value={dateTo}
              onChange={e => {
                setDateTo(e.target.value);
                setDateRangePreset('all');
              }}
              className="w-[120px] cursor-pointer border-none bg-transparent text-[13px] font-medium text-slate-200 outline-none [&::-webkit-calendar-picker-indicator]:invert"
              placeholder="yyyy-mm-dd"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Category Select */}
        <div className="relative">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="min-w-[160px] cursor-pointer appearance-none rounded-[10px] border border-teal-500/20 pr-8 pl-3.5 text-[13px] font-medium text-slate-200 outline-none transition-all duration-250 hover:border-teal-500/30 focus:border-teal-400 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1),inset_0_1px_3px_rgba(20,184,166,0.1)]"
            style={{ background: 'rgba(15,23,42,0.4)', height: '40px' }}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-[#1e293b] text-slate-200">
                {cat.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        </div>

        {/* Reset Button */}
        {hasActiveFilters() && (
          <button
            onClick={handleResetFilters}
            className="group/reset relative ml-auto inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[10px] border px-4 text-[13px] font-semibold text-teal-400 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(20,184,166,0.15)] active:translate-y-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.08) 100%)',
              borderColor: 'rgba(20,184,166,0.3)',
              height: '40px',
            }}
          >
            <RotateCcw className="h-4 w-4 transition-transform duration-300 group-active/reset:rotate-[360deg]" />
            Reset
          </button>
        )}
      </div>

      {/* Preset Row + Active Tags */}
      {(presetButtons.length > 0 || getActiveFilters().length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Presets */}
          {presetButtons.map(p => (
            <button
              key={p.key}
              onClick={() => handleDateRangePreset(p.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-[180ms] ${
                dateRangePreset === p.key
                  ? 'border border-teal-500/30 bg-teal-500/[0.16] text-teal-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-400'
              }`}
            >
              {p.label}
            </button>
          ))}

          {/* Active Filter Tags */}
          {getActiveFilters().length > 0 && (
            <>
              <div className="mx-1 h-4 w-px bg-white/[0.06]" />
              {getActiveFilters().map(filter => (
                <div
                  key={filter.key}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/25 bg-teal-500/[0.08] px-2.5 py-1 text-xs font-medium text-teal-300"
                >
                  <span>{filter.label}</span>
                  <button
                    onClick={filter.onRemove}
                    className="rounded-full p-0.5 transition-colors duration-150 hover:bg-teal-500/20"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptSearch;
