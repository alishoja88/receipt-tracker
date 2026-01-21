/**
 * Category-based receipt data (one per category)
 * Items are analyzed internally by LLM but not returned
 */
export interface CategoryReceipt {
  /**
   * Receipt category (e.g., 'GROCERY', 'HEALTH', 'EDUCATION')
   */
  category: string;

  /**
   * Total amount for this category (sum of all items in this category + tax if applicable)
   */
  total: number;

  /**
   * Subtotal for this category (sum of items before tax, if available)
   */
  subtotal?: number;

  /**
   * Tax for this category (if tax can be distributed to this category)
   * If tax cannot be distributed, it should be added to one category only
   */
  tax?: number;
}

/**
 * Parsed receipt data from LLM
 * Can return single category or multiple categories
 */
export interface ParsedReceipt {
  /**
   * Store information
   */
  store: {
    name: string;
    address?: string;
    phone?: string;
    categoryName?: string;
  };

  /**
   * Receipt date (ISO string)
   */
  receiptDate: string;

  /**
   * Payment method (e.g., 'CARD', 'CASH', 'OTHER')
   * Only the method type is stored, not card details
   */
  paymentMethod?: string;

  /**
   * Category-based receipts
   * If single category: array with one element
   * If multiple categories: array with multiple elements, one per category
   */
  categoryReceipts: CategoryReceipt[];

  /**
   * Overall financial totals (for the entire receipt)
   */
  totals: {
    subtotal?: number;
    tax?: number;
    total: number;
  };

  /**
   * Confidence in parsing accuracy
   */
  confidence?: number;

  /**
   * Whether this receipt needs manual review
   */
  needsReview?: boolean;
}
