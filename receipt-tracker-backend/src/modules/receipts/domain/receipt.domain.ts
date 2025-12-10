/**
 * Domain Layer - Rich Domain Model
 *
 * This file contains Domain Logic and Business Rules
 * that are independent of Infrastructure and Presentation layers.
 */

import { ReceiptStatus } from '../entities/receipt.entity';

/**
 * Domain Service for Business Logic
 */
export class ReceiptDomain {
  /**
   * Checks if a receipt needs review based on business rules
   * Returns true if subtotal + tax != total or items total != receipt total
   */
  static needsReview(receipt: {
    total: number;
    subtotal: number | null;
    tax: number | null;
    items: Array<{ total: number }>;
  }): boolean {
    // If subtotal + tax != total, needs review
    if (receipt.subtotal !== null && receipt.tax !== null) {
      const calculatedTotal = receipt.subtotal + receipt.tax;
      const difference = Math.abs(calculatedTotal - receipt.total);

      // If difference is greater than 0.01, needs review
      if (difference > 0.01) {
        return true;
      }
    }

    // If sum of items differs from total, needs review
    const itemsTotal = receipt.items.reduce((sum, item) => sum + item.total, 0);
    const itemsDifference = Math.abs(itemsTotal - receipt.total);

    if (itemsDifference > 0.01) {
      return true;
    }

    return false;
  }

  /**
   * Calculates total from items array
   */
  static calculateTotalFromItems(items: Array<{ total: number }>): number {
    return items.reduce((sum, item) => sum + item.total, 0);
  }

  /**
   * Checks if receipt can be edited based on its status
   */
  static canEdit(status: ReceiptStatus): boolean {
    return status !== ReceiptStatus.PROCESSING;
  }

  /**
   * Checks if receipt can be deleted based on its status
   */
  static canDelete(status: ReceiptStatus): boolean {
    return status !== ReceiptStatus.PROCESSING;
  }
}
