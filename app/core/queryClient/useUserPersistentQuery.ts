import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import { useNetworkReconnectEffect } from '../../hooks/useNetworkReconnect';
import { cacheUntilReplaceQueryOptions } from './cacheUntilReplace';
import { useQueryUserKey } from './useQueryUserKey';
import type { SyncStatus } from './syncTypes';

type UserPersistentQueryConfig<TData> = {
  queryKey: (userKey: string) => QueryKey;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  syncOnMount?: boolean;
  refetchInterval?: number | false;
};

export function useUserPersistentQuery<TData>({
  queryKey,
  queryFn,
  enabled = true,
  syncOnMount = false,
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
    refetchInterval: refetchInterval === false ? false : refetchInterval,
    ...cacheUntilReplaceQueryOptions<TData>(),
  });

  const { refetch, data } = query;
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

  const syncIfNoCache = useCallback(async () => {
    if (!enabled) {
      return;
    }
    if (hasCachedData) {
      setSyncStatus('upToDate');
      return;
    }
    await syncInBackground();
  }, [enabled, hasCachedData, syncInBackground]);

  useFocusEffect(
    useCallback(() => {
      void syncIfNoCache();
    }, [syncIfNoCache])
  );

  useNetworkReconnectEffect(() => {
    if (!enabled || !hasCachedData) {
      return;
    }
    if (syncStatusRef.current === 'error') {
      void syncInBackground();
    }
  });

  useEffect(() => {
    if (!syncOnMount || !enabled) {
      return;
    }
    void syncIfNoCache();
  }, [enabled, syncIfNoCache, syncOnMount]);

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
