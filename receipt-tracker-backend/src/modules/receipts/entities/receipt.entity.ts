import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { ReceiptItem } from './receipt-item.entity';

export enum ReceiptStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Store, store => store.receipts, { eager: true })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'store_id' })
  storeId: string;

  @Column({ type: 'date' })
  receiptDate: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string | null;

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

  @Column({ type: 'boolean', default: false })
  needsReview: boolean;

  @Column({ type: 'text', nullable: true })
  rawOcrText: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @OneToMany(() => ReceiptItem, item => item.receipt, { cascade: true })
  items: ReceiptItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
