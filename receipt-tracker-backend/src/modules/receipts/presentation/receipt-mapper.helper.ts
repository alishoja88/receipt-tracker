import { ReceiptResponseDto } from '../dto/receipt-response.dto';
import { formatDateToISO } from '../../common/utils/date.util';

/**
 * Helper class for mapping Receipt entities to DTOs
 */
export class ReceiptMapper {
  /**
   * Map Receipt entity to ReceiptResponseDto
   */
  static toResponseDto(receipt: any): ReceiptResponseDto {
    // Format receiptDate to YYYY-MM-DD string to avoid timezone issues
    const receiptDate =
      receipt.receiptDate instanceof Date
        ? formatDateToISO(receipt.receiptDate)
        : receipt.receiptDate;

    return {
      id: receipt.id,
      storeName: receipt.storeName,
      receiptDate: receiptDate, // Format as YYYY-MM-DD string to avoid timezone conversion
      category: receipt.category,
      paymentMethod: receipt.paymentMethod,
      subtotal: receipt.subtotal ? parseFloat(receipt.subtotal) : null,
      tax: receipt.tax ? parseFloat(receipt.tax) : null,
      total: parseFloat(receipt.total),
      status: receipt.status,
      needsReview: receipt.needsReview,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };
  }

  /**
   * Map Receipt entity to list item DTO (simplified)
   */
  static toListItemDto(receipt: any) {
    // Format receiptDate to YYYY-MM-DD string to avoid timezone issues
    const receiptDate =
      receipt.receiptDate instanceof Date
        ? formatDateToISO(receipt.receiptDate)
        : receipt.receiptDate;

    return {
      id: receipt.id,
      storeName: receipt.storeName,
      receiptDate: receiptDate, // Format as YYYY-MM-DD string to avoid timezone conversion
      total: parseFloat(receipt.total),
      status: receipt.status,
      needsReview: receipt.needsReview,
      createdAt: receipt.createdAt,
      category: receipt.category || null,
      paymentMethod: receipt.paymentMethod || null,
    };
  }
}
