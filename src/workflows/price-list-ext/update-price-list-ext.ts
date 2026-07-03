import { createWorkflow, WorkflowResponse } from '@medusajs/framework/workflows-sdk';
import { updatePriceListExtStep } from './steps/update-price-list-ext-step';

type UpdatePriceListExtWorkflowInput = {
  id: string;
  metadata: Record<string, unknown>;
};

export const updatePriceListExtWorkflow = createWorkflow(
  'update-price-list-ext',
  (input: UpdatePriceListExtWorkflowInput) => {
    const priceListExt = updatePriceListExtStep(input);

    return new WorkflowResponse(priceListExt);
  }
);
