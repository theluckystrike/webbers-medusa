import { Review } from '../../../page.tsx';

export type AddProductsDrawerProps = {
  open: boolean;
  onClose: () => void;
  review: Review;
};
