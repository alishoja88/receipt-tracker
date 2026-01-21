import { ReceiptStatus, PaymentMethod } from '../entities/receipt.entity';

export class ReceiptResponseDto {
  id: string;
  storeName: string;
  receiptDate: string | Date; // Can be string (YYYY-MM-DD) or Date for backward compatibility
  category: string | null;
  paymentMethod: PaymentMethod | null;
  subtotal: number | null;
  tax: number | null;
  total: number;
  status: ReceiptStatus;
  needsReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}
