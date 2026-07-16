import CustomQueryService from './service';
import { Module } from '@medusajs/framework/utils';

export const CUSTOM_QUERY = 'custom_query';

export default Module(CUSTOM_QUERY, {
  service: CustomQueryService,
});
