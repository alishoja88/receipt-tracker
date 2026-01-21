import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReceiptCategoryAndPaymentMethod1733932800000 implements MigrationInterface {
  name = 'AddReceiptCategoryAndPaymentMethod1733932800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create receipt_category enum
    await queryRunner.query(`
      CREATE TYPE "receipt_category_enum" AS ENUM(
        'GROCERY',
        'HEALTH',
        'EDUCATION',
        'ENTERTAINMENT',
        'TRANSPORTATION',
        'UTILITIES',
        'RESTAURANT',
        'SHOPPING',
        'OTHER'
      )
    `);

    // Create payment_method enum
    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM('CARD', 'CASH', 'OTHER')
    `);

    // Add new columns to receipts table
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "category" "receipt_category_enum",
      ADD COLUMN "payment_method" "payment_method_enum",
      ADD COLUMN "card_type" varchar(50),
      ADD COLUMN "card_last4_digits" varchar(4)
    `);

    // Create index on category for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_receipts_category" ON "receipts"("category")
    `);

    // Create index on payment_method for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_receipts_payment_method" ON "receipts"("payment_method")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_receipts_payment_method"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_receipts_category"`);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN IF EXISTS "card_last4_digits",
      DROP COLUMN IF EXISTS "card_type",
      DROP COLUMN IF EXISTS "payment_method",
      DROP COLUMN IF EXISTS "category"
    `);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "receipt_category_enum"`);
  }
}
