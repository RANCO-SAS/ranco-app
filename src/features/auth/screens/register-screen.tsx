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
import { useSignUp } from '@/features/auth/hooks/use-sign-up';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/register.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';

export function RegisterScreen() {
  const router = useRouter();
  const signUp = useSignUp();

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
    signUp.reset();
    signUp.mutate({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
    });
  };

  return (
    <ScreenLayout scrollable centered>
      <AuthLayout title="Crear cuenta" subtitle="Regístrate con correo y contraseña">
        {signUp.error ? (
          <AuthMessage message={mapAuthError(signUp.error)} variant="error" />
        ) : null}

        {signUp.isSuccess && !signUp.data ? (
          <AuthMessage
            message="Revisa tu correo para confirmar la cuenta antes de iniciar sesión."
            variant="success"
          />
        ) : null}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoComplete="name"
              editable={!signUp.isPending}
              error={errors.fullName?.message}
              label="Nombre completo"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Tu nombre"
              textContentType="name"
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
              editable={!signUp.isPending}
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
              autoComplete="new-password"
              editable={!signUp.isPending}
              error={errors.password?.message}
              label="Contraseña"
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
              editable={!signUp.isPending}
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
          disabled={signUp.isPending}
          label={signUp.isPending ? 'Creando cuenta...' : 'Registrarme'}
          onPress={() => {
            void handleSubmit(onSubmit)();
          }}
        />

        <View style={styles.footer}>
          <AppText color="textSecondary" variant="body">
            ¿Ya tienes cuenta?
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.push(Routes.auth.login);
            }}>
            <AppText color="primary" variant="bodyMedium">
              Iniciar sesión
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
