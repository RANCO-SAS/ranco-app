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
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/features/auth/schemas/forgot-password.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';

export function ForgotPasswordScreen() {
  const router = useRouter();
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
    forgotPassword.mutate(data.email);
  };

  return (
    <ScreenLayout scrollable centered>
      <AuthLayout
        subtitle="Te enviaremos un enlace para restablecer tu contraseña."
        title="Recuperar contraseña">
        {forgotPassword.error ? (
          <AuthMessage message={mapAuthError(forgotPassword.error)} variant="error" />
        ) : null}

        {forgotPassword.isSuccess ? (
          <AuthMessage
            message="Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña."
            variant="success"
          />
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
              label="Correo"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="tu@correo.com"
              textContentType="emailAddress"
              value={value}
            />
          )}
        />

        <Button
          disabled={forgotPassword.isPending}
          label={forgotPassword.isPending ? 'Enviando...' : 'Enviar enlace'}
          onPress={() => {
            void handleSubmit(onSubmit)();
          }}
        />

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.push(Routes.auth.login);
            }}>
            <AppText color="primary" variant="bodyMedium">
              Volver al inicio de sesión
            </AppText>
          </Pressable>
        </View>
      </AuthLayout>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
  },
});
