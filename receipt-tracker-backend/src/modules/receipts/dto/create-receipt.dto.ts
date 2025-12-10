import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReceiptDto {
  @IsNotEmpty()
  @IsString()
  storeName: string;

  @IsOptional()
  @IsString()
  storeAddress?: string;

  @IsOptional()
  @IsString()
  storePhone?: string;

  @IsOptional()
  @IsString()
  storeCategoryName?: string;

  @IsNotEmpty()
  @IsDateString()
  receiptDate: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items: CreateReceiptItemDto[];
}

export class CreateReceiptItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  total: number;
}
