import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260108133836 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_review" alter column "age" type text using ("age"::text);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_review" alter column "age" type integer using ("age"::integer);`);
  }

}
