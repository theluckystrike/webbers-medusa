import { model } from '@medusajs/framework/utils';
import { ReviewModel } from './review';

export const ReviewImageModel = model.define('review_image', {
  id: model.id({ prefix: 'rev_img' }).primaryKey(),
  url: model.text(),
  review: model.belongsTo(() => ReviewModel, {
    mappedBy: 'images',
  }),
});
