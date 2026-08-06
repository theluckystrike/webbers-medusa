import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260107172833 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_review" add column if not exists "title" text null, add column if not exists "metadata" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_review" drop column if exists "title", drop column if exists "metadata";`);
  }

}
