import { model } from '@medusajs/framework/utils';

export const FeatureFlag = model.define('webbers_feature_flag', {
  id: model.id({ prefix: 'wff' }).primaryKey(),
  key: model.text(),
  enabled: model.boolean(),
});
