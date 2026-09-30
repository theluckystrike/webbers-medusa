import { Container, Heading, Text } from '@medusajs/ui';
import { ReviewImagesSectionProps } from './types.ts';

const ReviewImagesSection = ({ review }: ReviewImagesSectionProps) => {
  const images = review.images ?? [];

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Photos</Heading>
      </div>
      {images.length ? (
        <div className="grid grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4">
          {images.map(image => (
            <a
              key={image.id}
              href={image.url}
              target="_blank"
              rel="noreferrer"
              className="shadow-elevation-card-rest hover:shadow-elevation-card-hover overflow-hidden rounded-lg transition-shadow"
            >
              <img src={image.url} alt="" className="aspect-square w-full object-cover" />
            </a>
          ))}
        </div>
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-muted">
            This review has no photos.
          </Text>
        </div>
      )}
    </Container>
  );
};

export default ReviewImagesSection;
