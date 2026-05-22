import { useCallback, useEffect, useState } from 'react';

import { queryClient } from '../../../core/queryClient/queryClient';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';
import {
  getCachedProfilePhoto,
} from '../../../core/scraper/features/profile/profilePhotoSessionCache';
import {
  hydrateProfilePhotoSessionFromDisk,
  profilePhotoChangedSince,
  profileSummaryForQueryCache,
  sanitizePersistedProfileSummary,
} from '../../../core/scraper/features/profile/profileSummaryPhoto';
import {
  ProfileService,
  type ProfileSummary,
} from '../../../core/scraper/features/profile/profile.service';

const profileService = new ProfileService();

export function useStudentProfileQuery() {
  const userKey = useQueryUserKey();
  const [photoRevision, setPhotoRevision] = useState(0);

  const {
    data: summary,
    refetch,
    ...queryRest
  } = useUserPersistentQuery<ProfileSummary>({
    queryKey: queryKeys.profile.summary,
    queryFn: async () => {
      const fresh = await profileService.getProfileSummary();
      return profileSummaryForQueryCache(fresh, userKey);
    },
    syncOnMount: false,
  });

  const [photo, setPhoto] = useState(() => getCachedProfilePhoto() ?? '');

  useEffect(() => {
    const key = queryKeys.profile.summary(userKey);
    const data = queryClient.getQueryData<ProfileSummary>(key);
    const sanitized = sanitizePersistedProfileSummary(data);
    if (sanitized && sanitized !== data) {
      queryClient.setQueryData(key, sanitized);
    }
  }, [userKey]);

  useEffect(() => {
    void hydrateProfilePhotoSessionFromDisk(userKey).then(() => {
      setPhoto(getCachedProfilePhoto() ?? '');
    });
  }, [userKey]);

  useEffect(() => {
    setPhoto(getCachedProfilePhoto() ?? '');
  }, [summary, photoRevision]);

  const refreshProfile = useCallback(async () => {
    const previousPhoto = getCachedProfilePhoto();

    await queryClient.invalidateQueries({
      queryKey: queryKeys.profile.summary(userKey),
    });

    const result = await refetch();

    if (result.isSuccess && profilePhotoChangedSince(previousPhoto)) {
      setPhotoRevision((revision) => revision + 1);
    }

    return result;
  }, [refetch, userKey]);

  return {
    summary: summary ?? null,
    photo,
    syncStatus: queryRest.syncStatus,
    isInitialLoading: queryRest.isInitialLoading,
    hasCachedSummary: queryRest.hasCachedData,
    refetch: refreshProfile,
    forceRefresh: queryRest.forceRefresh,
    isFatalError: queryRest.isFatalError,
    photoRevision,
  };
}
