import { Migration } from '@medusajs/framework/mikro-orm/migrations';

export class Migration20260930120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`ALTER TABLE IF EXISTS "review" ADD COLUMN IF NOT EXISTS "has_images" boolean NOT NULL DEFAULT false;`);
    this.addSql(
      `UPDATE "review" SET "has_images" = true WHERE EXISTS (SELECT 1 FROM "review_image" WHERE "review_image"."review_id" = "review"."id" AND "review_image"."deleted_at" IS NULL);`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE IF EXISTS "review" DROP COLUMN IF EXISTS "has_images";`);
  }
}
