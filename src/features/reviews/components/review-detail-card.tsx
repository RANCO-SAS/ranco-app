import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { AppIcon } from '@/components/ui/app-icon';
import { ProfileAvatarLink } from '@/components/ui/profile-avatar-link';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { ServiceRequestPhotoGallery } from '@/features/jobs/components/service-request-photo-gallery';
import {
  getReviewTraitsForReviewee,
  type ReviewTraits,
} from '@/features/reviews/constants/review-traits';
import { ReviewTraitScoreRow } from '@/features/reviews/components/review-trait-score-row';
import type { Review } from '@/features/reviews/types/review.types';
import { useTheme } from '@/hooks/use-theme';

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

    return <ReviewTraitScoreRow definition={definition} key={definition.key} value={value} />;
  });
}

function SectionDivider() {
  const theme = useTheme();

  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

export function ReviewDetailCard({
  review,
  revieweeIsProfessional,
  showReviewerLink = true,
}: ReviewDetailCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showReviewerLink ? (
          <ProfileAvatarLink
            imageUrl={review.reviewerAvatarUrl}
            name={review.reviewerName}
            size={52}
            userId={review.reviewerId}
          />
        ) : (
          <Avatar imageUrl={review.reviewerAvatarUrl} name={review.reviewerName} size={52} />
        )}

        <View style={styles.headerMeta}>
          <View style={styles.ratingRow}>
            <AppText variant="title">{review.rating.toFixed(1)}</AppText>
            <AppIcon color={theme.warning} name="star" size={18} />
          </View>
          <AppText variant="bodyMedium">{review.reviewerName}</AppText>
          <AppText color="textMuted" variant="caption">
            {formatReviewDate(review.createdAt)}
          </AppText>
        </View>
      </View>

      {review.serviceRequestTitle ? (
        <>
          <SectionDivider />
          <View style={styles.section}>
            <AppText variant="bodyMedium">Trabajo:</AppText>
            <AppText color="textSecondary" variant="body">
              {review.serviceRequestTitle}
            </AppText>
          </View>
        </>
      ) : null}

      <SectionDivider />

      <View style={styles.section}>
        <AppText variant="bodyMedium">Valoración por categoría</AppText>
        <View style={styles.traits}>{renderTraitRows(review.traits, revieweeIsProfessional)}</View>
      </View>

      {review.comment ? (
        <>
          <SectionDivider />
          <View style={styles.section}>
            <AppText variant="bodyMedium">Comentario</AppText>
            <AppText color="textSecondary" variant="body">
              {review.comment}
            </AppText>
          </View>
        </>
      ) : null}

      {review.evidenceUrls.length > 0 ? (
        <>
          <SectionDivider />
          <View style={styles.section}>
            <AppText variant="bodyMedium">Evidencia</AppText>
            <ServiceRequestPhotoGallery photoUrls={review.evidenceUrls} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
  },
  section: {
    gap: Spacing.md,
  },
  traits: {
    gap: Spacing.lg,
  },
});
