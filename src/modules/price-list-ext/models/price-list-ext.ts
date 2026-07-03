import { model } from '@medusajs/framework/utils';

const PriceListExt = model.define('price_list_ext', {
  id: model.id({ prefix: 'ple' }).primaryKey(),
  metadata: model.json().nullable(),
});

export default PriceListExt;
