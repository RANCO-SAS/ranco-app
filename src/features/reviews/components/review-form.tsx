import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useCreateReview } from '@/features/reviews/hooks/use-reviews';

type ReviewFormProps = {
  serviceRequestId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  existingRating?: number;
};

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

export function ReviewForm({
  serviceRequestId,
  reviewerId,
  revieweeId,
  revieweeName,
  existingRating,
}: ReviewFormProps) {
  const createReview = useCreateReview();
  const [rating, setRating] = useState(existingRating ?? 5);
  const [comment, setComment] = useState('');

  if (existingRating) {
    return (
      <Card>
        <AppText variant="bodyMedium">Reseña enviada</AppText>
        <AppText color="textSecondary" variant="caption">
          Ya dejaste {existingRating} estrellas para {revieweeName}.
        </AppText>
      </Card>
    );
  }

  return (
    <Card>
      <AppText variant="bodyMedium">Califica a {revieweeName}</AppText>
      <AppText color="textSecondary" variant="caption">
        El trabajo terminó. Comparte tu experiencia en su perfil.
      </AppText>

      <View style={styles.ratingRow}>
        {RATING_OPTIONS.map((value) => (
          <Button
            key={value}
            label={`${value}★`}
            onPress={() => setRating(value)}
            variant={rating === value ? 'dark' : 'secondary'}
          />
        ))}
      </View>

      <Input
        editable={!createReview.isPending}
        label="Comentario (opcional)"
        multiline
        numberOfLines={3}
        onChangeText={setComment}
        placeholder="Cuéntanos cómo fue la experiencia"
        value={comment}
      />

      <Button
        disabled={createReview.isPending}
        label={createReview.isPending ? 'Enviando reseña...' : 'Publicar reseña'}
        onPress={() => {
          createReview.mutate({
            serviceRequestId,
            reviewerId,
            revieweeId,
            rating,
            comment,
          });
        }}
        variant="dark"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
});
