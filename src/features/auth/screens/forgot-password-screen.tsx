import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { AuthLayout } from '@/components/layout/auth-layout';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { StackHeader } from '@/components/layout/stack-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { AuthFooterLink } from '@/features/auth/components/auth-footer-link';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/features/auth/schemas/forgot-password.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';

export function ForgotPasswordScreen() {
  const forgotPassword = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword.reset();
    forgotPassword.mutate(data);
  };

  if (forgotPassword.isSuccess) {
    return (
      <ScreenLayout scrollable centered>
        <StackHeader title="Recuperar contraseña" />
        <Spacer size="lg" />
        <AuthLayout
          title="Revisa tu correo"
          subtitle="Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.">
          <AuthMessage
            message="El enlace puede tardar unos minutos en llegar. Revisa también tu carpeta de spam."
            variant="success"
          />
          <Spacer size="md" />
          <AuthFooterLink
            href={Routes.auth.login}
            linkLabel="Volver al inicio de sesión"
            prompt=""
          />
        </AuthLayout>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <StackHeader title="Recuperar contraseña" />
      <Spacer size="lg" />
      <AuthLayout
        title="Recupera tu acceso"
        subtitle="Te enviaremos un enlace para restablecer tu contraseña">
        {forgotPassword.error ? (
          <AuthMessage message={mapAuthError(forgotPassword.error)} variant="error" />
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="email"
              editable={!forgotPassword.isPending}
              error={errors.email?.message}
              keyboardType="email-address"
              label="Correo electrónico"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="tu@correo.com"
              value={value}
            />
          )}
        />

        <Spacer size="md" />

        <Button
          disabled={forgotPassword.isPending}
          label={forgotPassword.isPending ? 'Enviando enlace...' : 'Enviar enlace'}
          onPress={handleSubmit(onSubmit)}
        />

        <AuthFooterLink
          href={Routes.auth.login}
          linkLabel="Volver al inicio de sesión"
          prompt=""
        />
      </AuthLayout>
    </ScreenLayout>
  );
}
