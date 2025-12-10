import { ReceiptStatus } from '../entities/receipt.entity';

export class CategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
}

export class StoreResponseDto {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  category: CategoryResponseDto | null;
}

export class ReceiptItemResponseDto {
  id: string;
  name: string;
  total: number;
}

export class ReceiptResponseDto {
  id: string;
  store: StoreResponseDto;
  receiptDate: Date;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number;
  status: ReceiptStatus;
  needsReview: boolean;
  items: ReceiptItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
