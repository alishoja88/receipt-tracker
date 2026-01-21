import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContactMessagesTable1740000000000 implements MigrationInterface {
  name = 'CreateContactMessagesTable1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "contact_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "message" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contact_messages" PRIMARY KEY ("id")
      )
    `);

    // Create index on email for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_contact_messages_email" ON "contact_messages"("email")
    `);

    // Create index on isRead for filtering unread messages
    await queryRunner.query(`
      CREATE INDEX "IDX_contact_messages_isRead" ON "contact_messages"("isRead")
    `);

    // Create index on createdAt for sorting
    await queryRunner.query(`
      CREATE INDEX "IDX_contact_messages_createdAt" ON "contact_messages"("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contact_messages_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contact_messages_isRead"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contact_messages_email"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_messages"`);
  }
}
