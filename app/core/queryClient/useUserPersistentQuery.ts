import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import { useNetworkReconnectEffect } from '../../hooks/useNetworkReconnect';
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
  const syncStatusRef = useRef(syncStatus);
  syncStatusRef.current = syncStatus;

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

  const runSync = useCallback(
    async (options?: { minLoadingMs?: number }) => {
      if (!enabled) {
        return;
      }

      setSyncStatus('loading');
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const startedAt = Date.now();
      try {
        const result = await refetch();
        const minLoadingMs = options?.minLoadingMs ?? 0;
        const elapsed = Date.now() - startedAt;
        if (elapsed < minLoadingMs) {
          await new Promise((resolve) => setTimeout(resolve, minLoadingMs - elapsed));
        }
        if (result.isError) {
          setSyncStatus('error');
          return;
        }
        setSyncStatus('upToDate');
      } catch {
        setSyncStatus('error');
      }
    },
    [enabled, refetch]
  );

  const syncInBackground = useCallback(() => runSync(), [runSync]);

  /** Ręczny pull-to-refresh — baner „Aktualizowanie…” i „Jesteś na bieżąco”. */
  const forceRefresh = useCallback(
    () => runSync({ minLoadingMs: 400 }),
    [runSync]
  );

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

  useNetworkReconnectEffect(() => {
    if (!enabled || !hasCachedData) {
      return;
    }
    if (syncStatusRef.current === 'error' || syncStatusRef.current === 'idle') {
      void syncInBackground();
    }
  });

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
    forceRefresh,
    refetch,
    isFatalError: query.isError && !hasCachedData,
  };
}
