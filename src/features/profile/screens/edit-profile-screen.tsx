import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

import { FormSection } from '@/components/layout/form-section';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { StackHeader } from '@/components/layout/stack-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ProfileRolesSection } from '@/features/profile/components/profile-roles-section';
import { ProfileAvatarPicker } from '@/features/profile/components/profile-avatar-picker';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile';
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '@/features/profile/schemas/update-profile.schema';
import { mapProfileError } from '@/features/profile/utils/map-profile-error';
import { storageService } from '@/services/storage/storage.service';

export function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const updateProfile = useUpdateProfile();
  const [avatarError, setAvatarError] = useState<string | null>(null);

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
    });
  }, [profile?.id, profile?.fullName, profile?.phone, profile?.locationLabel, profile?.avatarUrl, reset]);

  const fullName = watch('fullName');
  const avatarUrl = watch('avatarUrl');

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

      {updateProfile.error ? (
        <>
          <AuthMessage message={mapProfileError(updateProfile.error)} variant="error" />
          <Spacer size="md" />
        </>
      ) : null}

      {updateProfile.isSuccess ? (
        <>
          <AuthMessage message="Perfil actualizado correctamente." variant="success" />
          <Spacer size="md" />
        </>
      ) : null}

      <ProfileRolesSection />

      <Spacer size="xl" />

      <FormSection title="Información personal">
        <ProfileAvatarPicker
          disabled={updateProfile.isPending}
          name={fullName || profile?.fullName || 'Usuario'}
          onChange={(url) => {
            setAvatarError(null);
            setValue('avatarUrl', url, { shouldDirty: true });
          }}
          onError={setAvatarError}
          onUpload={async (uri) => {
            if (!session?.userId) {
              throw new Error('Sesión no disponible.');
            }

            return storageService.uploadAvatar(session.userId, uri, profile?.avatarUrl);
          }}
          value={avatarUrl}
        />

        {avatarError ? <AuthMessage message={avatarError} variant="error" /> : null}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoComplete="name"
              editable={!updateProfile.isPending}
              error={errors.fullName?.message}
              label="Nombre completo"
              leadingIcon="person-outline"
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
              leadingIcon="call-outline"
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
              leadingIcon="location-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Ciudad o barrio"
              trailingIcon="locate-outline"
              value={value}
            />
          )}
        />
      </FormSection>

      <Spacer size="xl" />

      <Button
        disabled={updateProfile.isPending}
        label={updateProfile.isPending ? 'Guardando cambios...' : 'Guardar cambios'}
        onPress={handleSubmit(onSubmit)}
        variant="dark"
      />

      <Spacer size="lg" />
    </ScreenLayout>
  );
}
