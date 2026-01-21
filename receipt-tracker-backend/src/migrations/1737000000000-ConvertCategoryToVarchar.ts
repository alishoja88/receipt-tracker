import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertCategoryToVarchar1737000000000 implements MigrationInterface {
  name = 'ConvertCategoryToVarchar1737000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add temporary varchar column
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "category_temp" varchar(100)
    `);

    // Step 2: Copy data from enum to varchar
    await queryRunner.query(`
      UPDATE "receipts"
      SET "category_temp" = "category"::text
      WHERE "category" IS NOT NULL
    `);

    // Step 3: Drop the old enum column
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN "category"
    `);

    // Step 4: Rename temp column to category
    await queryRunner.query(`
      ALTER TABLE "receipts"
      RENAME COLUMN "category_temp" TO "category"
    `);

    // Step 5: Drop the enum type (if no other tables use it)
    await queryRunner.query(`
      DROP TYPE IF EXISTS "receipt_category_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate enum type
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

    // Add temporary enum column
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "category_enum" "receipt_category_enum"
    `);

    // Copy data from varchar to enum (only if value matches enum)
    await queryRunner.query(`
      UPDATE "receipts"
      SET "category_enum" = CASE
        WHEN "category" IN ('GROCERY', 'HEALTH', 'EDUCATION', 'ENTERTAINMENT', 'TRANSPORTATION', 'UTILITIES', 'RESTAURANT', 'SHOPPING', 'OTHER')
        THEN "category"::"receipt_category_enum"
        ELSE 'OTHER'::"receipt_category_enum"
      END
      WHERE "category" IS NOT NULL
    `);

    // Drop varchar column
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP COLUMN "category"
    `);

    // Rename enum column to category
    await queryRunner.query(`
      ALTER TABLE "receipts"
      RENAME COLUMN "category_enum" TO "category"
    `);
  }
}
