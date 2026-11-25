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
} from './application';
import { ReceiptsRepository } from './infrastructure/persistence/receipts.repository';
import { Receipt } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt]),
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
  ],
  exports: [ReceiptsRepository],
})
export class ReceiptsModule {}
