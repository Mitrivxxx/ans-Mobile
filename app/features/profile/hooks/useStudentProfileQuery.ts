import { useCallback, useEffect, useState } from 'react';

import { queryClient } from '../../../core/queryClient/queryClient';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';
import {
  getCachedProfilePhoto,
  setCachedProfilePhoto,
} from '../../../core/scraper/features/profile/profilePhotoSessionCache';
import {
  ProfileService,
  type ProfileSummary,
} from '../../../core/scraper/features/profile/profile.service';

const profileService = new ProfileService();

function resolveSummaryPhoto(
  fresh: ProfileSummary,
  previous: ProfileSummary | undefined
): string {
  const cached = getCachedProfilePhoto();
  if (cached) {
    return cached;
  }

  if (fresh.photo) {
    setCachedProfilePhoto(fresh.photo);
    return fresh.photo;
  }

  return previous?.photo ?? '';
}

function mergeProfileSummary(
  fresh: ProfileSummary,
  previous: ProfileSummary | undefined
): ProfileSummary {
  const photo = resolveSummaryPhoto(fresh, previous);
  return { ...fresh, photo };
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

  useEffect(() => {
    if (query.data?.photo) {
      setCachedProfilePhoto(query.data.photo);
    }
  }, [query.data?.photo]);

  const refreshProfile = useCallback(async () => {
    const previousPhoto = queryClient.getQueryData<ProfileSummary>(
      queryKeys.profile.summary(userKey)
    )?.photo;

    await queryClient.invalidateQueries({
      queryKey: queryKeys.profile.summary(userKey),
    });

    const result = await query.refetch();

    if (result.isSuccess && result.data?.photo !== previousPhoto) {
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
