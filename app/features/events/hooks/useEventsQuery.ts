import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  getStoredEventsDepartmentId,
  setStoredEventsDepartmentId,
} from '../../../core/preferences/eventsDepartment.storage';
import {
  EVENTS_DEPARTMENTS,
  type EventsDepartmentId,
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
const DEFAULT_DEPARTMENT = EVENTS_DEPARTMENTS[0];
const DEPARTMENTS_BY_ID = new Map(EVENTS_DEPARTMENTS.map((department) => [department.id, department]));

export function useEventsQuery() {
  const userKey = useQueryUserKey();
  const [scrapeEnabled, setScrapeEnabled] = useState(false);
  const [departmentId, setDepartmentId] = useState<EventsDepartmentId>(
    DEFAULT_DEPARTMENT.id
  );
  const [isDepartmentReady, setIsDepartmentReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setScrapeEnabled(true), EVENTS_SCRAPE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const storedDepartmentId = await getStoredEventsDepartmentId();
        if (!cancelled && storedDepartmentId && DEPARTMENTS_BY_ID.has(storedDepartmentId)) {
          setDepartmentId(storedDepartmentId);
        }
      } finally {
        if (!cancelled) {
          setIsDepartmentReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDepartment = useMemo(
    () => DEPARTMENTS_BY_ID.get(departmentId) ?? DEFAULT_DEPARTMENT,
    [departmentId]
  );

  const queryKey = useMemo(
    () => queryKeys.events.list(userKey, selectedDepartment.id),
    [userKey, selectedDepartment.id]
  );

  const query = useQuery<PublicEvent[]>({
    queryKey,
    queryFn: () => eventsService.getEvents(selectedDepartment.path),
    enabled: scrapeEnabled && isDepartmentReady && Boolean(userKey),
    staleTime: EVENTS_STALE_TIME_MS,
    gcTime: EVENTS_STALE_TIME_MS * 2,
    refetchInterval: EVENTS_STALE_TIME_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    events: query.data ?? [],
    departments: EVENTS_DEPARTMENTS,
    selectedDepartment,
    isDepartmentReady,
    setDepartment: async (nextDepartmentId: EventsDepartmentId) => {
      if (!DEPARTMENTS_BY_ID.has(nextDepartmentId)) {
        return;
      }

      setDepartmentId(nextDepartmentId);
      await setStoredEventsDepartmentId(nextDepartmentId);
    },
    isInitialLoading:
      !isDepartmentReady || (query.isPending && query.data === undefined),
    hasCachedEvents: query.data !== undefined,
    isRefreshing: query.isFetching && query.data !== undefined,
  };
}
