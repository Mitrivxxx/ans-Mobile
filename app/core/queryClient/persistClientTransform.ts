import type { DehydratedState } from '@tanstack/query-core';
import type { PersistedClient } from '@tanstack/react-query-persist-client';

import { isWeekInDefaultPrefetchWindow } from './planWeekWindow';
import { sanitizePersistedProfileSummary } from '../scraper/features/profile/profileSummaryPhoto';
import type { ProfileSummary } from '../scraper/features/profile/profile.service';

function isStudentPlanWeekLessonsQueryKey(queryKey: unknown): boolean {
  return (
    Array.isArray(queryKey) &&
    queryKey[0] === 'studentPlan' &&
    queryKey[2] === 'weekLessons' &&
    typeof queryKey[3] === 'string'
  );
}

/** Usuwa z dysku tygodnie planu poza 5-tygodniowym oknem prefetch. */
function pruneStalePlanWeeksFromDehydratedState(
  clientState: DehydratedState
): DehydratedState {
  if (!clientState.queries?.length) {
    return clientState;
  }

  const queries = clientState.queries.filter((entry) => {
    if (!isStudentPlanWeekLessonsQueryKey(entry.queryKey)) {
      return true;
    }
    const weekMondayKey = entry.queryKey[3] as string;
    return isWeekInDefaultPrefetchWindow(weekMondayKey);
  });

  return { ...clientState, queries };
}

function isProfileSummaryQueryKey(queryKey: unknown): boolean {
  return (
    Array.isArray(queryKey) &&
    queryKey[0] === 'profile' &&
    queryKey[2] === 'summary'
  );
}

export function stripProfilePhotoFromDehydratedState(
  clientState: DehydratedState
): DehydratedState {
  if (!clientState.queries?.length) {
    return clientState;
  }

  const queries = clientState.queries.map((entry) => {
    if (!isProfileSummaryQueryKey(entry.queryKey)) {
      return entry;
    }

    const data = entry.state.data as ProfileSummary | undefined;
    const userKey =
      typeof entry.queryKey[1] === 'string' ? entry.queryKey[1] : undefined;
    const sanitized = sanitizePersistedProfileSummary(data, userKey);
    if (!sanitized || sanitized === data) {
      return entry;
    }

    return {
      ...entry,
      state: {
        ...entry.state,
        data: sanitized,
      },
    };
  });

  return { ...clientState, queries };
}

export function transformPersistedClientForStorage(
  client: PersistedClient
): PersistedClient {
  let clientState = stripProfilePhotoFromDehydratedState(client.clientState);
  clientState = pruneStalePlanWeeksFromDehydratedState(clientState);
  return {
    ...client,
    clientState,
  };
}

export function transformPersistedClientAfterRestore(
  client: PersistedClient
): PersistedClient {
  return transformPersistedClientForStorage(client);
}
