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
  },
  messages: {
    all: ['messages'] as const,
    conversations: (userId: string) => ['messages', 'conversations', userId] as const,
    thread: (conversationId: string) => ['messages', conversationId] as const,
  },
} as const;
