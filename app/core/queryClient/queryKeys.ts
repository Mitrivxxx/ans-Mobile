export const queryKeys = {
  studentPlan: {
    lessons: (userKey: string) =>
      ['studentPlan', userKey, 'lessons'] as const,
    weekLessons: (userKey: string) =>
      ['studentPlan', userKey, 'weekLessons'] as const,
  },
  grades: {
    index: (userKey: string) => ['grades', userKey, 'index'] as const,
    semester: (userKey: string, semesterNumber: number) =>
      ['grades', userKey, 'semester', semesterNumber] as const,
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
    details: (userKey: string) => ['profile', userKey, 'details'] as const,
  },
} as const;
