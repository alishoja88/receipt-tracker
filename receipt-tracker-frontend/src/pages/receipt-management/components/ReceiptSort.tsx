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

  // Close dropdown when clicking outside
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
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          backgroundColor: '#1E293B',
          color: '#F1F5F9',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
        }}
      >
        <span>✓ Sort by: {selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50"
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <div className="py-1">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
                style={{
                  color: value === option.value ? '#3B82F6' : '#F1F5F9',
                  backgroundColor:
                    value === option.value ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (value !== option.value) {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (value !== option.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {value === option.value && <Check className="w-4 h-4" />}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
