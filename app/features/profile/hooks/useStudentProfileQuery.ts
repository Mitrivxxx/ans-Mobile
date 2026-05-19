import { useCallback, useState } from 'react';

import { queryClient } from '../../../core/queryClient/queryClient';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';
import {
  ProfileService,
  type ProfileSummary,
} from '../../../core/scraper/features/profile/profile.service';

const profileService = new ProfileService();

function mergeProfileSummary(
  fresh: ProfileSummary,
  previous: ProfileSummary | undefined
): ProfileSummary {
  if (fresh.photo || !previous?.photo) {
    return fresh;
  }

  return { ...fresh, photo: previous.photo };
}

export function useStudentProfileQuery() {
  const userKey = useQueryUserKey();
  const [photoRevision, setPhotoRevision] = useState(0);

  const query = useUserPersistentQuery<ProfileSummary>({
    queryKey: queryKeys.profile.summary,
    queryFn: async () => {
      const fresh = await profileService.getProfileSummary();
      const previous = queryClient.getQueryData<ProfileSummary>(
        queryKeys.profile.summary(userKey)
      );
      return mergeProfileSummary(fresh, previous);
    },
    syncOnMount: true,
  });

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.profile.summary(userKey),
    });

    const result = await query.refetch();

    if (result.isSuccess) {
      setPhotoRevision((revision) => revision + 1);
    }

    return result;
  }, [query, userKey]);

  return {
    summary: query.data ?? null,
    syncStatus: query.syncStatus,
    isInitialLoading: query.isInitialLoading,
    hasCachedSummary: query.hasCachedData,
    refetch: refreshProfile,
    forceRefresh: query.forceRefresh,
    isFatalError: query.isFatalError,
    photoRevision,
  };
}
