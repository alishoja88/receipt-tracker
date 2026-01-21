import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToReceiptsAndRemoveCardFields1736000000000 implements MigrationInterface {
  name = 'AddUserIdToReceiptsAndRemoveCardFields1736000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add user_id column to receipts table
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "user_id" uuid
    `);

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD CONSTRAINT "FK_receipts_user_id"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    // Create index for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_receipts_user_id" ON "receipts"("user_id")
    `);

    // Delete any existing receipts that don't have a user (if any exist)
    // This ensures data integrity before making user_id NOT NULL
    await queryRunner.query(`
      DELETE FROM "receipts" WHERE "user_id" IS NULL
    `);

    // Make user_id NOT NULL after cleaning up
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ALTER COLUMN "user_id" SET NOT NULL
    `);

    // Remove card_type and card_last4_digits columns
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN IF EXISTS "card_type"
    `);

    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN IF EXISTS "card_last4_digits"
    `);

    // Drop receipt_items table (no longer needed)
    await queryRunner.query(`
      DROP TABLE IF EXISTS "receipt_items" CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back card columns
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "card_type" varchar(50)
    `);

    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "card_last4_digits" varchar(4)
    `);

    // Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_receipts_user_id"
    `);

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP CONSTRAINT IF EXISTS "FK_receipts_user_id"
    `);

    // Remove user_id column
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN IF EXISTS "user_id"
    `);
  }
}
