import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../core/queryClient/queryKeys';
import type { SyncStatus } from '../../../core/queryClient/syncTypes';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import {
  FinanceService,
  type StudentFee,
} from '../../../core/scraper/features/finance/finance.service';

const financeService = new FinanceService();

/** Opłaty — bez persystencji; baner sync jak w harmonogramie. */
export function useStudentFeesQuery() {
  const userKey = useQueryUserKey();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const query = useQuery<StudentFee[]>({
    queryKey: queryKeys.finance.fees(userKey),
    queryFn: () => financeService.getStudentFees(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { refetch, isLoading, isFetching, isError, error, data } = query;
  const fees = data ?? [];

  const runSync = useCallback(
    async (options?: { minLoadingMs?: number }) => {
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
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingMs - elapsed)
          );
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
    [refetch]
  );

  const forceRefresh = useCallback(
    () => runSync({ minLoadingMs: 400 }),
    [runSync]
  );

  useFocusEffect(
    useCallback(() => {
      void runSync({ minLoadingMs: 400 });
    }, [runSync])
  );

  return {
    fees,
    isLoading: isLoading && fees.length === 0,
    isFetching,
    isError,
    error,
    refetch,
    syncStatus,
    forceRefresh,
  };
}
