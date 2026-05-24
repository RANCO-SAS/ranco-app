import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout/stack-header';
import { UberPlanTimeline } from '@/components/ui/uber-plan-timeline';
import { AppText } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ServiceSearchPicker } from '@/features/jobs/components/create-request/service-search-picker';
import { RequestSummaryCard } from '@/features/jobs/components/create-request/request-summary-card';
import { StickyFormFooter } from '@/features/jobs/components/create-request/sticky-form-footer';
import { UrgencySelector } from '@/features/jobs/components/create-request/urgency-selector';
import { useCreateServiceRequest } from '@/features/jobs/hooks/use-create-service-request';
import { useServiceCategories } from '@/features/jobs/hooks/use-service-categories';
import {
  createServiceRequestSchema,
  type CreateServiceRequestFormData,
} from '@/features/jobs/schemas/create-service-request.schema';
import type { ServiceRequestUrgency } from '@/features/jobs/types/service-request.types';
import { getSubcategoryTitleHint } from '@/features/jobs/utils/category-icons';
import { Layout, Spacing } from '@/constants/theme';
import { Loader } from '@/components/ui/loader';
import { useKeyboardLayout } from '@/hooks/use-keyboard-layout';
import { useTheme } from '@/hooks/use-theme';
import { ModeGateEmptyState } from '@/features/profile/components/mode-gate-empty-state';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

const STEP_FIELDS: Array<Array<keyof CreateServiceRequestFormData>> = [
  ['categoryId', 'subcategoryId'],
  ['title', 'description'],
  ['urgency'],
];

const STEP_TITLES = ['¿Qué necesitas?', 'Detalles', 'Confirmar'] as const;

const DESCRIPTION_MIN = 20;
const DESCRIPTION_MAX = 1000;
const TITLE_MAX = 80;

const URGENCY_LABELS: Record<ServiceRequestUrgency, string> = {
  low: 'Flexible',
  normal: 'Normal',
  high: 'Pronto',
  urgent: 'Urgente',
};

export function CreateServiceRequestScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const categoriesQuery = useServiceCategories();
  const createRequest = useCreateServiceRequest();
  const [currentStep, setCurrentStep] = useState(0);
  const { keyboardBehavior, keyboardVerticalOffset } = useKeyboardLayout();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CreateServiceRequestFormData>({
    resolver: zodResolver(createServiceRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      subcategoryId: '',
      urgency: 'normal',
      locationLabel: '',
    },
    mode: 'onChange',
  });

  const selectedCategoryId = watch('categoryId');
  const selectedSubcategoryId = watch('subcategoryId');
  const titleValue = watch('title');
  const descriptionValue = watch('description');
  const urgencyValue = watch('urgency');
  const locationValue = watch('locationLabel');
  const formValues = watch();

  const categories = categoriesQuery.data ?? [];

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const selectedSubcategory = useMemo(
    () => selectedCategory?.subcategories.find((item) => item.id === selectedSubcategoryId),
    [selectedCategory, selectedSubcategoryId],
  );

  const titlePlaceholder = useMemo(
    () => getSubcategoryTitleHint(selectedSubcategory?.slug ?? 'other'),
    [selectedSubcategory?.slug],
  );

  const serviceLabel = selectedSubcategory
    ? `${selectedSubcategory.name} · ${selectedCategory?.name ?? ''}`
    : undefined;

  const descriptionLength = descriptionValue.trim().length;
  const titleLength = titleValue.trim().length;
  const isLastStep = currentStep === STEP_TITLES.length - 1;

  const onSubmit = (data: CreateServiceRequestFormData) => {
    if (!session?.userId) {
      return;
    }

    createRequest.mutate({
      clientId: session.userId,
      ...data,
    });
  };

  const handlePrimaryPress = async () => {
    const fields = STEP_FIELDS[currentStep];
    const isValid = await trigger(fields);

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

  const handleServiceSelect = (result: {
    categoryId: string;
    subcategoryId: string;
    subcategoryName: string;
  }) => {
    setValue('categoryId', result.categoryId, { shouldValidate: true });
    setValue('subcategoryId', result.subcategoryId, { shouldValidate: true });

    if (!titleValue.trim()) {
      setValue('title', result.subcategoryName, { shouldValidate: false });
    }

    setCurrentStep(1);
  };

  if (!profile?.isClient || activeMode !== 'client') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StackHeader title="Nueva solicitud" />
        <View style={styles.guardContent}>
          <ModeGateEmptyState requiredMode="client" />
        </View>
      </SafeAreaView>
    );
  }

  if (categoriesQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Loader message="Preparando servicios..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StackHeader title={STEP_TITLES[currentStep]} />

      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.flex}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {currentStep > 0 ? (
            <UberPlanTimeline
              steps={[
                {
                  label: 'Servicio',
                  value: serviceLabel,
                  completed: true,
                  active: currentStep === 1,
                },
                {
                  label: 'Detalles',
                  value: titleValue.trim() || undefined,
                  completed: currentStep > 1,
                  active: currentStep === 1,
                },
                {
                  label: 'Confirmar',
                  value: isLastStep ? URGENCY_LABELS[urgencyValue] : undefined,
                  completed: false,
                  active: currentStep === 2,
                },
              ]}
            />
          ) : null}

          {categoriesQuery.error ? (
            <AuthMessage message="No pudimos cargar los servicios." variant="error" />
          ) : null}

          {createRequest.error ? (
            <AuthMessage
              message="No pudimos publicar tu solicitud. Revisa los datos e inténtalo de nuevo."
              variant="error"
            />
          ) : null}

          {currentStep === 0 ? (
            <View style={styles.stepContent}>
              <ServiceSearchPicker
                autoFocus
                categories={categories}
                categoryId={selectedCategoryId}
                disabled={createRequest.isPending}
                error={errors.categoryId?.message ?? errors.subcategoryId?.message}
                onClear={() => {
                  setValue('categoryId', '', { shouldValidate: true });
                  setValue('subcategoryId', '', { shouldValidate: true });
                }}
                onSelect={handleServiceSelect}
                subcategoryId={selectedSubcategoryId}
              />
            </View>
          ) : null}

          {currentStep === 1 ? (
            <View style={styles.stepContent}>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldGroup}>
                    <AppText color="textMuted" variant="small">
                      TÍTULO
                    </AppText>
                    <Input
                      editable={!createRequest.isPending}
                      error={errors.title?.message}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder={titlePlaceholder}
                      value={value}
                    />
                    <AppText color="textMuted" variant="small">
                      {titleLength}/{TITLE_MAX}
                    </AppText>
                  </View>
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldGroup}>
                    <AppText color="textMuted" variant="small">
                      DESCRIPCIÓN
                    </AppText>
                    <Input
                      editable={!createRequest.isPending}
                      error={errors.description?.message}
                      multiline
                      numberOfLines={6}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Cuéntale al profesional qué necesitas, cuándo y cualquier detalle útil."
                      style={styles.textArea}
                      value={value}
                    />
                    <AppText color="textMuted" variant="small">
                      {descriptionLength}/{DESCRIPTION_MAX}
                      {descriptionLength > 0 && descriptionLength < DESCRIPTION_MIN
                        ? ` · mínimo ${DESCRIPTION_MIN}`
                        : ''}
                    </AppText>
                  </View>
                )}
              />

              <Controller
                control={control}
                name="locationLabel"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldGroup}>
                    <AppText color="textMuted" variant="small">
                      UBICACIÓN (OPCIONAL)
                    </AppText>
                    <Input
                      editable={!createRequest.isPending}
                      error={errors.locationLabel?.message}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Barrio, calle o referencia"
                      value={value}
                    />
                  </View>
                )}
              />
            </View>
          ) : null}

          {currentStep === 2 ? (
            <View style={styles.stepContent}>
              <RequestSummaryCard categories={categories} values={formValues} />

              <Controller
                control={control}
                name="urgency"
                render={({ field: { value, onChange } }) => (
                  <UrgencySelector
                    disabled={createRequest.isPending}
                    error={errors.urgency?.message}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />

              {locationValue ? (
                <AppText color="textMuted" variant="caption">
                  Ubicación: {locationValue}
                </AppText>
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        {currentStep > 0 ? (
          <StickyFormFooter
            onBackPress={handleBackPress}
            onPrimaryPress={() => {
              void handlePrimaryPress();
            }}
            primaryDisabled={createRequest.isPending}
            primaryLabel={isLastStep ? 'Solicitar servicio' : 'Siguiente'}
            primaryLoading={createRequest.isPending}
            showBack
          />
        ) : null}
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  stepContent: {
    gap: Spacing.lg,
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  guardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
});
