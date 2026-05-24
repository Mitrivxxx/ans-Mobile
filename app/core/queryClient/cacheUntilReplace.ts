import type { UseQueryOptions } from '@tanstack/react-query';

import { isDataEqual } from './isDataEqual';

/** Dane w cache uznawane za aktualne do ręcznego odświeżenia lub udanego scrape. */
export const CACHE_UNTIL_REPLACE_STALE_TIME = Number.POSITIVE_INFINITY;

export function cacheUntilReplaceQueryOptions<TData>(): Pick<
  UseQueryOptions<TData>,
  | 'staleTime'
  | 'gcTime'
  | 'refetchOnMount'
  | 'refetchOnWindowFocus'
  | 'refetchOnReconnect'
  | 'structuralSharing'
> {
  return {
    staleTime: CACHE_UNTIL_REPLACE_STALE_TIME,
    gcTime: CACHE_UNTIL_REPLACE_STALE_TIME,
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
      return isDataEqual(prev, next) ? prev : next;
    },
  };
}
