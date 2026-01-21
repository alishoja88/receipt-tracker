import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OcrService, LlmService, ReceiptProcessingService } from './application';
import { ReceiptsModule } from '../receipts/receipts.module';

@Module({
  imports: [
    ConfigModule, // For environment variables (API keys)
    ReceiptsModule, // For SharedReceiptService and ReceiptsRepository
  ],
  providers: [OcrService, LlmService, ReceiptProcessingService],
  exports: [ReceiptProcessingService, OcrService, LlmService],
})
export class AiModule {}
