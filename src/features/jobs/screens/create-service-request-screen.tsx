import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout/stack-header';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { CreateRequestProgressBar } from '@/features/jobs/components/create-request/create-request-progress-bar';
import { RequestDetailsStep } from '@/features/jobs/components/create-request/request-details-step';
import { ServiceRequestPhotoPicker } from '@/features/jobs/components/service-request-photo-picker';
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
import type { ServiceRequestPhotoItem } from '@/features/jobs/types/service-request-photo.types';
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
  ['title', 'description', 'locationLabel'],
  ['urgency'],
];

const STEP_TITLES = ['¿Qué necesitas?', 'Detalles', 'Confirmar'] as const;
const TOTAL_STEPS = STEP_TITLES.length;

const DESCRIPTION_MAX = 1000;

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
  const { categoryId: presetCategoryId, subcategoryId: presetSubcategoryId } = useLocalSearchParams<{
    categoryId?: string;
    subcategoryId?: string;
  }>();
  const categoriesQuery = useServiceCategories();
  const createRequest = useCreateServiceRequest();
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<ServiceRequestPhotoItem[]>([]);
  const { keyboardBehavior, keyboardVerticalOffset } = useKeyboardLayout();
  const hasAppliedPresetRef = useRef(false);

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
      locationLat: null,
      locationLng: null,
    },
    mode: 'onChange',
  });

  const selectedCategoryId = watch('categoryId');
  const selectedSubcategoryId = watch('subcategoryId');
  const titleValue = watch('title');
  const descriptionValue = watch('description');
  const urgencyValue = watch('urgency');
  const formValues = watch();

  const categories = categoriesQuery.data ?? [];

  useEffect(() => {
    if (hasAppliedPresetRef.current || categories.length === 0) {
      return;
    }

    const categoryId = typeof presetCategoryId === 'string' ? presetCategoryId : undefined;
    const subcategoryId = typeof presetSubcategoryId === 'string' ? presetSubcategoryId : undefined;

    if (!categoryId || !subcategoryId) {
      return;
    }

    const category = categories.find((item) => item.id === categoryId);
    const subcategory = category?.subcategories.find((item) => item.id === subcategoryId);

    if (!category || !subcategory) {
      return;
    }

    setValue('categoryId', categoryId, { shouldValidate: true });
    setValue('subcategoryId', subcategoryId, { shouldValidate: true });
    setValue('title', subcategory.name, { shouldValidate: false });
    setCurrentStep(1);
    hasAppliedPresetRef.current = true;
  }, [categories, presetCategoryId, presetSubcategoryId, setValue]);

  useEffect(() => {
    if (currentStep !== 1 || formValues.locationLabel?.trim()) {
      return;
    }

    if (profile?.locationLabel?.trim()) {
      setValue('locationLabel', profile.locationLabel.trim(), { shouldValidate: false });
    }
  }, [currentStep, formValues.locationLabel, profile?.locationLabel, setValue]);

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

  const descriptionLength = descriptionValue.trim().length;
  const titleLength = titleValue.trim().length;
  const isLastStep = currentStep === STEP_TITLES.length - 1;

  const onSubmit = (data: CreateServiceRequestFormData) => {
    if (!session?.userId) {
      return;
    }

    createRequest.mutate({
      clientId: session.userId,
      photos,
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
      <StackHeader
        subtitle={currentStep > 0 ? `Paso ${currentStep + 1} de ${TOTAL_STEPS}` : undefined}
        title={STEP_TITLES[currentStep]}
      />

      {currentStep > 0 ? (
        <View style={styles.progressWrap}>
          <CreateRequestProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.flex}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={Platform.OS === 'android'}
          scrollEnabled
          showsVerticalScrollIndicator={false}>
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
            <RequestDetailsStep
              control={control}
              descriptionLength={descriptionLength}
              disabled={createRequest.isPending}
              errors={errors}
              onPhotosChange={setPhotos}
              photos={photos}
              titleLength={titleLength}
              titlePlaceholder={titlePlaceholder}
            />
          ) : null}

          {currentStep === 2 ? (
            <View style={styles.stepContent}>
              <RequestSummaryCard categories={categories} photos={photos} values={formValues} />

              <ServiceRequestPhotoPicker
                disabled={createRequest.isPending}
                onChange={setPhotos}
                photos={photos}
              />

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

            </View>
          ) : null}
        </ScrollView>

        {currentStep > 0 ? (
          <StickyFormFooter
            layout="split"
            onBackPress={handleBackPress}
            onPrimaryPress={() => {
              void handlePrimaryPress();
            }}
            primaryDisabled={createRequest.isPending}
            primaryLabel={
              createRequest.isPending
                ? 'Publicando...'
                : isLastStep
                  ? 'Solicitar servicio'
                  : 'Siguiente'
            }
            primaryLoading={createRequest.isPending}
            primaryVariant="gradient"
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  progressWrap: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  stepContent: {
    gap: Spacing.lg,
  },
  guardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
});
