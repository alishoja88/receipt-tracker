import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveStoresAndCategoriesTables1739000000000 implements MigrationInterface {
  name = 'RemoveStoresAndCategoriesTables1739000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop stores table (no longer needed - store name is in receipts)
    await queryRunner.query(`
      DROP TABLE IF EXISTS "stores" CASCADE
    `);

    // Drop categories table (no longer needed - category is varchar in receipts)
    await queryRunner.query(`
      DROP TABLE IF EXISTS "categories" CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate categories table
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

    // Recreate stores table
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
  }
}
