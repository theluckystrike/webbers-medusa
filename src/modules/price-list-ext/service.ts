import { MedusaService } from '@medusajs/framework/utils';
import PriceListExt from './models/price-list-ext';

class PriceListExtModuleService extends MedusaService({ PriceListExt }) {}

export default PriceListExtModuleService;
