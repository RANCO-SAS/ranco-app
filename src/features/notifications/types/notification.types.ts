export type NotificationType =
  | 'job_opportunity'
  | 'new_message'
  | 'new_review'
  | 'job_status'
  | 'new_conversation';

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
  readAt: string | null;
  createdAt: string;
};

export type NotificationData = {
  jobId?: string;
  conversationId?: string;
  messageId?: string;
  reviewId?: string;
  subcategoryId?: string;
  status?: string;
};

export type PushTokenPlatform = 'android' | 'ios' | 'web';

export type PushTokenInput = {
  token: string;
  platform: PushTokenPlatform;
  deviceName?: string;
};
