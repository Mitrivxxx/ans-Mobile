import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from './queryKeys';
import type { RootParamList } from '../../navigation/navigationRef';

type AppScreenName = Exclude<keyof RootParamList, 'Login'>;

export async function resetScreenQueries(
  queryClient: QueryClient,
  screen: AppScreenName,
  userKey: string
): Promise<void> {
  switch (screen) {
    case 'Dashboard':
      await Promise.all([
        queryClient.resetQueries({
          queryKey: queryKeys.studentPlan.lessons(userKey),
        }),
        queryClient.resetQueries({
          queryKey: ['studentPlan', userKey, 'weekLessons'],
        }),
        queryClient.resetQueries({
          queryKey: queryKeys.grades.index(userKey),
        }),
        queryClient.resetQueries({
          queryKey: queryKeys.announcements.list(userKey),
        }),
        queryClient.resetQueries({
          queryKey: ['events', userKey, 'list'],
        }),
      ]);
      return;
    case 'Plan':
      await Promise.all([
        queryClient.resetQueries({
          queryKey: queryKeys.studentPlan.lessons(userKey),
        }),
        queryClient.resetQueries({
          queryKey: ['studentPlan', userKey, 'weekLessons'],
        }),
      ]);
      return;
    case 'Grades':
      await queryClient.resetQueries({
        queryKey: ['grades', userKey],
      });
      return;
    case 'Announcements':
      await queryClient.resetQueries({
        queryKey: ['announcements', userKey],
      });
      return;
    case 'Profile':
      await queryClient.resetQueries({
        queryKey: ['profile', userKey],
      });
      return;
    case 'Finanse':
      await queryClient.resetQueries({
        queryKey: queryKeys.finance.fees(userKey),
      });
      return;
    case 'FindLecturer':
    case 'LecturerPlan':
    case 'Settings':
      return;
    default: {
      const _exhaustive: never = screen;
      return _exhaustive;
    }
  }
}
