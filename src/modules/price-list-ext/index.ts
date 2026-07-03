import { Module } from '@medusajs/framework/utils';
import PriceListExtModuleService from './service';

export const PRICE_LIST_EXT_MODULE = 'price_list_ext';

export default Module(PRICE_LIST_EXT_MODULE, {
  service: PriceListExtModuleService,
});
