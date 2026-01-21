import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCurrencyColumn1734000000000 implements MigrationInterface {
  name = 'RemoveCurrencyColumn1734000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN IF EXISTS "currency"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "currency" varchar(10)
    `);
  }
}
