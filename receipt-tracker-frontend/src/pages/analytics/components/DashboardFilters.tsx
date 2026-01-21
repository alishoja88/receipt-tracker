import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { categories } from '../../receipt-management/utils/receiptUtils';

type TimePeriodPreset = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

interface DashboardFiltersProps {
  onFiltersChange?: (filters: {
    preset: TimePeriodPreset;
    dateFrom: string;
    dateTo: string;
    selectedCategories: string[];
  }) => void;
}

export const DashboardFilters = ({ onFiltersChange }: DashboardFiltersProps) => {
  const [preset, setPreset] = useState<TimePeriodPreset>('thisMonth');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categories.map(cat => cat.value),
  );

  // Calculate date ranges for presets
  const getDateRange = (presetType: TimePeriodPreset): { from: string; to: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (presetType) {
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
      case 'thisYear': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        // Use today as end date instead of end of year (since we don't have future data)
        const yearEnd = today;
        return {
          from: yearStart.toISOString().split('T')[0],
          to: yearEnd.toISOString().split('T')[0],
        };
      }
      default:
        return { from: '', to: '' };
    }
  };

  // Handle preset selection
  const handlePresetSelect = (presetType: TimePeriodPreset) => {
    setPreset(presetType);
    if (presetType !== 'custom') {
      const range = getDateRange(presetType);
      setDateFrom(range.from);
      setDateTo(range.to);
      onFiltersChange?.({
        preset: presetType,
        dateFrom: range.from,
        dateTo: range.to,
        selectedCategories,
      });
    }
  };

  // Handle date change (custom dates)
  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const newDateFrom = type === 'from' ? value : dateFrom;
    const newDateTo = type === 'to' ? value : dateTo;

    if (type === 'from') {
      setDateFrom(value);
    } else {
      setDateTo(value);
    }

    // When user manually selects dates, switch to custom preset
    setPreset('custom');
    onFiltersChange?.({
      preset: 'custom',
      dateFrom: newDateFrom,
      dateTo: newDateTo,
      selectedCategories,
    });
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryValue: string) => {
    const newSelected = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter(cat => cat !== categoryValue)
      : [...selectedCategories, categoryValue];

    setSelectedCategories(newSelected);
    onFiltersChange?.({
      preset,
      dateFrom,
      dateTo,
      selectedCategories: newSelected,
    });
  };

  // Initialize dates on mount
  useEffect(() => {
    const range = getDateRange(preset);
    setDateFrom(range.from);
    setDateTo(range.to);
    onFiltersChange?.({
      preset,
      dateFrom: range.from,
      dateTo: range.to,
      selectedCategories,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* TIME PERIOD Section */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
            TIME PERIOD
          </h3>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => handlePresetSelect('today')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                preset === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handlePresetSelect('thisWeek')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                preset === 'thisWeek'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handlePresetSelect('thisMonth')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                preset === 'thisMonth'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handlePresetSelect('thisYear')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                preset === 'thisYear'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              This Year
            </button>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="dashboard-date-from-input"
                  value={dateFrom}
                  onChange={e => handleDateChange('from', e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                  style={{ colorScheme: 'dark' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(
                      'dashboard-date-from-input',
                    ) as HTMLInputElement | null;
                    input?.showPicker?.() || input?.click();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white cursor-pointer hover:text-blue-400 transition-colors"
                  aria-label="Open date picker"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="dashboard-date-to-input"
                  value={dateTo}
                  onChange={e => handleDateChange('to', e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                  style={{ colorScheme: 'dark' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(
                      'dashboard-date-to-input',
                    ) as HTMLInputElement | null;
                    input?.showPicker?.() || input?.click();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white cursor-pointer hover:text-blue-400 transition-colors"
                  aria-label="Open date picker"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORIES Section */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
            CATEGORIES
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {categories.map(category => (
              <label
                key={category.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 rounded-lg p-2 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.value)}
                  onChange={() => handleCategoryToggle(category.value)}
                  className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm text-white font-medium">{category.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
