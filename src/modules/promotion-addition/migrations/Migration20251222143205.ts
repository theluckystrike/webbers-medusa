import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251222143205 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "always_free" ("id" text not null, "always_free" boolean not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "always_free_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_always_free_deleted_at" ON "always_free" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "always_free" cascade;`);
  }

}
