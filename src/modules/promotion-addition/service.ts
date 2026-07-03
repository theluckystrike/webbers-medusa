import {MedusaService} from "@medusajs/framework/utils"
import {AlwaysFree} from "./models/always-free"

class PromotionAdditionModuleService extends MedusaService({
  AlwaysFree,
}) {}

export default PromotionAdditionModuleService
