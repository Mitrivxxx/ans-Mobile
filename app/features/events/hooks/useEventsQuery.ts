import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  EVENTS_SCRAPE_DELAY_MS,
  EVENTS_STALE_TIME_MS,
} from '../../../core/scraper/events/events.constants';
import {
  PublicEventsService,
  type PublicEvent,
} from '../../../core/scraper/events/events.service';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';

const eventsService = new PublicEventsService();

export function useEventsQuery() {
  const userKey = useQueryUserKey();
  const [scrapeEnabled, setScrapeEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setScrapeEnabled(true), EVENTS_SCRAPE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const queryKey = useMemo(
    () => queryKeys.events.list(userKey),
    [userKey]
  );

  const query = useQuery<PublicEvent[]>({
    queryKey,
    queryFn: () => eventsService.getEvents(),
    enabled: scrapeEnabled && Boolean(userKey),
    staleTime: EVENTS_STALE_TIME_MS,
    gcTime: EVENTS_STALE_TIME_MS * 2,
    refetchInterval: EVENTS_STALE_TIME_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    events: query.data ?? [],
    isInitialLoading: query.isPending && query.data === undefined,
    hasCachedEvents: query.data !== undefined,
    isRefreshing: query.isFetching && query.data !== undefined,
  };
}
