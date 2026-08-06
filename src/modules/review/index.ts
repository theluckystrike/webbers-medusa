import { Module } from '@medusajs/framework/utils';
import Service from './service';
import validateLoader from './loaders/validate';

export const REVIEW_MODULE = 'review';

export default Module(REVIEW_MODULE, {
  service: Service,
  loaders: [validateLoader],
});
