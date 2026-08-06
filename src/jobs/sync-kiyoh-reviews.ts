import { MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { KiyohResponse } from '../types/kiyoh';
import { createReviewsWorkflow } from '../workflows/review/create-reviews';

export default async function syncKiyohReviewsJob(container: MedusaContainer) {
  console.log('Syncing Kiyoh reviews...');

  if (!process.env.KIYOH_LOCATION_ID || !process.env.KIYOH_API_TOKEN || process.env.KIYOH_SYNC_ENABLE !== 'true') {
    console.log('Missing Kiyoh environment variables. Skipping sync.');
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `https://www.kiyoh.com/v1/publication/review/external?locationId=${process.env.KIYOH_LOCATION_ID}&dateSince=${yesterday}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Publication-Api-Token': process.env.KIYOH_API_TOKEN || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data: KiyohResponse = await response.json();
    const reviews = data.reviews.filter(review => !!review.referenceCode);

    if (!reviews.length) {
      return;
    }

    const medusaReviews: any[] = [];

    for (const review of reviews) {
      const refCode = review.referenceCode!.replace('#', '');

      const { data } = await query.graph({
        entity: 'order',
        fields: ['id', 'email', 'items.id', 'items.product_id'],
        filters: {
          display_id: refCode,
        },
      });

      const order = data[0];

      if (!order) {
        continue;
      }

      const orderItems = order?.items ?? [undefined];

      const usedProductIds: (string | undefined)[] = [];

      orderItems.forEach(item => {
        const productId: string | undefined = item?.product_id;

        if (!productId || usedProductIds.includes(productId)) {
          return;
        }

        usedProductIds.push(productId);
      });

      const reviewTitle = review.reviewContent.find(rc => rc.questionGroup === 'DEFAULT_ONELINER')?.rating ?? '';
      const reviewContent = review.reviewContent.find(rc => rc.questionGroup === 'DEFAULT_OPINION')?.rating ?? '';

      const medusaReview: any = {
        name: review.reviewAuthor,
        email: order.email,
        rating: Math.ceil(review.rating / 2),
        title: reviewTitle,
        content: reviewContent,
        city: review.city,
        type: 'store',
        recommend: review.reviewContent.find(rc => rc.questionGroup === 'DEFAULT_RECOMMEND')?.rating === 'true',
        created_at: new Date(review.dateSince),
        updated_at: new Date(review.updatedSince),
        metadata: {
          original_title: reviewTitle,
          original_content: reviewContent,
          kiyoh_review_id: review.reviewId,
        },
      };

      if (usedProductIds.length > 0) {
        medusaReview.products = usedProductIds;
        medusaReview.type = 'product';
      }

      medusaReviews.push(medusaReview);
    }

    const { result: createdReviews } = await createReviewsWorkflow(container).run({
      input: { reviews: medusaReviews },
    });

    console.log(`Created ${createdReviews.length} reviews.`);

    return;
  } catch (error: any) {
    console.error(error);
    return;
  }
}

export const config = {
  name: 'sync-kiyoh-reviews',
  schedule: '03 01 * * *',
};
