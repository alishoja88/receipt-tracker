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
    // Display mode
    if (type === 'category') {
      return (
        <span
          className={`badge ${getCategoryBadgeClass(value as any)} ${className} px-3.5 py-1.5 rounded-full text-xs font-semibold inline-block`}
        >
          {getCategoryLabel(value as any)}
        </span>
      );
    }
    return (
      <span className={`${className} text-base font-semibold text-slate-800`}>
        {formatPaymentMethod(value)}
      </span>
    );
  }

  // Edit mode
  const selectClasses =
    'w-full px-2.5 py-1.5 pr-8 rounded-md border-2 border-blue-500 bg-white text-slate-800 text-sm font-semibold outline-none focus:border-blue-600 cursor-pointer appearance-none';
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
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-800" />
    </div>
  );
};
