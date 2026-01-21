import type { ReceiptListItem } from '@/modules/receipts/types/receipt.types';

const DEMO_STORAGE_KEY = 'demo_receipts';
const MAX_DEMO_RECEIPTS = 2;

// Generate mock receipt data from uploaded file
export const generateMockReceipt = (fileName: string): ReceiptListItem => {
  const mockStores = [
    'Walmart',
    'Target',
    'Starbucks',
    'Amazon',
    'Best Buy',
    'Costco',
    'Home Depot',
  ];
  const mockCategories = [
    'GROCERY',
    'SHOPPING',
    'RESTAURANT',
    'ENTERTAINMENT',
    'HEALTH',
    'UTILITIES',
    'TRANSPORTATION',
  ];
  const mockAmounts = [25.99, 45.5, 12.99, 89.99, 150.0, 67.25, 33.75, 199.99];

  const randomStore = mockStores[Math.floor(Math.random() * mockStores.length)];
  const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
  const randomAmount = mockAmounts[Math.floor(Math.random() * mockAmounts.length)];

  const today = new Date();
  const randomDaysAgo = Math.floor(Math.random() * 30);
  const receiptDate = new Date(today);
  receiptDate.setDate(today.getDate() - randomDaysAgo);

  return {
    id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    storeName: randomStore,
    receiptDate: receiptDate.toISOString().split('T')[0],
    category: randomCategory,
    total: randomAmount,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    needsReview: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Get demo receipts from localStorage
export const getDemoReceipts = (): ReceiptListItem[] => {
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load demo receipts:', e);
  }
  return [];
};

// Save demo receipt to localStorage
export const saveDemoReceipt = (receipt: ReceiptListItem): boolean => {
  const existing = getDemoReceipts();

  // Check limit
  if (existing.length >= MAX_DEMO_RECEIPTS) {
    return false;
  }

  const updated = [...existing, receipt];
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save demo receipt:', e);
    return false;
  }
};

// Delete demo receipt from localStorage
export const deleteDemoReceipt = (id: string): void => {
  const existing = getDemoReceipts();
  const updated = existing.filter(r => r.id !== id);
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete demo receipt:', e);
  }
};

// Check if can add more receipts
export const canAddMoreDemoReceipts = (): boolean => {
  return getDemoReceipts().length < MAX_DEMO_RECEIPTS;
};

// Get remaining uploads count
export const getRemainingDemoUploads = (): number => {
  return Math.max(0, MAX_DEMO_RECEIPTS - getDemoReceipts().length);
};
