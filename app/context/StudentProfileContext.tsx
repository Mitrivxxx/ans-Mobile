import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import { queryClient } from '../core/queryClient/queryClient';
import { queryKeys } from '../core/queryClient/queryKeys';
import { useQueryUserKey } from '../core/queryClient/useQueryUserKey';
import type { ProfileSummary } from '../core/scraper/features/profile/profile.service';
import { useStudentProfileQuery } from '../features/profile/hooks/useStudentProfileQuery';

type StudentProfileContextValue = {
  summary: ProfileSummary | null;
  /** URI zdjęcia — wyłącznie profilePhotoSessionCache (nie w React Query). */
  photo: string;
  loading: boolean;
  photoRevision: number;
  refetch: () => Promise<unknown>;
  clear: () => void;
};

const StudentProfileContext = createContext<StudentProfileContextValue | null>(
  null
);

export function StudentProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userKey = useQueryUserKey();
  const {
    summary,
    photo,
    isInitialLoading,
    hasCachedSummary,
    refetch: refreshProfile,
    photoRevision,
  } = useStudentProfileQuery();

  const clear = useCallback(() => {
    queryClient.removeQueries({
      queryKey: queryKeys.profile.summary(userKey),
    });
  }, [userKey]);

  const refetch = useCallback(async () => {
    return refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      summary,
      photo,
      loading: isInitialLoading && !hasCachedSummary,
      photoRevision,
      refetch,
      clear,
    }),
    [
      summary,
      photo,
      isInitialLoading,
      hasCachedSummary,
      photoRevision,
      refetch,
      clear,
    ]
  );

  return (
    <StudentProfileContext.Provider value={value}>
      {children}
    </StudentProfileContext.Provider>
  );
}

export function useStudentProfile() {
  const context = useContext(StudentProfileContext);
  if (!context) {
    throw new Error(
      'useStudentProfile must be used within StudentProfileProvider'
    );
  }
  return context;
}
