export const queryKeys = {
  profile: {
    all: ['profile'] as const,
    detail: (userId: string) => ['profile', userId] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    detail: (jobId: string) => ['jobs', jobId] as const,
    client: (clientId: string) => ['jobs', 'client', clientId] as const,
    published: ['jobs', 'published'] as const,
  },
  messages: {
    all: ['messages'] as const,
    thread: (threadId: string) => ['messages', threadId] as const,
  },
} as const;
