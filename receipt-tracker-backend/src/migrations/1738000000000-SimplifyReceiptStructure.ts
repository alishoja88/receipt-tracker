import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyReceiptStructure1738000000000 implements MigrationInterface {
  name = 'SimplifyReceiptStructure1738000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add store_name column
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "store_name" varchar(255)
    `);

    // Step 2: Copy store names from stores table to receipts
    await queryRunner.query(`
      UPDATE "receipts" r
      SET "store_name" = s.name
      FROM "stores" s
      WHERE r.store_id = s.id
    `);

    // Step 3: Make store_name NOT NULL after data migration
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ALTER COLUMN "store_name" SET NOT NULL
    `);

    // Step 4: Drop foreign key constraint to stores
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP CONSTRAINT IF EXISTS "FK_receipts_store"
    `);

    // Step 5: Drop store_id column
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN "store_id"
    `);

    // Step 6: Remove card fields (should have been removed earlier)
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN IF EXISTS "cardType"
    `);

    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN IF EXISTS "cardLast4Digits"
    `);

    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN IF EXISTS "card_type"
    `);

    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN IF EXISTS "card_last4_digits"
    `);

    // Step 7: Create index on store_name for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_receipts_store_name" ON "receipts"("store_name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_receipts_store_name"
    `);

    // Re-add card columns
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "card_type" varchar(50)
    `);

    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "card_last4_digits" varchar(4)
    `);

    // Re-add store_id column
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "store_id" uuid
    `);

    // Note: Cannot restore store_id relationships automatically
    // Manual intervention would be needed

    // Drop store_name column
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN "store_name"
    `);
  }
}
