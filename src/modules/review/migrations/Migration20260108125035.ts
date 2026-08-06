import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260108125035 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_review" add column if not exists "gender" text null, add column if not exists "city" text null, add column if not exists "age" integer null, add column if not exists "recommend" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_review" drop column if exists "gender", drop column if exists "city", drop column if exists "age", drop column if exists "recommend";`);
  }

}
