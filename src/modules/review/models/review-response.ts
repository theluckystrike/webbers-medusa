import { model } from '@medusajs/framework/utils';
import { ReviewModel } from './review';

export const ReviewResponseModel = model.define('response', {
  id: model.id({ prefix: 'revr' }).primaryKey(),
  content: model.text(),
  review: model.belongsTo(() => ReviewModel, {
    mappedBy: 'response',
  }),
});
