import { useState, useEffect } from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';
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

const presetOptions: { key: TimePeriodPreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: '7D' },
  { key: 'thisMonth', label: '30D' },
  { key: 'thisYear', label: '1Y' },
];

export const DashboardFilters = ({ onFiltersChange }: DashboardFiltersProps) => {
  const [preset, setPreset] = useState<TimePeriodPreset>('thisMonth');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categories.map(cat => cat.value),
  );

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
      case 'thisYear': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
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

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const newDateFrom = type === 'from' ? value : dateFrom;
    const newDateTo = type === 'to' ? value : dateTo;

    if (type === 'from') setDateFrom(value);
    else setDateTo(value);

    setPreset('custom');
    onFiltersChange?.({
      preset: 'custom',
      dateFrom: newDateFrom,
      dateTo: newDateTo,
      selectedCategories,
    });
  };

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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Time period */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.015] p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-sm font-medium text-slate-200">Time period</p>
            <p className="text-xs text-slate-500">Quick range presets</p>
          </div>
        </div>

        <div className="flex gap-2">
          {presetOptions.map(p => (
            <button
              key={p.key}
              onClick={() => handlePresetSelect(p.key)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-[180ms] ${
                preset === p.key
                  ? 'border border-teal-500/30 bg-teal-500/[0.14] text-teal-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date range */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.015] p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-sm font-medium text-slate-200">Date range</p>
            <p className="text-xs text-slate-500">Custom boundaries</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => handleDateChange('from', e.target.value)}
              className="h-10 w-full rounded-lg border border-white/[0.08] bg-slate-900/60 px-3 text-sm text-slate-200 transition-colors duration-[180ms] focus:border-teal-500/50 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => handleDateChange('to', e.target.value)}
              className="h-10 w-full rounded-lg border border-white/[0.08] bg-slate-900/60 px-3 text-sm text-slate-200 transition-colors duration-[180ms] focus:border-teal-500/50 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.015] p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <Tag className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-sm font-medium text-slate-200">Categories</p>
            <p className="text-xs text-slate-500">Multi-select filters</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isOn = selectedCategories.includes(cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryToggle(cat.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-[180ms] ${
                  isOn
                    ? 'border border-teal-500/30 bg-teal-500/[0.14] text-teal-300'
                    : 'border border-white/[0.06] text-slate-400 hover:border-white/[0.10] hover:text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
