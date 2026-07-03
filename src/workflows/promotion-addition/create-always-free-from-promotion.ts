import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {PromotionDTO} from "@medusajs/framework/types"
import {createRemoteLinkStep} from "@medusajs/medusa/core-flows"
import {Modules} from "@medusajs/framework/utils"
import {PROMOTION_ADDITION_MODULE} from "../../modules/promotion-addition"
import {createAlwaysFreeStep} from "./steps/create-always-free"

export type CreateAlwaysFreeFromPromotionWorkflowInput = {
  promotion: PromotionDTO
  additional_data?: {
    always_free?: boolean
  }
}

export const createAlwaysFreeFromPromotionWorkflow = createWorkflow(
  "create-custom-from-promotion",
  (input: CreateAlwaysFreeFromPromotionWorkflowInput) => {
    const alwaysFreeInput = transform(
      {
        input,
      },
      (data) => data?.input?.additional_data?.always_free || false
    )

    const alwaysFree = createAlwaysFreeStep({
      always_free: alwaysFreeInput,
    })

    when({alwaysFree}, ({alwaysFree}) => alwaysFree !== undefined).then(() => {
      createRemoteLinkStep([
        {
          [Modules.PROMOTION]: {
            promotion_id: input.promotion.id,
          },
          [PROMOTION_ADDITION_MODULE]: {
            always_free_id: alwaysFree.id,
          },
        },
      ])
    })

    return new WorkflowResponse({
      alwaysFree,
    })
  }
)
