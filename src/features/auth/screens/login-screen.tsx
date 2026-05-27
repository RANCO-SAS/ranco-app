import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthLayout } from '@/components/layout/auth-layout';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppText } from '@/components/ui/text';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useSignIn } from '@/features/auth/hooks/use-sign-in';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/login.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';

export function LoginScreen() {
  const router = useRouter();
  const signIn = useSignIn();

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
    signIn.reset();
    signIn.mutate(data);
  };

  return (
    <ScreenLayout scrollable centered>
      <AuthLayout title="Ranco">
        {signIn.error ? (
          <AuthMessage message={mapAuthError(signIn.error)} variant="error" />
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="email"
              editable={!signIn.isPending}
              error={errors.email?.message}
              keyboardType="email-address"
              label="Correo"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="tu@correo.com"
              textContentType="emailAddress"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoComplete="password"
              editable={!signIn.isPending}
              error={errors.password?.message}
              label="Contraseña"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="••••••••"
              secureTextEntry
              textContentType="password"
              value={value}
            />
          )}
        />

        <Button
          disabled={signIn.isPending}
          label={signIn.isPending ? 'Entrando...' : 'Iniciar sesión'}
          onPress={() => {
            void handleSubmit(onSubmit)();
          }}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            router.push(Routes.auth.forgotPassword);
          }}>
          <AppText color="primary" variant="body">
            ¿Olvidaste tu contraseña?
          </AppText>
        </Pressable>

        <View style={styles.footer}>
          <AppText color="textSecondary" variant="body">
            ¿No tienes cuenta?
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.push(Routes.auth.register);
            }}>
            <AppText color="primary" variant="bodyMedium">
              Crear cuenta
            </AppText>
          </Pressable>
        </View>
      </AuthLayout>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
});
