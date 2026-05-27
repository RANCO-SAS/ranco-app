import { StyleSheet, View } from 'react-native';

import { ProfileAvatarLink } from '@/components/ui/profile-avatar-link';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { ServiceRequestPhotoGallery } from '@/features/jobs/components/service-request-photo-gallery';
import {
  getReviewTraitsForReviewee,
  type ReviewTraits,
} from '@/features/reviews/constants/review-traits';
import type { Review } from '@/features/reviews/types/review.types';

type ReviewDetailCardProps = {
  review: Review;
  revieweeIsProfessional: boolean;
  showReviewerLink?: boolean;
};

function formatReviewDate(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function renderTraitRows(traits: ReviewTraits, revieweeIsProfessional: boolean) {
  const definitions = getReviewTraitsForReviewee(revieweeIsProfessional);

  return definitions.map((definition) => {
    const value = traits[definition.key];

    if (typeof value !== 'number') {
      return null;
    }

    return (
      <View key={definition.key} style={styles.traitRow}>
        <AppText color="textSecondary" variant="body">
          {definition.label}
        </AppText>
        <AppText variant="bodyMedium">{value.toFixed(1)}★</AppText>
      </View>
    );
  });
}

export function ReviewDetailCard({
  review,
  revieweeIsProfessional,
  showReviewerLink = true,
}: ReviewDetailCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showReviewerLink ? (
          <ProfileAvatarLink
            imageUrl={review.reviewerAvatarUrl}
            name={review.reviewerName}
            size={48}
            userId={review.reviewerId}
          />
        ) : null}

        <View style={styles.headerMeta}>
          <AppText variant="title">{review.rating.toFixed(1)}★</AppText>
          <AppText variant="bodyMedium">{review.reviewerName}</AppText>
          <AppText color="textMuted" variant="caption">
            {formatReviewDate(review.createdAt)}
          </AppText>
        </View>
      </View>

      {review.serviceRequestTitle ? (
        <>
          <Spacer size="md" />
          <AppText color="textSecondary" variant="body">
            Trabajo: {review.serviceRequestTitle}
          </AppText>
        </>
      ) : null}

      <Spacer size="md" />

      <AppText variant="bodyMedium">Valoración por categoría</AppText>
      <View style={styles.traits}>{renderTraitRows(review.traits, revieweeIsProfessional)}</View>

      {review.comment ? (
        <>
          <Spacer size="md" />
          <AppText variant="bodyMedium">Comentario</AppText>
          <Spacer size="xs" />
          <AppText color="textSecondary" variant="body">
            {review.comment}
          </AppText>
        </>
      ) : null}

      {review.evidenceUrls.length > 0 ? (
        <>
          <Spacer size="md" />
          <AppText variant="bodyMedium">Evidencia</AppText>
          <Spacer size="sm" />
          <ServiceRequestPhotoGallery photoUrls={review.evidenceUrls} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerMeta: {
    flex: 1,
    gap: Spacing.xs,
  },
  traits: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
});
