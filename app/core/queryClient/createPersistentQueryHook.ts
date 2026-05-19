import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import { isDataEqual } from './isDataEqual';
import { PERSISTENT_QUERY_STALE_TIME_MS } from './persistentQueryConfig';
import type { SyncStatus } from './syncTypes';

type PersistentQueryConfig<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  equals?: (a: TData, b: TData) => boolean;
  syncOnMount?: boolean;
  staleTime?: number;
  /** false = wyłączony; domyślnie ten sam co staleTime. */
  refetchInterval?: number | false;
};

export function createPersistentQueryHook<TData>({
  queryKey,
  queryFn,
  equals = isDataEqual,
  syncOnMount = false,
  staleTime = PERSISTENT_QUERY_STALE_TIME_MS,
  refetchInterval = false,
}: PersistentQueryConfig<TData>) {
  return function usePersistentQuery() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

    const query = useQuery<TData>({
      queryKey,
      queryFn,
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
      setSyncStatus('loading');
      const result = await refetch();
      if (result.isError) {
        setSyncStatus('error');
        return;
      }
      setSyncStatus('upToDate');
    }, [refetch]);

    const syncIfStale = useCallback(async () => {
      if (hasCachedData && !isStale) {
        setSyncStatus('upToDate');
        return;
      }
      await syncInBackground();
    }, [hasCachedData, isStale, syncInBackground]);

    useFocusEffect(
      useCallback(() => {
        void syncIfStale();
      }, [syncIfStale])
    );

    useEffect(() => {
      if (!syncOnMount) {
        return;
      }
      void syncIfStale();
    }, [syncIfStale, syncOnMount]);

    return {
      data: query.data,
      syncStatus,
      isInitialLoading: query.isPending && !hasCachedData,
      hasCachedData,
      /** Wymusza scrape i aktualizuje syncStatus (PTR, przycisk odśwież). */
      refresh: syncInBackground,
      refetch,
      isFatalError: query.isError && !hasCachedData,
    };
  };
}
