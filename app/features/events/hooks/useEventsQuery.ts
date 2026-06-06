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
import { isDemoPresentationMode } from '../../../config/env';
import { DEMO_EVENTS } from '../../../demo/demoMockData';

const eventsService = new PublicEventsService();
const DEFAULT_DEPARTMENT = EVENTS_DEPARTMENTS[0];
const DEPARTMENTS_BY_ID = new Map(EVENTS_DEPARTMENTS.map((department) => [department.id, department]));

export function useEventsQuery() {
  const isDemo = isDemoPresentationMode();
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
    () => queryKeys.events.list(userKey, departmentId),
    [userKey, departmentId]
  );

  const query = useQuery<PublicEvent[]>({
    queryKey,
    queryFn: () => eventsService.getEvents(selectedDepartment.path),
    enabled: !isDemo && scrapeEnabled && isDepartmentReady && Boolean(userKey),
    staleTime: EVENTS_STALE_TIME_MS,
    gcTime: EVENTS_STALE_TIME_MS * 2,
    refetchInterval: EVENTS_STALE_TIME_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  if (isDemo) {
    return {
      events: DEMO_EVENTS,
      departments: EVENTS_DEPARTMENTS,
      selectedDepartment,
      isDepartmentReady: true,
      setDepartment: async () => {},
      isInitialLoading: false,
      hasCachedEvents: true,
      isRefreshing: false,
    };
  }

  return {
    events: query.data ?? [],
    departments: EVENTS_DEPARTMENTS,
    selectedDepartment,
    isDepartmentReady,
    setDepartment: async (nextDepartmentId: EventsDepartmentId) => {
      if (!DEPARTMENTS_BY_ID.has(nextDepartmentId)) {
        return;
      }

      if (nextDepartmentId === departmentId) {
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
