export type KiyohResponse = {
  locationId: string;
  uniqueId: number;
  categoryName: string;
  street: string;
  houseNumber: string;
  postCode: string;
  city: string;
  country: string;
  averageRating: number;
  numberReviews: number;
  percentageRecommendation: number;
  last12MonthAverageRating: number;
  last12MonthNumberReviews: number;
  last12MonthPercentageRecommendation: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStars: number;
  viewReviewUrl: string;
  createReviewUrl: string;
  canonicalName: string;
  locationName: string;
  updatedSince: string;
  dateSince: string;
  website: string;
  email: string;
  productId: string;
  crmId: string;
  locationActive: boolean;
  categoryId: string;
  numberOfInvites: number;
  numberOfUsedInvites: number;
  externalId: string;
  reviews: KiyohReview[];
};

type KiyohReview = {
  reviewId: string;
  reviewAuthor: string;
  city: string;
  rating: number;
  reviewContent: KiyohReviewContent[];
  dateSince: string;
  updatedSince: string;
  reviewLanguage: string;
  referenceCode?: string;
};

type KiyohReviewContent = {
  questionGroup: string;
  questionType: string;
  rating: string;
  order: number;
  questionTranslation: string;
  notApplicable?: boolean;
};
