import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AuthLayout } from '@/components/layout/auth-layout';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useResetPassword } from '@/features/auth/hooks/use-reset-password';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/features/auth/schemas/reset-password.schema';
import {
  createSessionFromUrl,
  waitForAuthSession,
} from '@/features/auth/utils/auth-session-from-url';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';

export function ResetPasswordScreen() {
  const resetPassword = useResetPassword();
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession(url: string | null) {
      if (!url) {
        const session = await waitForAuthSession(1500);

        if (isMounted) {
          setIsSessionReady(Boolean(session));
          setSessionError(session ? null : 'Abre el enlace del correo para continuar.');
        }

        return;
      }

      try {
        await createSessionFromUrl(url);
        const session = await waitForAuthSession();

        if (!isMounted) {
          return;
        }

        setIsSessionReady(Boolean(session));
        setSessionError(session ? null : 'El enlace de recuperación no es válido o expiró.');
      } catch (error) {
        if (isMounted) {
          setIsSessionReady(false);
          setSessionError(mapAuthError(error));
        }
      }
    }

    void Linking.getInitialURL().then((url) => {
      void prepareRecoverySession(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void prepareRecoverySession(url);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword.reset();
    resetPassword.mutate({ password: data.password });
  };

  if (!isSessionReady && !sessionError) {
    return <Loader message="Validando enlace..." />;
  }

  return (
    <ScreenLayout scrollable centered>
      <AuthLayout title="Nueva contraseña">
        {sessionError ? <AuthMessage message={sessionError} variant="error" /> : null}

        {resetPassword.error ? (
          <AuthMessage message={mapAuthError(resetPassword.error)} variant="error" />
        ) : null}

        {isSessionReady ? (
          <>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  autoComplete="new-password"
                  editable={!resetPassword.isPending}
                  error={errors.password?.message}
                  label="Nueva contraseña"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry
                  textContentType="newPassword"
                  value={value}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  autoComplete="new-password"
                  editable={!resetPassword.isPending}
                  error={errors.confirmPassword?.message}
                  label="Confirmar contraseña"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Repite tu contraseña"
                  secureTextEntry
                  textContentType="newPassword"
                  value={value}
                />
              )}
            />

            <Button
              disabled={resetPassword.isPending}
              label={resetPassword.isPending ? 'Guardando...' : 'Actualizar contraseña'}
              onPress={() => {
                void handleSubmit(onSubmit)();
              }}
            />
          </>
        ) : null}
      </AuthLayout>
    </ScreenLayout>
  );
}
