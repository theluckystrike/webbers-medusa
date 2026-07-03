import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { AlwaysFree } from '../../../modules/promotion-addition/models/always-free';
import { InferTypeOf } from '@medusajs/framework/types';
import PromotionAdditionModuleService from '../../../modules/promotion-addition/service';
import { PROMOTION_ADDITION_MODULE } from '../../../modules/promotion-addition';

type DeleteAlwaysFreeStepInput = {
  always_free: InferTypeOf<typeof AlwaysFree>;
};

export const deleteAlwaysFreeStep = createStep(
  'delete-always-free-step',
  async ({ always_free: alwaysFree }: DeleteAlwaysFreeStepInput, { container }) => {
    const promotionAdditionModuleService: PromotionAdditionModuleService = container.resolve(PROMOTION_ADDITION_MODULE);

    await promotionAdditionModuleService.deleteAlwaysFrees(alwaysFree.id);

    return new StepResponse(alwaysFree, alwaysFree);
  },
  async (alwaysFree, { container }) => {
    const promotionAdditionModuleService: PromotionAdditionModuleService = container.resolve(PROMOTION_ADDITION_MODULE);

    if (!alwaysFree) {
      return;
    }

    await promotionAdditionModuleService.createAlwaysFrees(alwaysFree);
  }
);
