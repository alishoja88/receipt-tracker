import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  StoresPostController,
  StoresGetController,
  StoresPutController,
  StoresDeleteController,
} from './presentation';
import {
  CreateStoreService,
  GetStoresService,
  UpdateStoreService,
  DeleteStoreService,
  SharedStoreService,
} from './application';
import { StoresRepository } from './infrastructure/persistence/stores.repository';
import { Store } from './entities/store.entity';
import { Category } from '../receipts/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Category])],
  controllers: [
    StoresPostController,
    StoresGetController,
    StoresPutController,
    StoresDeleteController,
  ],
  providers: [
    StoresRepository,
    CreateStoreService,
    GetStoresService,
    UpdateStoreService,
    DeleteStoreService,
    SharedStoreService,
  ],
  exports: [StoresRepository, SharedStoreService],
})
export class StoresModule {}
