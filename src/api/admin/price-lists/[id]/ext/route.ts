import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { z } from '@medusajs/framework/zod';
import { createPriceListExtWorkflow } from '../../../../../workflows/price-list-ext/create-price-list-ext';
import { updatePriceListExtWorkflow } from '../../../../../workflows/price-list-ext/update-price-list-ext';
import { PatchAdminUpdatePriceListExt } from './validators';

type PatchAdminUpdatePriceListExtType = z.infer<typeof PatchAdminUpdatePriceListExt>;

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: 'price_list',
    fields: ['id', 'price_list_ext.id', 'price_list_ext.metadata'],
    filters: { id },
  });

  const priceList = data[0];

  if (!priceList) {
    return res.status(404).send({});
  }

  // if price list has no extended data, create it and then return refetched response
  if (priceList.price_list_ext) {
    return res.json(priceList);
  }

  await createPriceListExtWorkflow(req.scope).run({
    input: {
      metadata: {},
      price_list_id: id,
    },
  });

  const { data: refetchedData } = await query.graph({
    entity: 'price_list',
    fields: ['id', 'price_list_ext.id', 'price_list_ext.metadata'],
    filters: { id },
  });

  return res.json(refetchedData[0]);
};

export const PATCH = async (req: MedusaRequest<PatchAdminUpdatePriceListExtType>, res: MedusaResponse) => {
  const { result } = await updatePriceListExtWorkflow(req.scope).run({
    input: { ...req.validatedBody, metadata: req.validatedBody.metadata ?? {} },
  });

  return res.json(result);
};
