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
} as const;
