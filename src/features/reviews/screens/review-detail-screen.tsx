import { useLocalSearchParams } from 'expo-router';

import { StackHeader } from '@/components/layout/stack-header';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacer } from '@/components/ui/spacer';
import { ReviewDetailCard } from '@/features/reviews/components/review-detail-card';
import { isProfessionalReview } from '@/features/reviews/constants/review-traits';
import { useReview } from '@/features/reviews/hooks/use-reviews';

export function ReviewDetailScreen() {
  const { reviewId } = useLocalSearchParams<{ reviewId: string }>();
  const reviewQuery = useReview(reviewId);
  const review = reviewQuery.data;

  if (reviewQuery.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando reseña..." />;
  }

  if (reviewQuery.error || !review) {
    return (
      <ScreenLayout>
        <StackHeader title="Reseña" />
        <EmptyState title="Reseña no disponible" />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <StackHeader title="Reseña" />

      <Spacer size="md" />

      <Card>
        <ReviewDetailCard
          review={review}
          revieweeIsProfessional={isProfessionalReview(review)}
        />
      </Card>
    </ScreenLayout>
  );
}
