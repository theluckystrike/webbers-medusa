import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import PriceListExtModuleService from '../../../modules/price-list-ext/service';
import { PRICE_LIST_EXT_MODULE } from '../../../modules/price-list-ext';

export type UpdatePriceListExtStepInput = {
  id: string;
  metadata: Record<string, unknown>;
};

export const updatePriceListExtStep = createStep(
  'update-price-list-ext',
  async (input: UpdatePriceListExtStepInput, { container }) => {
    const priceListExtModuleService: PriceListExtModuleService = container.resolve(PRICE_LIST_EXT_MODULE);

    const prevData = await priceListExtModuleService.retrievePriceListExt(input.id);
    const priceListExt = await priceListExtModuleService.updatePriceListExts(input);

    return new StepResponse(priceListExt, prevData);
  },
  async (prevData, { container }) => {
    const priceListExtModuleService: PriceListExtModuleService = container.resolve(PRICE_LIST_EXT_MODULE);

    await priceListExtModuleService.updatePriceListExts({ ...prevData });
  }
);
