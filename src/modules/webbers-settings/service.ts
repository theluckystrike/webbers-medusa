import { MedusaService } from '@medusajs/framework/utils';
import { FeatureFlag } from './models/feature-flag';
import { DEFAULT_FEATURE_ENABLED, WEBBERS_FEATURE_KEYS, WebbersFeatureKey } from '../../feature-flags';
import { WebbersMedusaOptions } from '../../options';

class WebbersSettingsService extends MedusaService({ FeatureFlag }) {
  // Plugin options passed by the host app in medusa-config.ts propagate to this module.
  protected readonly options_: WebbersMedusaOptions;

  constructor(container: unknown, options?: WebbersMedusaOptions) {
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);
    this.options_ = options ?? {};
  }

  /** Host-configured extra tables for the customer anonymize routine. */
  getAnonymizeConfig(): NonNullable<WebbersMedusaOptions['anonymize']> {
    return this.options_.anonymize ?? {};
  }

  /** Host-configured extra tables for the edit-customer-email routine. */
  getEditEmailConfig(): NonNullable<WebbersMedusaOptions['editEmail']> {
    return this.options_.editEmail ?? {};
  }

  /** Returns every known feature key mapped to its enabled state (default ON). */
  async getFlags(): Promise<Record<string, boolean>> {
    const rows = await this.listFeatureFlags({});

    const map: Record<string, boolean> = {};
    for (const key of WEBBERS_FEATURE_KEYS) {
      map[key] = DEFAULT_FEATURE_ENABLED;
    }
    for (const row of rows) {
      map[row.key] = row.enabled;
    }
    return map;
  }

  /** Whether a single feature is enabled (default ON when no row exists). */
  async isEnabled(key: WebbersFeatureKey | string): Promise<boolean> {
    const [existing] = await this.listFeatureFlags({ key });
    return existing ? existing.enabled : DEFAULT_FEATURE_ENABLED;
  }

  /** Upsert a feature flag. */
  async setFlag(key: WebbersFeatureKey, enabled: boolean) {
    const [existing] = await this.listFeatureFlags({ key });
    if (existing) {
      return this.updateFeatureFlags({ id: existing.id, enabled });
    }
    return this.createFeatureFlags({ key, enabled });
  }
}

export default WebbersSettingsService;
