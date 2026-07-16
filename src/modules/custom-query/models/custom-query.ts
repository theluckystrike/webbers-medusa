import { model } from '@medusajs/framework/utils';

const CustomQuery = model.define('custom_query', {
  id: model.id().primaryKey(),
});

export default CustomQuery;
