import { Review } from '../../../page.tsx';

export type ReviewEditModalProps = {
  state: boolean;
  close: () => void;
  review: Review;
};
