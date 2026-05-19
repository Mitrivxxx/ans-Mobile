import {
  ProfileService,
  type ProfileSummary,
} from '../../../core/scraper/features/profile/profile.service';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';

const profileService = new ProfileService();

export function useStudentProfileQuery() {
  const query = useUserPersistentQuery<ProfileSummary>({
    queryKey: queryKeys.profile.summary,
    queryFn: () => profileService.getProfileSummary(),
    syncOnMount: true,
  });

  return {
    summary: query.data ?? null,
    syncStatus: query.syncStatus,
    isInitialLoading: query.isInitialLoading,
    hasCachedSummary: query.hasCachedData,
    refetch: query.refetch,
    isFatalError: query.isFatalError,
  };
}
