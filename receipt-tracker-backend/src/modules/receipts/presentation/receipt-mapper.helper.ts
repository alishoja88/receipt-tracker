import { ReceiptResponseDto } from '../dto/receipt-response.dto';

/**
 * Helper class for mapping Receipt entities to DTOs
 */
export class ReceiptMapper {
  /**
   * Map Receipt entity to ReceiptResponseDto
   */
  static toResponseDto(receipt: any): ReceiptResponseDto {
    return {
      id: receipt.id,
      store: {
        id: receipt.store.id,
        name: receipt.store.name,
        address: receipt.store.address,
        phone: receipt.store.phone,
        category: receipt.store.category
          ? {
              id: receipt.store.category.id,
              name: receipt.store.category.name,
              description: receipt.store.category.description,
            }
          : null,
      },
      receiptDate: receipt.receiptDate,
      currency: receipt.currency,
      subtotal: receipt.subtotal,
      tax: receipt.tax,
      total: receipt.total,
      status: receipt.status,
      needsReview: receipt.needsReview,
      items: receipt.items
        ? receipt.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            total: parseFloat(item.total),
          }))
        : [],
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };
  }

  /**
   * Map Receipt entity to list item DTO (simplified)
   */
  static toListItemDto(receipt: any) {
    return {
      id: receipt.id,
      store: {
        id: receipt.store.id,
        name: receipt.store.name,
      },
      receiptDate: receipt.receiptDate,
      total: parseFloat(receipt.total),
      status: receipt.status,
      needsReview: receipt.needsReview,
      itemsCount: receipt.items ? receipt.items.length : 0,
      createdAt: receipt.createdAt,
    };
  }
}
