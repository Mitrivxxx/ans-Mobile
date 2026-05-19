export const queryKeys = {
  studentPlan: {
    lessons: (userKey: string) =>
      ['studentPlan', userKey, 'lessons'] as const,
    weekLessons: (userKey: string) =>
      ['studentPlan', userKey, 'weekLessons'] as const,
  },
  grades: {
    list: (userKey: string) => ['grades', userKey] as const,
    partial: (userKey: string, pplsId: number) =>
      ['grades', userKey, 'partial', pplsId] as const,
  },
  announcements: {
    list: (userKey: string) => ['announcements', userKey, 'list'] as const,
    detail: (userKey: string, id: string) =>
      ['announcements', userKey, 'detail', id] as const,
  },
  profile: {
    summary: (userKey: string) => ['profile', userKey, 'summary'] as const,
  },
} as const;
