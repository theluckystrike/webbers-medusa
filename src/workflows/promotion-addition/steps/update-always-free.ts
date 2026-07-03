import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { PROMOTION_ADDITION_MODULE } from '../../../modules/promotion-addition';
import PromotionAdditionModuleService from '../../../modules/promotion-addition/service';

export type UpdateAlwaysFreeStepInput = {
  id: string;
  always_free?: boolean;
};

export const updateAlwaysFreeStep = createStep(
  'update-always-free-step',
  async ({ id, always_free }: UpdateAlwaysFreeStepInput, { container }) => {
    const promotionAdditionModuleService: PromotionAdditionModuleService = container.resolve(PROMOTION_ADDITION_MODULE);

    const prevData = await promotionAdditionModuleService.retrieveAlwaysFree(id);

    const alwaysFree = await promotionAdditionModuleService.updateAlwaysFrees({
      id,
      always_free: always_free ?? prevData.always_free,
    });

    return new StepResponse(alwaysFree, prevData);
  },
  async (prevData, { container }) => {
    const promotionAdditionModuleService: PromotionAdditionModuleService = container.resolve(PROMOTION_ADDITION_MODULE);

    if (!prevData) {
      return;
    }

    await promotionAdditionModuleService.updateAlwaysFrees(prevData);
  }
);
