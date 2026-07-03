import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { PostAdminEditNote } from './validators';
import { z } from "@medusajs/framework/zod";
import { createNoteWorkflow } from '../../../workflows/note/create-note';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { updateNoteWorkflow } from '../../../workflows/note/update-note';

type PostAdminEditNoteType = z.infer<typeof PostAdminEditNote>;

// This plugin does not depend on any subscriptions package. It only references the
// subscription module by its registration key, so hosts that register a `subscription`
// module and define a subscription↔note link (see README) can attach notes to it.
// Hosts without a subscription module simply never hit the `subscription` branch.
const SUBSCRIPTION_MODULE = 'subscription';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { entity_id, entity_type } = req.query;

  if (!entity_id || !entity_type) {
    return res.status(400).send({
      error: { message: 'entity_id and entity_type are required', type: 'invalid' },
    });
  }

  let entityName: string | undefined = undefined;

  switch (entity_type) {
    case 'order':
      entityName = Modules.ORDER;
      break;
    case 'customer':
      entityName = Modules.CUSTOMER;
      break;
    case 'subscription':
      entityName = SUBSCRIPTION_MODULE;
      break;
  }

  if (!entityName) {
    return res.status(400).send({
      error: { message: 'Invalid entity type', type: 'invalid' },
    });
  }

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [entity],
    } = await query.graph({
      entity: entityName,
      filters: { id: entity_id },
      fields: ['note.*'],
    });

    return res.json({ note: entity?.note });
  } catch (e: unknown) {
    return res.status(500).send({
      error: { message: 'Failed to retrieve note', type: 'unexpected_error' },
    });
  }
};

export const POST = async (req: MedusaRequest<PostAdminEditNoteType>, res: MedusaResponse) => {
  const { note, note_id, type, type_id } = req.validatedBody;

  let moduleType: { module: string; idName: string } | undefined = undefined;

  switch (type) {
    case 'order':
      moduleType = { module: Modules.ORDER, idName: 'order_id' } as const;
      break;
    case 'customer':
      moduleType = { module: Modules.CUSTOMER, idName: 'customer_id' } as const;
      break;
    case 'subscription':
      moduleType = { module: SUBSCRIPTION_MODULE, idName: 'subscription_id' } as const;
      break;
  }

  if (!moduleType) {
    return res.status(400).send({
      error: { message: 'Invalid module type', type: 'invalid' },
    });
  }

  try {
    if (note_id) {
      const { result } = await updateNoteWorkflow(req.scope).run({
        input: {
          note,
          id: note_id,
        },
      });

      return res.status(200).json(result);
    } else {
      const { result } = await createNoteWorkflow(req.scope).run({
        input: {
          note,
          moduleType,
          type_id,
        },
      });

      return res.status(200).json(result);
    }
  } catch (e: unknown) {
    return res.status(500).send({
      error: { message: 'Failed to process note', type: 'unexpected_error' },
    });
  }
};
