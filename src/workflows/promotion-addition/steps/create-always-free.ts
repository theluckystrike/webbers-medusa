import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { PROMOTION_ADDITION_MODULE } from '../../../modules/promotion-addition';
import PromotionAdditionModuleService from '../../../modules/promotion-addition/service';
import { isDefined } from '@medusajs/framework/utils';

export type CreateAlwaysFreeStepInput = {
  always_free: boolean;
};

export const createAlwaysFreeStep = createStep(
  'create-always-free-step',
  async (input: CreateAlwaysFreeStepInput, { container }) => {
    if (!isDefined(input?.always_free)) {
      return;
    }

    const promotionAdditionModuleService: PromotionAdditionModuleService = container.resolve(PROMOTION_ADDITION_MODULE);

    const alwaysFree = await promotionAdditionModuleService.createAlwaysFrees(input);

    return new StepResponse(alwaysFree, alwaysFree);
  },
  async (alwaysFree, { container }) => {
    const promotionAdditionModuleService: PromotionAdditionModuleService = container.resolve(PROMOTION_ADDITION_MODULE);

    if (!alwaysFree) {
      return;
    }

    await promotionAdditionModuleService.deleteAlwaysFrees(alwaysFree.id);
  }
);
