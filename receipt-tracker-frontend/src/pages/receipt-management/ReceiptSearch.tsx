import { useState, useEffect } from 'react';
import { Search, Calendar, ChevronDown, RotateCcw, X } from 'lucide-react';
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

  // Calculate date ranges
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
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
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

  // Apply date range preset
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

  // Reset all filters
  const handleResetFilters = () => {
    setStoreName('');
    setDateFrom('');
    setDateTo('');
    setCategory('');
    setPaymentMethod('all');
    setDateRangePreset('all');
  };

  // Check if any filter is active
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

  // Get active filters for display
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

  // Update filters when any filter changes
  useEffect(() => {
    const filters: ReceiptFilters = {
      page: 1,
      limit: 10,
    };

    if (storeName.trim()) {
      filters.storeName = storeName.trim();
    }

    if (dateFrom) {
      filters.dateFrom = dateFrom;
    }

    if (dateTo) {
      filters.dateTo = dateTo;
    }

    if (category && category !== 'all') {
      filters.category = category;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      filters.paymentMethod = paymentMethod as PaymentMethod;
    }

    onFiltersChange(filters);

    // Notify parent about active filters
    if (onActiveFiltersChange) {
      onActiveFiltersChange(getActiveFilters());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeName, dateFrom, dateTo, category, paymentMethod, dateRangePreset]);

  // Common categories (can be extended)
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

  return (
    <div
      className="rounded-2xl p-6 mb-6 mx-3 md:mx-4 lg:mx-0"
      style={{
        backgroundColor: '#1E293B',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      {/* Date Range Presets */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <button
          onClick={() => handleDateRangePreset('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            dateRangePreset === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleDateRangePreset('today')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            dateRangePreset === 'today'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => handleDateRangePreset('thisWeek')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            dateRangePreset === 'thisWeek'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => handleDateRangePreset('thisMonth')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            dateRangePreset === 'thisMonth'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          This Month
        </button>

        {/* Reset Button - Only show when filters are active */}
        {hasActiveFilters() && (
          <button
            onClick={handleResetFilters}
            className="ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
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
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date From */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
            FROM
          </label>
          <div className="relative">
            <input
              type="date"
              id="date-from-input"
              value={dateFrom}
              onChange={e => {
                setDateFrom(e.target.value);
                setDateRangePreset('all');
              }}
              className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
              placeholder="yyyy-mm-dd"
              style={{ colorScheme: 'dark' }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('date-from-input') as HTMLInputElement | null;
                input?.showPicker?.() || input?.click();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white cursor-pointer hover:text-blue-400 transition-colors"
              aria-label="Open date picker"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
            TO
          </label>
          <div className="relative">
            <input
              type="date"
              id="date-to-input"
              value={dateTo}
              onChange={e => {
                setDateTo(e.target.value);
                setDateRangePreset('all');
              }}
              className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
              placeholder="yyyy-mm-dd"
              style={{ colorScheme: 'dark' }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('date-to-input') as HTMLInputElement | null;
                input?.showPicker?.() || input?.click();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white cursor-pointer hover:text-blue-400 transition-colors"
              aria-label="Open date picker"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
            CATEGORY
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none appearance-none pr-10"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Store Name Search */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
            STORE
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Search by store name..."
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
            PAYMENT
          </label>
          <div className="relative">
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod | 'all')}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none appearance-none pr-10"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {getActiveFilters().length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {getActiveFilters().map(filter => (
            <div
              key={filter.key}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
              }}
            >
              <span>{filter.label}</span>
              <button
                onClick={filter.onRemove}
                className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceiptSearch;
