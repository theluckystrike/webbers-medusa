import { defineLink } from '@medusajs/framework/utils';
import PromotionAddition from '../modules/promotion-addition';
import PromotionModule from '@medusajs/medusa/promotion';

export default defineLink(PromotionModule.linkable.promotion, PromotionAddition.linkable.alwaysFree);
