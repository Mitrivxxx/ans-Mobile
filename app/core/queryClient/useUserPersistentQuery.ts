import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import { isDataEqual } from './isDataEqual';
import { PERSISTENT_QUERY_STALE_TIME_MS } from './persistentQueryConfig';
import { useQueryUserKey } from './useQueryUserKey';
import type { SyncStatus } from './syncTypes';

type UserPersistentQueryConfig<TData> = {
  queryKey: (userKey: string) => QueryKey;
  queryFn: () => Promise<TData>;
  equals?: (a: TData, b: TData) => boolean;
  enabled?: boolean;
  syncOnMount?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
};

export function useUserPersistentQuery<TData>({
  queryKey,
  queryFn,
  equals = isDataEqual,
  enabled = true,
  syncOnMount = false,
  staleTime = PERSISTENT_QUERY_STALE_TIME_MS,
  refetchInterval = false,
}: UserPersistentQueryConfig<TData>) {
  const userKey = useQueryUserKey();
  const resolvedQueryKey = useMemo(
    () => queryKey(userKey),
    [queryKey, userKey]
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const query = useQuery<TData>({
    queryKey: resolvedQueryKey,
    queryFn,
    enabled,
    staleTime,
    refetchInterval: refetchInterval === false ? false : refetchInterval,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    structuralSharing: (previousData, newData) => {
      const prev = previousData as TData | undefined;
      const next = newData as TData | undefined;
      if (prev === undefined) {
        return next;
      }
      if (next === undefined) {
        return prev;
      }
      return equals(prev, next) ? prev : next;
    },
  });

  const { refetch, isStale, data } = query;
  const hasCachedData = data !== undefined;

  const syncInBackground = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setSyncStatus('loading');
    const result = await refetch();
    if (result.isError) {
      setSyncStatus('error');
      return;
    }
    setSyncStatus('upToDate');
  }, [enabled, refetch]);

  const syncIfStale = useCallback(async () => {
    if (!enabled) {
      return;
    }
    if (hasCachedData && !isStale) {
      setSyncStatus('upToDate');
      return;
    }
    await syncInBackground();
  }, [enabled, hasCachedData, isStale, syncInBackground]);

  useFocusEffect(
    useCallback(() => {
      void syncIfStale();
    }, [syncIfStale])
  );

  useEffect(() => {
    if (!syncOnMount || !enabled) {
      return;
    }
    void syncIfStale();
  }, [enabled, syncIfStale, syncOnMount]);

  return {
    data: query.data,
    syncStatus,
    isInitialLoading: query.isPending && !hasCachedData,
    hasCachedData,
    refresh: syncInBackground,
    refetch,
    isFatalError: query.isError && !hasCachedData,
  };
}
