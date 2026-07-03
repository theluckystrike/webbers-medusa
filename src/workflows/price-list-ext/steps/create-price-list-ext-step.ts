import { MetadataType } from '@medusajs/framework/types';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import PriceListExtModuleService from '../../../modules/price-list-ext/service';
import { PRICE_LIST_EXT_MODULE } from '../../../modules/price-list-ext';

type CreatePriceListExtStepInput = {
  metadata: MetadataType;
};

export const createPriceListExtStep = createStep(
  'create-price-list-ext-step',
  async (input: CreatePriceListExtStepInput, { container }) => {
    const priceListExtModuleService: PriceListExtModuleService = container.resolve(PRICE_LIST_EXT_MODULE);

    const priceListExt = await priceListExtModuleService.createPriceListExts(input);

    return new StepResponse(priceListExt, priceListExt.id);
  },
  async (id: string, { container }) => {
    const priceListExtModuleService: PriceListExtModuleService = container.resolve(PRICE_LIST_EXT_MODULE);

    await priceListExtModuleService.deletePriceListExts(id);
  }
);
