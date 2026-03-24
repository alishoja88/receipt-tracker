import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type SortOption = 'date-newest' | 'date-oldest' | 'amount-high' | 'amount-low';

interface ReceiptSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date-newest', label: 'Date (newest)' },
  { value: 'date-oldest', label: 'Date (oldest)' },
  { value: 'amount-high', label: 'Amount (high to low)' },
  { value: 'amount-low', label: 'Amount (low to high)' },
];

export const ReceiptSort = ({ value, onChange }: ReceiptSortProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-slate-300 transition-all duration-[180ms] hover:border-white/[0.12] hover:bg-white/[0.05]"
      >
        <span>Sort: {selectedOption.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform duration-[180ms] ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/[0.08] shadow-xl"
          style={{
            background: 'linear-gradient(180deg, rgba(18,27,39,0.98), rgba(12,19,30,0.99))',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="p-1">
            {sortOptions.map(option => {
              const isActive = value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-[180ms] ${
                    isActive
                      ? 'bg-teal-500/[0.1] text-teal-300'
                      : 'text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {isActive && <Check className="h-3.5 w-3.5 text-teal-400" />}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
