import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthLayout } from '@/components/layout/auth-layout';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
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
      <AuthLayout
        brand="Ranco"
        subtitle="Regístrate para conectar con servicios y profesionales cerca de ti."
        title="Crear cuenta">
        {signUp.error ? (
          <StaggeredFadeIn index={0}>
            <AuthMessage message={mapAuthError(signUp.error)} variant="error" />
          </StaggeredFadeIn>
        ) : null}

        {signUp.isSuccess && !signUp.data ? (
          <StaggeredFadeIn index={0}>
            <AuthMessage message="Revisa tu correo para confirmar la cuenta." variant="success" />
          </StaggeredFadeIn>
        ) : null}

        <StaggeredFadeIn index={1}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                autoComplete="name"
                editable={!signUp.isPending}
                error={errors.fullName?.message}
                label="Nombre completo"
                leadingIcon="person-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Tu nombre"
                textContentType="name"
                value={value}
              />
            )}
          />
        </StaggeredFadeIn>

        <StaggeredFadeIn index={2}>
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
                leadingIcon="mail-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="tu@correo.com"
                textContentType="emailAddress"
                value={value}
              />
            )}
          />
        </StaggeredFadeIn>

        <StaggeredFadeIn index={3}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                autoComplete="new-password"
                editable={!signUp.isPending}
                error={errors.password?.message}
                label="Contraseña"
                leadingIcon="lock-closed-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                showPasswordToggle
                textContentType="newPassword"
                value={value}
              />
            )}
          />
        </StaggeredFadeIn>

        <StaggeredFadeIn index={4}>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                autoComplete="new-password"
                editable={!signUp.isPending}
                error={errors.confirmPassword?.message}
                label="Confirmar contraseña"
                leadingIcon="lock-closed-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Repite tu contraseña"
                secureTextEntry
                showPasswordToggle
                textContentType="newPassword"
                value={value}
              />
            )}
          />
        </StaggeredFadeIn>

        <StaggeredFadeIn index={5}>
          <Button
            disabled={signUp.isPending}
            label={signUp.isPending ? 'Creando cuenta...' : 'Registrarme'}
            onPress={() => {
              void handleSubmit(onSubmit)();
            }}
            variant="gradient"
          />
        </StaggeredFadeIn>

        <StaggeredFadeIn index={6}>
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
        </StaggeredFadeIn>
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
