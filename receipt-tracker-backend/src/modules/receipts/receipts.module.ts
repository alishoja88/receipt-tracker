import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ReceiptsGetController,
  ReceiptsPostController,
  ReceiptsPutController,
  ReceiptsDeleteController,
} from './presentation';
import { ReceiptService } from './application/receipt.service';
import {
  CreateReceiptService,
  GetReceiptsService,
  UpdateReceiptService,
  DeleteReceiptService,
  SharedReceiptService,
} from './application';
import { ReceiptsRepository } from './infrastructure/persistence/receipts.repository';
import { Receipt, ReceiptItem, Category } from './entities';
import { Store } from '../stores/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Receipt, ReceiptItem, Category, Store])],
  controllers: [
    ReceiptsGetController,
    ReceiptsPostController,
    ReceiptsPutController,
    ReceiptsDeleteController,
  ],
  providers: [
    ReceiptService,
    ReceiptsRepository,
    CreateReceiptService,
    GetReceiptsService,
    UpdateReceiptService,
    DeleteReceiptService,
    SharedReceiptService,
  ],
  exports: [ReceiptsRepository],
})
export class ReceiptsModule {}
