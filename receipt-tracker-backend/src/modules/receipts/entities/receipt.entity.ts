import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ReceiptStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  OTHER = 'OTHER',
}

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'store_name', type: 'varchar', length: 255 })
  storeName: string;

  @Column({ name: 'receipt_date', type: 'date' })
  receiptDate: Date;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  category: string | null;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tax: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: ReceiptStatus,
    default: ReceiptStatus.PROCESSING,
  })
  status: ReceiptStatus;

  @Column({ name: 'needs_review', type: 'boolean', default: false })
  needsReview: boolean;

  @Column({ name: 'raw_ocr_text', type: 'text', nullable: true })
  rawOcrText: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
