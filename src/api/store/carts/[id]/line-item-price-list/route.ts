import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';
import { addToCartWorkflow } from '@medusajs/medusa/core-flows';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { CreateCartCreateLineItemDTO, StoreCart } from '@medusajs/types';
import { refetchCart } from '@medusajs/medusa/api/store/carts/helpers';
import { WEBBERS_SETTINGS_MODULE } from '../../../../../modules/webbers-settings';
import WebbersSettingsService from '../../../../../modules/webbers-settings/service';

export const PostAddCustomLineItemSchema = z.object({
  variant_id: z.string(),
  quantity: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

type PostAddCustomLineItemSchemaType = z.infer<typeof PostAddCustomLineItemSchema>;

export async function POST(req: MedusaRequest<PostAddCustomLineItemSchemaType>, res: MedusaResponse) {
  const { id: cartId } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const item: CreateCartCreateLineItemDTO = {
    variant_id: req.validatedBody.variant_id,
    quantity: req.validatedBody.quantity ?? 1,
    metadata: req.validatedBody.metadata ?? {},
  };

  // Only enforce price-list disallow-discounts when the feature is enabled from the
  // Webbers QoL settings page. When disabled this route behaves like a plain add-to-cart.
  const settings: WebbersSettingsService = req.scope.resolve(WEBBERS_SETTINGS_MODULE);
  const disallowEnabled = await settings.isEnabled('disallowPriceListDiscounts');

  const priceListId = req.validatedBody.metadata?.price_list_id as string | undefined;

  if (disallowEnabled && priceListId) {
    const { data } = await query.graph({
      entity: 'price_list',
      fields: ['id', 'price_list_ext.id', 'price_list_ext.metadata'],
      filters: { id: priceListId },
    });

    const priceList = data[0];

    if (priceList?.price_list_ext?.metadata?.disallow_discounts === true) {
      item.is_discountable = false;

      if (item.metadata) {
        item.metadata.disallowed_discounts_pricelist = true;
      }
    }
  }

  await addToCartWorkflow(req.scope).run({
    input: {
      items: [item],
      cart_id: cartId,
    },
  });

  const cart: StoreCart = await refetchCart(cartId, req.scope, req.queryConfig.fields);

  res.status(200).json({ cart });
}
