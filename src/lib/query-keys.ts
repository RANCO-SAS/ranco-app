export const queryKeys = {
  profile: {
    all: ['profile'] as const,
    detail: (userId: string) => ['profile', userId] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    categories: ['jobs', 'categories'] as const,
    detail: (jobId: string) => ['jobs', jobId] as const,
    client: (clientId: string) => ['jobs', 'client', clientId] as const,
    published: ['jobs', 'published'] as const,
    completedHistory: (userId: string) => ['jobs', 'completed-history', userId] as const,
  },
  messages: {
    all: ['messages'] as const,
    conversations: (userId: string) => ['messages', 'conversations', userId] as const,
    thread: (conversationId: string) => ['messages', conversationId] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    profile: (userId: string) => ['reviews', 'profile', userId] as const,
    job: (serviceRequestId: string, reviewerId: string) =>
      ['reviews', 'job', serviceRequestId, reviewerId] as const,
    detail: (reviewId: string) => ['reviews', 'detail', reviewId] as const,
    portfolio: (userId: string) => ['reviews', 'portfolio', userId] as const,
    ratedJobs: (userId: string, role?: 'client' | 'professional') =>
      role ? (['reviews', 'rated-jobs', userId, role] as const) : (['reviews', 'rated-jobs', userId] as const),
  },
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => ['notifications', 'list', userId] as const,
    unreadCount: (userId: string) => ['notifications', 'unread-count', userId] as const,
  },
  featuredProfessionals: {
    all: ['featured-professionals'] as const,
    list: (subcategoryKey: string) => ['featured-professionals', subcategoryKey] as const,
  },
  location: {
    geocode: (label: string) => ['location', 'geocode', label] as const,
  },
  offers: {
    all: ['offers'] as const,
    byConversation: (conversationId: string) => ['offers', conversationId] as const,
    pending: (conversationId: string) => ['offers', conversationId, 'pending'] as const,
  },
  payments: {
    all: ['payments'] as const,
    byRequest: (serviceRequestId: string) => ['payments', 'request', serviceRequestId] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    plans: (role: 'client' | 'professional') => ['subscriptions', 'plans', role] as const,
    byUser: (userId: string, role: 'client' | 'professional') =>
      ['subscriptions', 'user', userId, role] as const,
    proStatus: (userId: string, role: 'client' | 'professional') =>
      ['subscriptions', 'pro-status', userId, role] as const,
  },
} as const;
