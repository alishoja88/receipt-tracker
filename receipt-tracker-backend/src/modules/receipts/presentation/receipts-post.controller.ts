import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Inject,
  forwardRef,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, CurrentUser } from '../../auth/presentation';
import { CreateReceiptService } from '../application/create-receipt.service';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { ReceiptResponseDto } from '../dto/receipt-response.dto';
import { ReceiptMapper } from './receipt-mapper.helper';
import { ReceiptProcessingService } from '../../ai/application';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsPostController {
  constructor(
    private readonly createReceiptService: CreateReceiptService,
    @Inject(forwardRef(() => ReceiptProcessingService))
    private readonly receiptProcessingService: ReceiptProcessingService,
  ) {}

  /**
   * Upload receipt image and process with AI
   * POST /api/receipts
   * Returns array of receipts (one per category)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|pdf)$/,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: { userId: string; email: string },
  ): Promise<ReceiptResponseDto[]> {
    // Check if AI services are available
    const availability = this.receiptProcessingService.isAvailable();
    if (!availability.available) {
      const missing: string[] = [];
      if (!availability.ocr) missing.push('OCR_API_KEY');
      if (!availability.llm) missing.push('OPENAI_API_KEY');

      throw new BadRequestException(
        `AI services are not configured. Missing: ${missing.join(', ')}. Please set these environment variables or use POST /api/receipts/create for manual entry.`,
      );
    }

    // Process receipt with AI (returns array of receipts, one per category)
    const receipts = await this.receiptProcessingService.processReceiptImage(
      file.buffer,
      file.mimetype,
      user.userId,
    );

    return receipts.map(receipt => ReceiptMapper.toResponseDto(receipt));
  }

  /**
   * Create receipt manually (without OCR)
   * POST /api/receipts/create
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createReceipt(
    @Body() createReceiptDto: CreateReceiptDto,
    @CurrentUser() user: { userId: string; email: string },
  ): Promise<ReceiptResponseDto> {
    const receipt = await this.createReceiptService.execute(createReceiptDto, user.userId);
    return ReceiptMapper.toResponseDto(receipt);
  }
}
