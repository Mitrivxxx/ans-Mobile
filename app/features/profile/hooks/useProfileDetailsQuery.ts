import {
  ProfileService,
  type CompleteProfileData,
} from '../../../core/scraper/features/profile/profile.service';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';

const profileService = new ProfileService();

export function useProfileDetailsQuery() {
  const query = useUserPersistentQuery<CompleteProfileData>({
    queryKey: queryKeys.profile.details,
    queryFn: () => profileService.getProfile(),
    syncOnMount: false,
  });

  return {
    profile: query.data ?? null,
    isInitialLoading: query.isInitialLoading,
    hasCachedProfile: query.hasCachedData,
    forceRefresh: query.forceRefresh,
    isFatalError: query.isFatalError,
  };
}
