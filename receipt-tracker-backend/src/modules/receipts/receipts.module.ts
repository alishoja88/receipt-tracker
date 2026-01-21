import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ReceiptsGetController,
  ReceiptsPostController,
  ReceiptsPutController,
  ReceiptsDeleteController,
} from './presentation';
import {
  CreateReceiptService,
  GetReceiptsService,
  UpdateReceiptService,
  DeleteReceiptService,
  SharedReceiptService,
} from './application';
import { ReceiptsRepository } from './infrastructure/persistence/receipts.repository';
import { Receipt, Category } from './entities';
import { Store } from '../stores/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt, Category, Store]),
    forwardRef(() => import('../ai/ai.module').then(m => m.AiModule)),
  ],
  controllers: [
    ReceiptsGetController,
    ReceiptsPostController,
    ReceiptsPutController,
    ReceiptsDeleteController,
  ],
  providers: [
    ReceiptsRepository,
    CreateReceiptService,
    GetReceiptsService,
    UpdateReceiptService,
    DeleteReceiptService,
    SharedReceiptService,
  ],
  exports: [ReceiptsRepository, SharedReceiptService],
})
export class ReceiptsModule {}
