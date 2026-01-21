import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesController } from './presentation/expenses.controller';
import { ExpensesService } from './application/expenses.service';
import { Receipt } from '../receipts/entities/receipt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receipt])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
