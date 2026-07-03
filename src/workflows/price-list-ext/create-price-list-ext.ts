import { MetadataType } from '@medusajs/framework/types';
import { createWorkflow, transform, when, WorkflowResponse } from '@medusajs/framework/workflows-sdk';
import { createPriceListExtStep } from './steps/create-price-list-ext-step';
import { Modules } from '@medusajs/framework/utils';
import { PRICE_LIST_EXT_MODULE } from '../../modules/price-list-ext';
import { createRemoteLinkStep } from '@medusajs/medusa/core-flows';

type CreatePriceListExtWorkflowInput = {
  metadata: MetadataType;
  price_list_id: string;
};

export const createPriceListExtWorkflow = createWorkflow(
  'create-price-list-ext',
  (input: CreatePriceListExtWorkflowInput) => {
    const priceListExt = createPriceListExtStep(input);

    when(input, input => !!input.price_list_id).then(() => {
      const link = transform({ input, priceListExt }, data => {
        return [
          {
            [Modules.PRICING]: {
              price_list_id: data.input.price_list_id,
            },
            [PRICE_LIST_EXT_MODULE]: {
              price_list_ext_id: data.priceListExt.id,
            },
          },
        ];
      });

      createRemoteLinkStep(link);
    });

    return new WorkflowResponse(priceListExt);
  }
);
