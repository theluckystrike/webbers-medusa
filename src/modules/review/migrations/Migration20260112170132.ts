import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260112170132 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "response" drop constraint if exists "response_review_id_unique";`);
    this.addSql(`create table if not exists "product_review_stats" ("id" text not null, "product_id" text not null, "average_rating" integer null, "review_count" integer not null default 0, "rating_count_1" integer not null default 0, "rating_count_2" integer not null default 0, "rating_count_3" integer not null default 0, "rating_count_4" integer not null default 0, "rating_count_5" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_stats_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_stats_deleted_at" ON "product_review_stats" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_stats_product_id" ON "product_review_stats" ("product_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "review" ("id" text not null, "name" text null, "email" text null, "rating" integer not null, "title" text null, "gender" text null, "city" text null, "age" text null, "recommend" boolean not null default false, "content" text null, "type" text check ("type" in ('store', 'product')) not null default 'store', "status" text check ("status" in ('pending', 'approved', 'flagged')) not null default 'pending', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "response" ("id" text not null, "content" text not null, "review_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "response_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_response_review_id_unique" ON "response" ("review_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_response_deleted_at" ON "response" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "review_image" ("id" text not null, "url" text not null, "review_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_image_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_image_review_id" ON "review_image" ("review_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_image_deleted_at" ON "review_image" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "response" add constraint "response_review_id_foreign" foreign key ("review_id") references "review" ("id") on update cascade;`);

    this.addSql(`alter table if exists "review_image" add constraint "review_image_review_id_foreign" foreign key ("review_id") references "review" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "response" drop constraint if exists "response_review_id_foreign";`);

    this.addSql(`alter table if exists "review_image" drop constraint if exists "review_image_review_id_foreign";`);

    this.addSql(`drop table if exists "product_review_stats" cascade;`);

    this.addSql(`drop table if exists "review" cascade;`);

    this.addSql(`drop table if exists "response" cascade;`);

    this.addSql(`drop table if exists "review_image" cascade;`);
  }

}
