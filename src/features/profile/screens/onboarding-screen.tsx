import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { AuthLayout } from '@/components/layout/auth-layout';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { RoleSelector } from '@/features/profile/components/role-selector';
import { useCompleteOnboarding } from '@/features/profile/hooks/use-complete-onboarding';
import {
  onboardingSchema,
  type OnboardingFormData,
} from '@/features/profile/schemas/onboarding.schema';
import { mapProfileError } from '@/features/profile/utils/map-profile-error';

export function OnboardingScreen() {
  const { session } = useAuth();
  const completeOnboarding = useCompleteOnboarding();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: session?.fullName ?? '',
      phone: '',
      locationLabel: '',
      avatarUrl: '',
      isClient: true,
      isProfessional: false,
    },
  });

  const isClient = watch('isClient');
  const isProfessional = watch('isProfessional');

  const onSubmit = (data: OnboardingFormData) => {
    if (!session?.userId) {
      return;
    }

    completeOnboarding.reset();
    completeOnboarding.mutate({
      userId: session.userId,
      ...data,
    });
  };

  return (
    <ScreenLayout scrollable centered>
      <AuthLayout
        title="Configura tu perfil"
        subtitle="Completa tu información para empezar a usar Ranco">
        {completeOnboarding.error ? (
          <AuthMessage message={mapProfileError(completeOnboarding.error)} variant="error" />
        ) : null}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoComplete="name"
              editable={!completeOnboarding.isPending}
              error={errors.fullName?.message}
              label="Nombre completo"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Tu nombre"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoComplete="tel"
              editable={!completeOnboarding.isPending}
              error={errors.phone?.message}
              keyboardType="phone-pad"
              label="Teléfono"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="+57 300 000 0000"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="locationLabel"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              editable={!completeOnboarding.isPending}
              error={errors.locationLabel?.message}
              label="Ubicación"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Ciudad o barrio"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="avatarUrl"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              editable={!completeOnboarding.isPending}
              error={errors.avatarUrl?.message}
              label="Avatar (URL)"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="https://..."
              value={value}
            />
          )}
        />

        <RoleSelector
          disabled={completeOnboarding.isPending}
          error={errors.isClient?.message}
          isClient={isClient}
          isProfessional={isProfessional}
          onToggleClient={() => setValue('isClient', !isClient, { shouldValidate: true })}
          onToggleProfessional={() =>
            setValue('isProfessional', !isProfessional, { shouldValidate: true })
          }
        />

        <Spacer size="md" />

        <Button
          disabled={completeOnboarding.isPending}
          label={completeOnboarding.isPending ? 'Guardando perfil...' : 'Continuar'}
          onPress={handleSubmit(onSubmit)}
        />
      </AuthLayout>
    </ScreenLayout>
  );
}
