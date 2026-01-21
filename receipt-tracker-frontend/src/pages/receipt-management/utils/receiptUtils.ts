import type { ReceiptCategory } from '@/modules/receipts/types/receipt.types';

export const getCategoryBadgeClass = (category: ReceiptCategory | null | undefined): string => {
  if (!category) return 'badge-food';

  const categoryUpper = category.toUpperCase();

  // Food-related categories
  if (
    categoryUpper.includes('GROCERY') ||
    categoryUpper.includes('RESTAURANT') ||
    categoryUpper.includes('FOOD')
  ) {
    return 'badge-food';
  }

  // Personal/Shopping categories
  if (
    categoryUpper.includes('SHOPPING') ||
    categoryUpper.includes('ENTERTAINMENT') ||
    categoryUpper.includes('PERSONAL')
  ) {
    return 'badge-personal';
  }

  // Business categories
  if (
    categoryUpper.includes('EDUCATION') ||
    categoryUpper.includes('HEALTH') ||
    categoryUpper.includes('TRANSPORTATION') ||
    categoryUpper.includes('UTILITIES') ||
    categoryUpper.includes('BUSINESS')
  ) {
    return 'badge-business';
  }

  // Default to food badge
  return 'badge-food';
};

export const getCategoryLabel = (category: ReceiptCategory | null | undefined): string => {
  if (!category) return 'Other';

  // Convert category to display format (capitalize first letter of each word)
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatPaymentMethod = (method: string | null | undefined): string => {
  if (!method) return 'N/A';

  switch (method) {
    case 'CARD':
      return 'Credit Card';
    case 'CASH':
      return 'Cash';
    case 'DEBIT':
      return 'Debit Card';
    default:
      return method;
  }
};

// Categories list
export const categories = [
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
