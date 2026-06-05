import type { Href } from 'expo-router';

import { Routes } from '@/constants/routes';
import type { AppNotification } from '@/features/notifications/types/notification.types';

export function resolveNotificationRoute(notification: AppNotification): Href | null {
  if (
    (notification.type === 'new_message' ||
      notification.type === 'new_offer' ||
      notification.type === 'offer_accepted' ||
      notification.type === 'new_conversation') &&
    notification.data.conversationId
  ) {
    return Routes.app.conversation(notification.data.conversationId);
  }

  if (notification.type === 'payment_pending_claim' && notification.data.jobId) {
    return Routes.app.claimPayout(notification.data.jobId);
  }

  if (notification.type === 'payment_completed' && notification.data.jobId) {
    return Routes.app.jobDetail(notification.data.jobId);
  }

  if (notification.data.jobId) {
    return Routes.app.jobDetail(notification.data.jobId);
  }

  if (notification.data.reviewId) {
    return Routes.app.reviewDetail(notification.data.reviewId);
  }

  if (notification.type === 'job_opportunity') {
    return Routes.app.discover;
  }

  return null;
}
