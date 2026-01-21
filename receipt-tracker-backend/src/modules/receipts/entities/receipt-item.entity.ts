import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Receipt } from './receipt.entity';

@Entity('receipt_items')
export class ReceiptItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Receipt, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receipt_id' })
  receipt: Receipt;

  @Column({ name: 'receipt_id' })
  receiptId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
