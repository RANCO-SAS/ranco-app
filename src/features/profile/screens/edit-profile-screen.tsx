import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { StackHeader } from '@/components/layout/stack-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { RoleSelector } from '@/features/profile/components/role-selector';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile';
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '@/features/profile/schemas/update-profile.schema';
import { mapProfileError } from '@/features/profile/utils/map-profile-error';

export function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const updateProfile = useUpdateProfile();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      locationLabel: '',
      avatarUrl: '',
      isClient: false,
      isProfessional: false,
    },
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      fullName: profile.fullName,
      phone: profile.phone ?? '',
      locationLabel: profile.locationLabel ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      isClient: profile.isClient,
      isProfessional: profile.isProfessional,
    });
  }, [profile, reset]);

  const isClient = watch('isClient');
  const isProfessional = watch('isProfessional');

  const onSubmit = (data: UpdateProfileFormData) => {
    if (!session?.userId) {
      return;
    }

    updateProfile.reset();
    updateProfile.mutate(
      {
        userId: session.userId,
        ...data,
      },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  };

  return (
    <ScreenLayout scrollable>
      <StackHeader title="Editar perfil" />
      <Spacer size="lg" />
      <Section title="Información personal" description="Actualiza tus datos de perfil en Ranco.">
        {updateProfile.error ? (
          <AuthMessage message={mapProfileError(updateProfile.error)} variant="error" />
        ) : null}

        {updateProfile.isSuccess ? (
          <AuthMessage message="Perfil actualizado correctamente." variant="success" />
        ) : null}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoComplete="name"
              editable={!updateProfile.isPending}
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
              editable={!updateProfile.isPending}
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
              editable={!updateProfile.isPending}
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
              editable={!updateProfile.isPending}
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
          disabled={updateProfile.isPending}
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
          disabled={updateProfile.isPending}
          label={updateProfile.isPending ? 'Guardando cambios...' : 'Guardar cambios'}
          onPress={handleSubmit(onSubmit)}
        />
      </Section>
    </ScreenLayout>
  );
}
