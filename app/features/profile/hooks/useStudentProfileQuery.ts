import { useCallback, useEffect, useState } from 'react';

import { queryClient } from '../../../core/queryClient/queryClient';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';
import {
  clearProfilePhotoSessionCacheIfUserMismatch,
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
import { isDemoPresentationMode } from '../../../config/env';
import { DEMO_PROFILE_SUMMARY } from '../../../demo/demoMockData';

const profileService = new ProfileService();

export function useStudentProfileQuery() {
  const isDemo = isDemoPresentationMode();
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
    enabled: !isDemo,
    syncOnMount: false,
  });

  const [photo, setPhoto] = useState('');

  useEffect(() => {
    const key = queryKeys.profile.summary(userKey);
    const data = queryClient.getQueryData<ProfileSummary>(key);
    const sanitized = sanitizePersistedProfileSummary(data, userKey);
    if (sanitized && sanitized !== data) {
      queryClient.setQueryData(key, sanitized);
    }
  }, [userKey]);

  useEffect(() => {
    clearProfilePhotoSessionCacheIfUserMismatch(userKey);
    setPhoto(getCachedProfilePhoto(userKey) ?? '');
    void hydrateProfilePhotoSessionFromDisk(userKey).then(() => {
      setPhoto(getCachedProfilePhoto(userKey) ?? '');
    });
  }, [userKey]);

  useEffect(() => {
    setPhoto(getCachedProfilePhoto(userKey) ?? '');
  }, [summary, photoRevision, userKey]);

  const refreshProfile = useCallback(async () => {
    const previousPhoto = getCachedProfilePhoto(userKey);

    await queryClient.invalidateQueries({
      queryKey: queryKeys.profile.summary(userKey),
    });

    const result = await refetch();

    if (result.isSuccess && profilePhotoChangedSince(previousPhoto, userKey)) {
      setPhotoRevision((revision) => revision + 1);
    }

    return result;
  }, [refetch, userKey]);

  if (isDemo) {
    return {
      summary: DEMO_PROFILE_SUMMARY,
      photo: '',
      syncStatus: 'upToDate' as const,
      isInitialLoading: false,
      hasCachedSummary: true,
      refetch: async () => {},
      forceRefresh: async () => {},
      isFatalError: false,
      photoRevision: 0,
    };
  }

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
