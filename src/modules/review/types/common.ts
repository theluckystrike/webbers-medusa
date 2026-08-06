import type { InferTypeOf } from '@medusajs/framework/types';
import type { ReviewModel } from '../models';
import { ProductReviewStatsModel } from '../models/product-review-stats';
import { ReviewResponseModel } from '../models/review-response';

export type Review = InferTypeOf<typeof ReviewModel>;

export type ProductReviewStats = InferTypeOf<typeof ProductReviewStatsModel>;

export type ReviewResponse = InferTypeOf<typeof ReviewResponseModel>;
