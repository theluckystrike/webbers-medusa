import { MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { REVIEW_MODULE } from '../modules/review';
import type ReviewService from '../modules/review/service';
import { KiyohResponse, KiyohReview } from '../types/kiyoh';
import { createReviewsWorkflow } from '../workflows/review/create-reviews';

const KIYOH_ASSET_URL = 'https://www.kiyoh.com';

// Question groups stored in the review's own fields; every other answered question goes to `metadata.kiyoh_answers`.
const MAPPED_QUESTION_GROUPS = ['DEFAULT_OVERALL', 'DEFAULT_ONELINER', 'DEFAULT_OPINION', 'DEFAULT_RECOMMEND'];
const PHOTO_QUESTION_TYPE = 'IMAGE';

// Keyed by the question as Kiyoh shows it, e.g. { "Gekozen kleur": "Wit" }.
const getUnmappedKiyohAnswers = (review: KiyohReview) =>
  Object.fromEntries(
    review.reviewContent
      .filter(
        rc =>
          !MAPPED_QUESTION_GROUPS.includes(rc.questionGroup) &&
          rc.questionType !== PHOTO_QUESTION_TYPE &&
          !rc.notApplicable &&
          rc.rating != null
      )
      .map(rc => [rc.questionTranslation, rc.rating])
  );

// A photo answer holds Kiyoh's `{ "thumbnailPath": …, "imagePath": … }` JSON; the paths are relative to kiyoh.com.
const getKiyohPhotoUrl = (review: KiyohReview) => {
  const photoAnswer = review.reviewContent.find(rc => rc.questionType === PHOTO_QUESTION_TYPE && !rc.notApplicable)?.rating;

  if (!photoAnswer) {
    return null;
  }

  try {
    const { imagePath } = JSON.parse(photoAnswer) as { imagePath?: string };
    return imagePath ? `${KIYOH_ASSET_URL}${imagePath}` : null;
  } catch {
    return null;
  }
};

// Copies the photo into the host app's file provider, so the store doesn't depend on Kiyoh's image URLs.
const uploadKiyohPhoto = async (container: MedusaContainer, review: KiyohReview) => {
  const photoUrl = getKiyohPhotoUrl(review);

  if (!photoUrl) {
    return null;
  }

  try {
    const response = await fetch(photoUrl);
    if (!response.ok) {
      throw new Error(`Photo download failed with status ${response.status}`);
    }

    const extension = new URL(photoUrl).pathname.match(/\.\w+$/)?.[0] ?? '';
    const fileService = container.resolve(Modules.FILE);
    const [uploadedFile] = await fileService.createFiles([
      {
        filename: `kiyoh-review-${review.reviewId}${extension}`,
        mimeType: response.headers.get('content-type') ?? 'image/png',
        content: Buffer.from(await response.arrayBuffer()).toString('base64'),
        access: 'public',
      },
    ]);

    return uploadedFile?.url ?? null;
  } catch (error: any) {
    console.error(`Skipping photo of Kiyoh review ${review.reviewId}:`, error?.message ?? error);
    return null;
  }
};

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
    const referencedReviews = data.reviews.filter(review => !!review.referenceCode);

    if (!referencedReviews.length) {
      return;
    }

    // Synced and imported reviews keep Kiyoh's `dateSince` as `created_at`, so an already stored copy
    // of any fetched review is created no earlier than the oldest fetched one (a day's margin covers
    // exports that round or shift the timestamp).
    const oldestReviewTime = Math.min(...referencedReviews.map(review => new Date(review.dateSince).getTime()));
    const oldestReviewDate = new Date(oldestReviewTime - 24 * 60 * 60 * 1000);
    const reviewService = container.resolve<ReviewService>(REVIEW_MODULE);
    const storedReviews = await reviewService.listReviews(
      { created_at: { $gte: oldestReviewDate } },
      { select: ['id', 'metadata'], take: null }
    );
    const storedKiyohReviewIds = new Set(storedReviews.map(review => review.metadata?.kiyoh_review_id).filter(Boolean));
    const reviews = referencedReviews.filter(review => !storedKiyohReviewIds.has(review.reviewId));

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
          kiyoh_rating: review.rating,
          kiyoh_reference_code: review.referenceCode,
          kiyoh_language: review.reviewLanguage,
          kiyoh_answers: getUnmappedKiyohAnswers(review),
        },
      };

      const uploadedPhotoUrl = reviewService.enableReviewImages ? await uploadKiyohPhoto(container, review) : null;

      if (uploadedPhotoUrl) {
        medusaReview.images = [{ url: uploadedPhotoUrl }];
      }

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
