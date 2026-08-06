import { Migration } from '@medusajs/framework/mikro-orm/migrations';

export class Migration20260701120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_product_review_stats_product_id";`);
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_review_stats_product_id_unique" ON "product_review_stats" ("product_id") WHERE deleted_at IS NULL;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_product_review_stats_product_id_unique";`);
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_product_review_stats_product_id" ON "product_review_stats" ("product_id") WHERE deleted_at IS NULL;`
    );
  }
}
