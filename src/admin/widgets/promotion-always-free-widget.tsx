import {DetailWidgetProps, AdminPromotion} from "@medusajs/framework/types"
import {defineWidgetConfig} from "@medusajs/admin-sdk"
import {useQuery} from "@tanstack/react-query"
import {sdk} from "../lib/sdk"
import {Container, Heading, Switch, usePrompt} from "@medusajs/ui"
import {useState, useEffect} from "react"
import {useFeatureEnabled} from "../lib/use-feature-flags"

type AdminPromotionAlwaysFree = AdminPromotion & {
  always_free?: {
    id: string
    always_free: boolean
  }
}

const PromotionAlwaysFreeWidget = ({
  data: promotion,
}: DetailWidgetProps<AdminPromotion>) => {
  const {data: queryResult} = useQuery({
    queryFn: () =>
      sdk.admin.promotion.retrieve(promotion.id, {
        fields: "+always_free.*",
      }),
    queryKey: [["promotion", promotion.id]],
  })

  const alwaysFreeResult = (queryResult?.promotion as AdminPromotionAlwaysFree)
    ?.always_free?.always_free

  const [alwaysFree, setAlwaysFree] = useState<boolean | null>(null)
  const dialog = usePrompt()
  const enabled = useFeatureEnabled("alwaysFreePromotion")

  // Sync state when query data changes
  useEffect(() => {
    if (typeof alwaysFreeResult === "boolean") {
      setAlwaysFree(alwaysFreeResult)
    }
  }, [alwaysFreeResult])

  if (!enabled) {
    return null
  }

  const handleChange = async () => {
    const confirmed = await dialog({
      title: "Change free shipping?",
      description: "Are you sure you want to change the free shipping status?",
      variant: "confirmation",
      confirmText: "Confirm",
      cancelText: "Cancel",
    })

    if (confirmed) {
      const oldValue = alwaysFree
      const newValue = !alwaysFree

      setAlwaysFree(newValue)

      try {
        await sdk.admin.promotion.update(promotion.id, {
          // @ts-ignore
          additional_data: {
            always_free: newValue,
          },
        })
      } catch (error) {
        console.error("Failed to update free shipping:", error)
        setAlwaysFree(oldValue)
      }
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Free shipping</Heading>
        <Switch
          id="always-free"
          checked={!!alwaysFree}
          onCheckedChange={handleChange}
        />
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "promotion.details.side.after",
})

export default PromotionAlwaysFreeWidget
