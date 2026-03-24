import { parseLocalDate, formatDateToISO } from '@/utils/date.util';
import { formatDate as formatLocalDate } from '@/utils/date.util';
import type { ReceiptListItem } from '@/modules/receipts/types/receipt.types';

interface ReceiptEditableFieldProps {
  receipt: ReceiptListItem;
  field: 'storeName' | 'receiptDate' | 'total';
  type?: 'text' | 'date' | 'number';
  isEditing: boolean;
  value: string | number | null;
  onFieldChange: (receiptId: string, field: string, value: string | number) => void;
  className?: string;
}

export const ReceiptEditableField = ({
  receipt,
  field,
  type = 'text',
  isEditing,
  value,
  onFieldChange,
  className = '',
}: ReceiptEditableFieldProps) => {
  if (!isEditing) {
    if (field === 'total') {
      return (
        <span className={`${className} text-sm font-bold text-teal-400`}>
          ${Number(value || 0).toFixed(2)}
        </span>
      );
    }
    if (field === 'receiptDate') {
      return (
        <span className={`${className} text-sm text-slate-400`}>
          {formatLocalDate(value as string)}
        </span>
      );
    }
    return (
      <span className={`${className} text-sm font-semibold text-white break-words`}>
        {value as string}
      </span>
    );
  }

  const baseInputClasses =
    'w-full rounded-lg border border-teal-500/40 bg-slate-900/60 px-2.5 py-1.5 text-sm font-medium text-white outline-none transition-all duration-[180ms] focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 [&::-webkit-calendar-picker-indicator]:invert';

  if (field === 'receiptDate') {
    const dateValue = value ? formatDateToISO(parseLocalDate(value as string)) : '';
    return (
      <input
        type="date"
        value={dateValue}
        onChange={e => onFieldChange(receipt.id, field, e.target.value)}
        className={`${baseInputClasses} ${className}`}
      />
    );
  }

  if (field === 'total') {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-slate-400">$</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value || 0}
          onChange={e => onFieldChange(receipt.id, field, parseFloat(e.target.value) || 0)}
          className={`${baseInputClasses} ${className}`}
        />
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value as string}
      onChange={e => onFieldChange(receipt.id, field, e.target.value)}
      className={`${baseInputClasses} ${className}`}
    />
  );
};
