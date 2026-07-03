import { defineLink } from '@medusajs/framework/utils';
import PricingModule from '@medusajs/medusa/pricing';
import PriceListExtModule from '../modules/price-list-ext';

export default defineLink(PricingModule.linkable.priceList, PriceListExtModule.linkable.priceListExt);
