import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL UNIQUE,
        "description" varchar(500),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "stores" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "address" varchar(500),
        "phone" varchar(50),
        "category_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stores" PRIMARY KEY ("id"),
        CONSTRAINT "FK_stores_category" FOREIGN KEY ("category_id") 
          REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "receipt_status_enum" AS ENUM('PROCESSING', 'COMPLETED', 'FAILED', 'NEEDS_REVIEW')
    `);

    await queryRunner.query(`
      CREATE TABLE "receipts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "store_id" uuid NOT NULL,
        "receipt_date" date NOT NULL,
        "currency" varchar(10),
        "subtotal" decimal(10,2),
        "tax" decimal(10,2),
        "total" decimal(10,2) NOT NULL,
        "status" "receipt_status_enum" NOT NULL DEFAULT 'PROCESSING',
        "needs_review" boolean NOT NULL DEFAULT false,
        "raw_ocr_text" text,
        "image_url" varchar(500),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_receipts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_receipts_store" FOREIGN KEY ("store_id") 
          REFERENCES "stores"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "receipt_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "receipt_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "total" decimal(10,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_receipt_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_receipt_items_receipt" FOREIGN KEY ("receipt_id") 
          REFERENCES "receipts"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_stores_category" ON "stores"("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_receipts_store" ON "receipts"("store_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_receipts_date" ON "receipts"("receipt_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_receipts_status" ON "receipts"("status")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_receipt_items_receipt" ON "receipt_items"("receipt_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_receipt_items_receipt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_receipts_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_receipts_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_receipts_store"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_stores_category"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "receipt_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "receipts"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "receipt_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stores"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
  }
}
