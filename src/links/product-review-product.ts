import { defineLink } from '@medusajs/framework/utils';
import ProductModule from '@medusajs/medusa/product';
import ReviewModule from '../modules/review';

export default defineLink(
  {
    linkable: ReviewModule.linkable.review,
    isList: true,
  },
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  }
);
