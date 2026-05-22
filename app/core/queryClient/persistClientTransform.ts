import type { DehydratedState } from '@tanstack/query-core';
import type { PersistedClient } from '@tanstack/react-query-persist-client';

import { sanitizePersistedProfileSummary } from '../scraper/features/profile/profileSummaryPhoto';
import type { ProfileSummary } from '../scraper/features/profile/profile.service';

function isProfileSummaryQueryKey(queryKey: unknown): boolean {
  return (
    Array.isArray(queryKey) &&
    queryKey[0] === 'profile' &&
    queryKey[2] === 'summary'
  );
}

/** Ostatnia linia obrony: nigdy nie zapisuj base64 w podsumowaniu profilu. */
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
    const sanitized = sanitizePersistedProfileSummary(data);
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
  return {
    ...client,
    clientState: stripProfilePhotoFromDehydratedState(client.clientState),
  };
}

export function transformPersistedClientAfterRestore(
  client: PersistedClient
): PersistedClient {
  return transformPersistedClientForStorage(client);
}
