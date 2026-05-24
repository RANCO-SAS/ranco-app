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
import { useRegister } from '@/features/auth/hooks/use-register';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/register.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';

export function RegisterScreen() {
  const register = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    register.reset();
    register.mutate(data);
  };

  const showEmailConfirmationSuccess =
    register.isSuccess && register.data?.requiresEmailConfirmation;

  if (showEmailConfirmationSuccess) {
    return (
      <ScreenLayout scrollable centered>
        <StackHeader title="Crear cuenta" />
        <Spacer size="lg" />
        <AuthLayout
          title="Revisa tu correo"
          subtitle="Te enviamos un enlace de confirmación para activar tu cuenta.">
          <AuthMessage
            message="Cuando confirmes tu correo, podrás iniciar sesión en Ranco."
            variant="success"
          />
          <Spacer size="md" />
          <AuthFooterLink
            href={Routes.auth.login}
            linkLabel="Ir al inicio de sesión"
            prompt=""
          />
        </AuthLayout>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <StackHeader title="Crear cuenta" />
      <Spacer size="lg" />
      <AuthLayout
        title="Únete a Ranco"
        subtitle="Publica servicios o encuentra profesionales cerca">
        {register.error ? (
          <AuthMessage message={mapAuthError(register.error)} variant="error" />
        ) : null}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoComplete="name"
              editable={!register.isPending}
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
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="email"
              editable={!register.isPending}
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!register.isPending}
              error={errors.password?.message}
              label="Contraseña"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="••••••••"
              secureTextEntry
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!register.isPending}
              error={errors.confirmPassword?.message}
              label="Confirmar contraseña"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="••••••••"
              secureTextEntry
              value={value}
            />
          )}
        />

        <Spacer size="md" />

        <Button
          disabled={register.isPending}
          label={register.isPending ? 'Creando cuenta...' : 'Registrarse'}
          onPress={handleSubmit(onSubmit)}
        />

        <AuthFooterLink
          href={Routes.auth.login}
          linkLabel="Iniciar sesión"
          prompt="¿Ya tienes cuenta?"
        />
      </AuthLayout>
    </ScreenLayout>
  );
}
