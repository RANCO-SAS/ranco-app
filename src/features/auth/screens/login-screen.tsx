import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet } from 'react-native';

import { AuthLayout } from '@/components/layout/auth-layout';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { AuthFooterLink } from '@/features/auth/components/auth-footer-link';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useLogin } from '@/features/auth/hooks/use-login';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/login.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';

export function LoginScreen() {
  const login = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login.reset();
    login.mutate(data);
  };

  return (
    <ScreenLayout scrollable centered>
      <AuthLayout
        title="Ranco"
        subtitle="Conecta con profesionales cerca de ti">
        {login.error ? <AuthMessage message={mapAuthError(login.error)} variant="error" /> : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="email"
              editable={!login.isPending}
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
              autoComplete="password"
              editable={!login.isPending}
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

        <Link href={Routes.auth.forgotPassword} asChild>
          <Pressable disabled={login.isPending} style={styles.forgotPassword}>
            <AppText variant="caption" color="primary">
              ¿Olvidaste tu contraseña?
            </AppText>
          </Pressable>
        </Link>

        <Spacer size="md" />

        <Button
          disabled={login.isPending}
          label={login.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
          onPress={handleSubmit(onSubmit)}
        />

        <AuthFooterLink
          href={Routes.auth.register}
          linkLabel="Crear cuenta"
          prompt="¿No tienes cuenta?"
        />
      </AuthLayout>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    alignSelf: 'flex-end',
  },
});
