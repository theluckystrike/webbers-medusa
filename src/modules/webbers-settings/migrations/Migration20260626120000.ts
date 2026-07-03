import { Migration } from '@medusajs/framework/mikro-orm/migrations';

export class Migration20260626120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "webbers_feature_flag" ("id" text not null, "key" text not null, "enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "webbers_feature_flag_pkey" primary key ("id"));`
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_webbers_feature_flag_key" ON "webbers_feature_flag" ("key") WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_webbers_feature_flag_deleted_at" ON "webbers_feature_flag" ("deleted_at") WHERE deleted_at IS NULL;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "webbers_feature_flag" cascade;`);
  }
}
