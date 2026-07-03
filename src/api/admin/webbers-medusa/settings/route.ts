import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';
import { WEBBERS_SETTINGS_MODULE } from '../../../../modules/webbers-settings';
import WebbersSettingsService from '../../../../modules/webbers-settings/service';
import { WebbersFeatureKey } from '../../../../feature-flags';
import { PostWebbersSettings } from './validators';

type PostWebbersSettingsType = z.infer<typeof PostWebbersSettings>;

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: WebbersSettingsService = req.scope.resolve(WEBBERS_SETTINGS_MODULE);
  res.json({ flags: await service.getFlags() });
};

export const POST = async (req: MedusaRequest<PostWebbersSettingsType>, res: MedusaResponse) => {
  const service: WebbersSettingsService = req.scope.resolve(WEBBERS_SETTINGS_MODULE);
  const { flags } = req.validatedBody;

  for (const [key, enabled] of Object.entries(flags)) {
    await service.setFlag(key as WebbersFeatureKey, enabled);
  }

  res.json({ flags: await service.getFlags() });
};
