import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { StickyFormFooter } from '@/features/jobs/components/create-request/sticky-form-footer';
import { OnboardingProgressBar } from '@/features/profile/components/onboarding-progress-bar';
import { OnboardingStepHeader } from '@/features/profile/components/onboarding-step-header';
import { RoleSelector } from '@/features/profile/components/role-selector';
import { ProfessionalAreasPicker } from '@/features/profile/components/professional-areas-picker';
import { ProfileAvatarPicker } from '@/features/profile/components/profile-avatar-picker';
import { useCompleteOnboarding } from '@/features/profile/hooks/use-complete-onboarding';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useServiceCategories } from '@/features/jobs/hooks/use-service-categories';
import {
  ONBOARDING_PROFILE_FIELDS,
  ONBOARDING_ROLE_FIELDS,
  ONBOARDING_SERVICES_FIELDS,
  onboardingSchema,
  type OnboardingFormData,
} from '@/features/profile/schemas/onboarding.schema';
import { mapProfileError } from '@/features/profile/utils/map-profile-error';
import { PROFESSIONAL_SERVICE_SELECTION } from '@/constants/profile';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useKeyboardLayout } from '@/hooks/use-keyboard-layout';
import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage/storage.service';

function getFirstName(fullName: string): string {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return 'ahí';
  }

  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function getStepHeader(
  stepIndex: number,
  isProfessional: boolean,
  hasPrefilledName: boolean,
  fullName: string,
  prefilledName: string,
): { title: string; subtitle?: string } {
  if (stepIndex === 0) {
    return {
      title: hasPrefilledName ? `Hola, ${getFirstName(fullName || prefilledName)}` : 'Crea tu perfil',
      subtitle: 'Configuremos los datos básicos de tu cuenta.',
    };
  }

  if (stepIndex === 1) {
    return {
      title: '¿Cómo quieres usar Ranco?',
      subtitle:
        'Selecciona tu perfil principal. Podrás ajustarlo más adelante en la configuración.',
    };
  }

  if (stepIndex === 2 && isProfessional) {
    return {
      title: 'Tus servicios',
      subtitle: 'Elige las categorías en las que ofreces servicios.',
    };
  }

  return { title: 'Configuración' };
}

export function OnboardingScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const completeOnboarding = useCompleteOnboarding();
  const categoriesQuery = useServiceCategories();
  const [currentStep, setCurrentStep] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const { keyboardBehavior, keyboardVerticalOffset } = useKeyboardLayout();

  const prefilledName = profile?.fullName?.trim() || session?.fullName?.trim() || '';
  const hasPrefilledName = prefilledName.length >= 2;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: prefilledName,
      phone: profile?.phone ?? '',
      locationLabel: profile?.locationLabel ?? '',
      avatarUrl: profile?.avatarUrl ?? '',
      isClient: true,
      isProfessional: false,
      professionalSubcategoryIds: [],
    },
    mode: 'onChange',
  });

  const fullName = watch('fullName');
  const avatarUrl = watch('avatarUrl');
  const isClient = watch('isClient');
  const isProfessional = watch('isProfessional');

  useEffect(() => {
    if (prefilledName) {
      setValue('fullName', prefilledName, { shouldValidate: true });
    }

    if (profile?.avatarUrl) {
      setValue('avatarUrl', profile.avatarUrl);
    }
  }, [prefilledName, profile?.avatarUrl, setValue]);

  useEffect(() => {
    if (!isProfessional && currentStep > 1) {
      setCurrentStep(1);
    }
  }, [currentStep, isProfessional]);

  const totalSteps = isProfessional ? 3 : 2;
  const isLastStep = currentStep === totalSteps - 1;
  const stepHeader = getStepHeader(
    currentStep,
    isProfessional,
    hasPrefilledName,
    fullName,
    prefilledName,
  );

  const canContinueRoleStep = isClient || isProfessional;
  const primaryDisabled =
    completeOnboarding.isPending || (currentStep === 1 && !canContinueRoleStep);

  const onSubmit = (data: OnboardingFormData) => {
    if (!session?.userId) {
      return;
    }

    completeOnboarding.reset();
    completeOnboarding.mutate({
      userId: session.userId,
      ...data,
    });
  };

  const handlePrimaryPress = async () => {
    const stepFields =
      currentStep === 0
        ? [...ONBOARDING_PROFILE_FIELDS]
        : currentStep === 1
          ? [...ONBOARDING_ROLE_FIELDS]
          : [...ONBOARDING_SERVICES_FIELDS];

    const isValid = await trigger(stepFields);

    if (!isValid) {
      return;
    }

    if (isLastStep) {
      void handleSubmit(onSubmit)();
      return;
    }

    setCurrentStep((step) => step + 1);
  };

  const handleBackPress = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.flex}>
        <View style={styles.topBar}>
          {currentStep > 0 ? (
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              hitSlop={Spacing.sm}
              onPress={handleBackPress}
              style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}>
              <AppIcon color={theme.text} name="chevron-back" size={22} />
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          <AppText color="primary" variant="bodyMedium">
            Ranco
          </AppText>

          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          <Spacer size="xl" />

          <OnboardingStepHeader subtitle={stepHeader.subtitle} title={stepHeader.title} />

          <Spacer size="lg" />

          {completeOnboarding.error ? (
            <>
              <AuthMessage message={mapProfileError(completeOnboarding.error)} variant="error" />
              <Spacer size="md" />
            </>
          ) : null}

          {currentStep === 0 ? (
            <View style={styles.stepContent}>
              <ProfileAvatarPicker
                disabled={completeOnboarding.isPending}
                name={fullName || prefilledName || 'Usuario'}
                onChange={(url) => {
                  setAvatarError(null);
                  setValue('avatarUrl', url, { shouldValidate: true });
                }}
                onError={setAvatarError}
                onUpload={async (uri) => {
                  if (!session?.userId) {
                    throw new Error('Sesión no disponible.');
                  }

                  return storageService.uploadAvatar(session.userId, uri, profile?.avatarUrl);
                }}
                value={avatarUrl}
                variant="onboarding"
              />
              {avatarError ? <AuthMessage message={avatarError} variant="error" /> : null}

              {!hasPrefilledName ? (
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      autoComplete="name"
                      editable={!completeOnboarding.isPending}
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
              ) : null}

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    autoComplete="tel"
                    editable={!completeOnboarding.isPending}
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
                    editable={!completeOnboarding.isPending}
                    error={errors.locationLabel?.message}
                    label="Ciudad o zona"
                    leadingIcon="location-outline"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Ej. Chapinero, Bogotá"
                    value={value}
                  />
                )}
              />
            </View>
          ) : null}

          {currentStep === 1 ? (
            <View style={styles.stepContent}>
              <RoleSelector
                disabled={completeOnboarding.isPending}
                error={errors.isClient?.message}
                isClient={isClient}
                isProfessional={isProfessional}
                onChange={({ isClient: nextClient, isProfessional: nextProfessional }) => {
                  setValue('isClient', nextClient, { shouldValidate: true });
                  setValue('isProfessional', nextProfessional, { shouldValidate: true });

                  if (!nextProfessional) {
                    setValue('professionalSubcategoryIds', [], { shouldValidate: true });
                  }
                }}
              />
            </View>
          ) : null}

          {currentStep === 2 && isProfessional ? (
            <View style={styles.stepContent}>
              <Controller
                control={control}
                name="professionalSubcategoryIds"
                render={({ field: { value, onChange } }) => (
                  <ProfessionalAreasPicker
                    categories={categoriesQuery.data ?? []}
                    disabled={completeOnboarding.isPending || categoriesQuery.isLoading}
                    error={errors.professionalSubcategoryIds?.message}
                    maxSelections={PROFESSIONAL_SERVICE_SELECTION.max}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          ) : null}
        </ScrollView>

        <StickyFormFooter
          onPrimaryPress={() => {
            void handlePrimaryPress();
          }}
          primaryDisabled={primaryDisabled}
          primaryLabel={
            completeOnboarding.isPending
              ? 'Guardando...'
              : isLastStep
                ? 'Empezar en Ranco'
                : 'Continuar'
          }
          primaryLoading={completeOnboarding.isPending}
          primaryVariant="gradient"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 40,
    height: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: Spacing.xl,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  stepContent: {
    gap: Spacing.lg,
  },
});
