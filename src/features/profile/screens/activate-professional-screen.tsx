import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { StackHeader } from '@/components/layout/stack-header';
import { Button } from '@/components/ui/button';
import { Spacer } from '@/components/ui/spacer';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ProfessionalAreasPicker } from '@/features/profile/components/professional-areas-picker';
import { useActivateProfessional } from '@/features/profile/hooks/use-activate-professional';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useServiceCategories } from '@/features/jobs/hooks/use-service-categories';
import {
  activateProfessionalSchema,
  type ActivateProfessionalFormData,
} from '@/features/profile/schemas/activate-professional.schema';
import { mapProfileError } from '@/features/profile/utils/map-profile-error';
import { isHybridUser } from '@/features/profile/utils/user-mode';
import { PROFESSIONAL_SERVICE_SELECTION } from '@/constants/profile';
import { Routes } from '@/constants/routes';
import { useAppStore } from '@/stores/app-store';

export function ActivateProfessionalScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const categoriesQuery = useServiceCategories();
  const activateProfessional = useActivateProfessional();
  const setPendingModeSelection = useAppStore((state) => state.setPendingModeSelection);
  const setPromptModeOnLogin = useAppStore((state) => state.setPromptModeOnLogin);

  const isEditingExisting =
    Boolean(profile?.isProfessional) && (profile?.professionalSubcategoryIds.length ?? 0) > 0;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ActivateProfessionalFormData>({
    resolver: zodResolver(activateProfessionalSchema),
    defaultValues: {
      professionalSubcategoryIds: [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      professionalSubcategoryIds: profile.professionalSubcategoryIds,
    });
  }, [profile?.id, profile?.professionalSubcategoryIds, reset]);

  const selectedCount = watch('professionalSubcategoryIds').length;
  const canSubmit = selectedCount >= PROFESSIONAL_SERVICE_SELECTION.min;

  const onSubmit = (data: ActivateProfessionalFormData) => {
    if (!session?.userId || !profile) {
      return;
    }

    activateProfessional.reset();
    activateProfessional.mutate(
      {
        userId: session.userId,
        isClient: profile.isClient,
        professionalSubcategoryIds: data.professionalSubcategoryIds,
      },
      {
        onSuccess: (updatedProfile) => {
          if (isEditingExisting) {
            router.back();
            return;
          }

          if (isHybridUser(updatedProfile)) {
            setPendingModeSelection(true);
            setPromptModeOnLogin(true);
            router.replace(Routes.app.chooseMode);
            return;
          }

          router.replace(Routes.app.discover);
        },
      },
    );
  };

  return (
    <ScreenLayout scrollable>
      <StackHeader title={isEditingExisting ? 'Mis servicios' : 'Perfil profesional'} />

      <Spacer size="lg" />

      {activateProfessional.error ? (
        <>
          <AuthMessage message={mapProfileError(activateProfessional.error)} variant="error" />
          <Spacer size="md" />
        </>
      ) : null}

      <Controller
        control={control}
        name="professionalSubcategoryIds"
        render={({ field: { value, onChange } }) => (
          <ProfessionalAreasPicker
            categories={categoriesQuery.data ?? []}
            disabled={activateProfessional.isPending || categoriesQuery.isLoading}
            error={errors.professionalSubcategoryIds?.message}
            maxSelections={PROFESSIONAL_SERVICE_SELECTION.max}
            onChange={onChange}
            value={value}
          />
        )}
      />

      <Spacer size="xl" />

      <Button
        disabled={!canSubmit || activateProfessional.isPending}
        label={
          activateProfessional.isPending
            ? 'Guardando...'
            : isEditingExisting
              ? 'Guardar servicios'
              : 'Activar perfil profesional'
        }
        onPress={handleSubmit(onSubmit)}
      />

      <Spacer size="lg" />
    </ScreenLayout>
  );
}
