import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { StackHeader } from '@/components/layout/stack-header';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
import { ReviewDetailCard } from '@/features/reviews/components/review-detail-card';
import { isProfessionalReview } from '@/features/reviews/constants/review-traits';
import { useReview } from '@/features/reviews/hooks/use-reviews';
import { Layout, Radius, Spacing } from '@/constants/theme';

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

      <StaggeredFadeIn index={0}>
        <Card style={styles.card}>
          <ReviewDetailCard
            review={review}
            revieweeIsProfessional={isProfessionalReview(review)}
          />
        </Card>
      </StaggeredFadeIn>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.lg,
    borderRadius: Radius.xl,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
});
