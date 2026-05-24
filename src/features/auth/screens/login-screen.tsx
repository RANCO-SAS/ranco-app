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
import { SocialAuthButtons } from '@/features/auth/components/social-auth-buttons';
import { useLogin } from '@/features/auth/hooks/use-login';
import { useOAuthLogin } from '@/features/auth/hooks/use-oauth-login';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/login.schema';
import type { OAuthProviderId } from '@/features/auth/types/auth.types';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';

export function LoginScreen() {
  const login = useLogin();
  const oauthLogin = useOAuthLogin();

  const isAuthPending = login.isPending || oauthLogin.isPending;
  const authError = login.error ?? oauthLogin.error;

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
    oauthLogin.reset();
    login.mutate(data);
  };

  const handleOAuthPress = (provider: OAuthProviderId) => {
    login.reset();
    oauthLogin.reset();
    oauthLogin.mutate(provider);
  };

  return (
    <ScreenLayout scrollable centered>
      <AuthLayout
        title="Ranco"
        subtitle="Conecta con profesionales cerca de ti">
        {authError ? <AuthMessage message={mapAuthError(authError)} variant="error" /> : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="email"
              editable={!isAuthPending}
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
              editable={!isAuthPending}
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
          <Pressable disabled={isAuthPending} style={styles.forgotPassword}>
            <AppText variant="caption" color="primary">
              ¿Olvidaste tu contraseña?
            </AppText>
          </Pressable>
        </Link>

        <Spacer size="md" />

        <Button
          disabled={isAuthPending}
          label={login.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
          onPress={handleSubmit(onSubmit)}
        />

        <Spacer size="md" />

        <SocialAuthButtons
          disabled={isAuthPending}
          pendingProvider={oauthLogin.isPending ? oauthLogin.variables : null}
          onProviderPress={handleOAuthPress}
        />

        <Spacer size="md" />

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
