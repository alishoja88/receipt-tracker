import { ChevronDown } from 'lucide-react';
import type { ReceiptListItem } from '@/modules/receipts/types/receipt.types';
import { PaymentMethod as PaymentMethodEnum } from '@/modules/receipts/types/receipt.types';
import {
  getCategoryBadgeClass,
  getCategoryLabel,
  formatPaymentMethod,
  categories,
} from '../../utils/receiptUtils';

interface ReceiptEditableSelectProps {
  receipt: ReceiptListItem;
  type: 'paymentMethod' | 'category';
  isEditing: boolean;
  value: string | null;
  onFieldChange: (receiptId: string, field: string, value: string) => void;
  className?: string;
}

const paymentMethods = [
  { value: PaymentMethodEnum.CARD, label: 'Credit Card' },
  { value: PaymentMethodEnum.CASH, label: 'Cash' },
  { value: PaymentMethodEnum.OTHER, label: 'Other' },
];

export const ReceiptEditableSelect = ({
  receipt,
  type,
  isEditing,
  value,
  onFieldChange,
  className = '',
}: ReceiptEditableSelectProps) => {
  if (!isEditing) {
    if (type === 'category') {
      return (
        <span
          className={`badge ${getCategoryBadgeClass(value as any)} ${className} inline-block rounded-lg px-2.5 py-1 text-xs font-medium`}
        >
          {getCategoryLabel(value as any)}
        </span>
      );
    }
    return (
      <span className={`${className} text-sm font-medium text-slate-300`}>
        {formatPaymentMethod(value)}
      </span>
    );
  }

  const selectClasses =
    'w-full appearance-none rounded-lg border border-teal-500/40 bg-slate-900/60 px-2.5 py-1.5 pr-8 text-sm font-medium text-white outline-none transition-all duration-[180ms] focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 cursor-pointer';
  const options = type === 'category' ? categories : paymentMethods;
  const placeholder = type === 'category' ? 'Select Category' : 'Select Payment Method';

  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={e => {
          const selectedValue = e.target.value;
          if (selectedValue !== '') {
            onFieldChange(receipt.id, type, selectedValue);
          }
        }}
        className={`${selectClasses} ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
};
