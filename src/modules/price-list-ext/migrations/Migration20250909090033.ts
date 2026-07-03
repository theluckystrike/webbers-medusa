import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20250909090033 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "price_list_ext" ("id" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "price_list_ext_pkey" primary key ("id"));`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_price_list_ext_deleted_at" ON "price_list_ext" (deleted_at) WHERE deleted_at IS NULL;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "price_list_ext" cascade;`);
  }
}
