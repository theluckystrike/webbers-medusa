import {model} from "@medusajs/framework/utils"

export const AlwaysFree = model.define("always_free", {
  id: model.id({prefix: "af"}).primaryKey(),
  always_free: model.boolean(),
})
