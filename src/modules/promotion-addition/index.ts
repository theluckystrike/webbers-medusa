import {Module} from "@medusajs/framework/utils"
import PromotionAdditionModuleService from "./service"

export const PROMOTION_ADDITION_MODULE = "promotion_addition"

export default Module(PROMOTION_ADDITION_MODULE, {
  service: PromotionAdditionModuleService,
})
