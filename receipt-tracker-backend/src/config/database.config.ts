import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Receipt } from '../modules/receipts/entities';
import { User, RefreshToken } from '../modules/auth/entities';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [Receipt, User, RefreshToken],
  synchronize: false, // NEVER use true - it drops all data! Use migrations instead
  logging: configService.get<string>('NODE_ENV') === 'development',
});
