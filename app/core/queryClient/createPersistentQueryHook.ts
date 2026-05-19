import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import { isDataEqual } from './isDataEqual';
import type { SyncStatus } from './syncTypes';

type PersistentQueryConfig<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  equals?: (a: TData, b: TData) => boolean;
  syncOnMount?: boolean;
};

export function createPersistentQueryHook<TData>({
  queryKey,
  queryFn,
  equals = isDataEqual,
  syncOnMount = false,
}: PersistentQueryConfig<TData>) {
  return function usePersistentQuery() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

    const query = useQuery<TData>({
      queryKey,
      queryFn,
      staleTime: Number.POSITIVE_INFINITY,
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

    const { refetch } = query;

    const syncInBackground = useCallback(async () => {
      setSyncStatus('loading');
      const result = await refetch();
      if (result.isError) {
        setSyncStatus('error');
        return;
      }
      setSyncStatus('upToDate');
    }, [refetch]);

    useFocusEffect(
      useCallback(() => {
        void syncInBackground();
      }, [syncInBackground])
    );

    useEffect(() => {
      if (!syncOnMount) {
        return;
      }
      void syncInBackground();
    }, [syncInBackground, syncOnMount]);

    const hasCachedData = query.data !== undefined;

    return {
      data: query.data,
      syncStatus,
      isInitialLoading: query.isPending && !hasCachedData,
      hasCachedData,
      refetch,
      isFatalError: query.isError && !hasCachedData,
    };
  };
}
