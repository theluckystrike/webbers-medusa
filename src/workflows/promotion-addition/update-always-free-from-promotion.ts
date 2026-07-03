import { PromotionDTO } from '@medusajs/framework/types';
import { createWorkflow, when, WorkflowResponse } from '@medusajs/framework/workflows-sdk';
import { createRemoteLinkStep, dismissRemoteLinkStep, useQueryGraphStep } from '@medusajs/medusa/core-flows';
import { createAlwaysFreeStep } from './steps/create-always-free';
import { isDefined, Modules } from '@medusajs/framework/utils';
import { PROMOTION_ADDITION_MODULE } from '../../modules/promotion-addition';
import { updateAlwaysFreeStep } from './steps/update-always-free';

export type UpdateAlwaysFreeFromPromotionStepInput = {
  promotion: PromotionDTO;
  additional_data?: {
    always_free?: boolean | null;
  };
};

export const updateAlwaysFreeFromPromotionWorkflow = createWorkflow(
  'update-always-free-from-promotion',
  (input: UpdateAlwaysFreeFromPromotionStepInput) => {
    const { data: promotions } = useQueryGraphStep({
      entity: 'promotion',
      fields: ['always_free.*'],
      filters: {
        id: input.promotion.id,
      },
    });

    const created = when(
      'create-promotion-always-free-link',
      {
        input,
        promotions,
      },
      data => !isDefined(data?.promotions?.[0]?.always_free)
    ).then(() => {
      const alwaysFree = createAlwaysFreeStep({
        always_free: input?.additional_data?.always_free || false,
      });

      createRemoteLinkStep([
        {
          [Modules.PROMOTION]: {
            promotion_id: input.promotion.id,
          },
          [PROMOTION_ADDITION_MODULE]: {
            always_free_id: alwaysFree.id,
          },
        },
      ]);

      return alwaysFree;
    });

    const updated = when(
      'update-promotion-always-free-link',
      {
        input,
        promotions,
      },
      data => {
        return !!data.promotions?.[0]?.always_free?.id;
      }
    ).then(() => {
      return updateAlwaysFreeStep({
        id: promotions[0].always_free!.id,
        always_free: input?.additional_data?.always_free ?? false,
      });
    });

    return new WorkflowResponse({
      created,
      updated,
    });
  }
);
