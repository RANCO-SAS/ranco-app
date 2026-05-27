import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { UberPlanTimeline } from '@/components/ui/uber-plan-timeline';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { StickyFormFooter } from '@/features/jobs/components/create-request/sticky-form-footer';
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
import { Layout, Spacing } from '@/constants/theme';
import { useKeyboardLayout } from '@/hooks/use-keyboard-layout';
import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage/storage.service';

const STEP_TITLES = ['Tu perfil', 'Tu uso', 'Tus servicios'] as const;

function getFirstName(fullName: string): string {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return 'ahí';
  }

  return trimmed.split(/\s+/)[0] ?? trimmed;
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

  const visibleSteps = useMemo(() => {
    return isProfessional ? STEP_TITLES : STEP_TITLES.slice(0, 2);
  }, [isProfessional]);

  const isLastStep = currentStep === visibleSteps.length - 1;

  const timelineSteps = visibleSteps.map((label, index) => ({
    label: `Paso ${index + 1}`,
    value: label,
    completed: index < currentStep,
    active: index === currentStep,
  }));

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <UberPlanTimeline steps={timelineSteps} />

          <Spacer size="xl" />

          {completeOnboarding.error ? (
            <>
              <AuthMessage message={mapProfileError(completeOnboarding.error)} variant="error" />
              <Spacer size="md" />
            </>
          ) : null}

          {currentStep === 0 ? (
            <View style={styles.stepContent}>
              {hasPrefilledName ? (
                <AppText variant="title">Hola, {getFirstName(fullName || prefilledName)}</AppText>
              ) : null}

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
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Tu nombre"
                      textContentType="name"
                      value={value}
                    />
                  )}
                />
              ) : null}

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
              />
              {avatarError ? <AuthMessage message={avatarError} variant="error" /> : null}

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
              <AppText variant="subtitle">Servicios</AppText>

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
          onBackPress={currentStep > 0 ? handleBackPress : undefined}
          onPrimaryPress={() => {
            void handlePrimaryPress();
          }}
          primaryDisabled={completeOnboarding.isPending}
          primaryLabel={
            completeOnboarding.isPending
              ? 'Guardando...'
              : isLastStep
                ? 'Empezar en Ranco'
                : 'Siguiente'
          }
          primaryLoading={completeOnboarding.isPending}
          showBack={currentStep > 0}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  stepContent: {
    gap: Spacing.lg,
  },
});
