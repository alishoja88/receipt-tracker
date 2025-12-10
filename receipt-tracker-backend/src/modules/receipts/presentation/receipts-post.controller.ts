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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateReceiptService } from '../application/create-receipt.service';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { ReceiptResponseDto } from '../dto/receipt-response.dto';
import { ReceiptMapper } from './receipt-mapper.helper';

@Controller('receipts')
export class ReceiptsPostController {
  constructor(private readonly createReceiptService: CreateReceiptService) {}

  /**
   * Upload receipt image (placeholder - will be connected to AI Module later)
   * POST /api/receipts
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
  ): Promise<ReceiptResponseDto> {
    // TODO: Connect to ReceiptProcessingService when AI Module is ready
    // For now, return error that this endpoint needs AI Module
    throw new BadRequestException(
      'Receipt upload requires AI Module. Please use POST /api/receipts/create endpoint with receipt data.',
    );
  }

  /**
   * Create receipt manually (without OCR)
   * POST /api/receipts/create
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createReceipt(@Body() createReceiptDto: CreateReceiptDto): Promise<ReceiptResponseDto> {
    const receipt = await this.createReceiptService.execute(createReceiptDto);
    return ReceiptMapper.toResponseDto(receipt);
  }
}
