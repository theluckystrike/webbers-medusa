import { Module } from '@medusajs/framework/utils';
import WebbersSettingsService from './service';

export const WEBBERS_SETTINGS_MODULE = 'webbers_settings';

export default Module(WEBBERS_SETTINGS_MODULE, {
  service: WebbersSettingsService,
});
