import { model } from '@medusajs/framework/utils';

export const Note = model.define('note', {
  id: model.id({ prefix: 'n' }).primaryKey(),
  note: model.text(),
});
