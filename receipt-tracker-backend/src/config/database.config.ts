import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Store } from '../modules/stores/entities';
import { Category, Receipt, ReceiptItem } from '../modules/receipts/entities';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [Store, Category, Receipt, ReceiptItem],
  synchronize: configService.get<string>('NODE_ENV') !== 'production',
  logging: configService.get<string>('NODE_ENV') === 'development',
});
