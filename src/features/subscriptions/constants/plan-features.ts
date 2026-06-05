import type { SubscriptionTargetRole } from '@/features/subscriptions/types/subscription';

export const ANNUAL_DISCOUNT_PERCENT = 20;

export const SUBSCRIPTION_ROLE_COPY: Record<
  SubscriptionTargetRole,
  { subtitle: string; proLabel: string; freeLabel: string }
> = {
  client: {
    subtitle: 'Desbloquea prioridad y visibilidad para tus solicitudes.',
    proLabel: 'Ranco Pro Cliente',
    freeLabel: 'Plan Gratuito',
  },
  professional: {
    subtitle: 'Destaca tu perfil y consigue más trabajos.',
    proLabel: 'Ranco Pro Profesional',
    freeLabel: 'Plan Gratuito',
  },
};
