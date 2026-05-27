import type { Query } from '@tanstack/react-query';

import { isWeekInDefaultPrefetchWindow } from './planWeekWindow';

/**
 * Zapytania zapisywane na dysk (offline / degraded).
 * Bez: partial, detail, semester, weekLessons poza 3-miesięcznym oknem.
 */
const OFFLINE_QUERY_SEGMENTS = {
  studentPlan: new Set(['lessons', 'weekLessons']),
  grades: new Set(['index']),
  announcements: new Set(['list']),
  profile: new Set(['summary', 'details']),
  events: new Set(['list']),
} as const;

type OfflineRoot = keyof typeof OFFLINE_QUERY_SEGMENTS;

function isOfflineRoot(root: unknown): root is OfflineRoot {
  return typeof root === 'string' && root in OFFLINE_QUERY_SEGMENTS;
}

function isPrefetchWindowWeekLessonsKey(queryKey: readonly unknown[]): boolean {
  if (queryKey.length < 4) {
    return false;
  }
  const weekMondayKey = queryKey[3];
  if (typeof weekMondayKey !== 'string') {
    return false;
  }
  return isWeekInDefaultPrefetchWindow(weekMondayKey);
}

/** Czy zapytanie wchodzi do małego „offline bundle” (AsyncStorage). */
export function isOfflinePersistQuery(query: Query): boolean {
  const key = query.queryKey;
  if (!Array.isArray(key) || key.length < 3) {
    return false;
  }

  const root = key[0];
  const segment = key[2];

  if (!isOfflineRoot(root) || typeof segment !== 'string') {
    return false;
  }

  if (!OFFLINE_QUERY_SEGMENTS[root].has(segment)) {
    return false;
  }

  if (root === 'studentPlan' && segment === 'weekLessons') {
    return isPrefetchWindowWeekLessonsKey(key);
  }

  return true;
}

/** Ta sama logika co {@link isOfflinePersistQuery}. */
export function shouldPersistQuery(query: Query): boolean {
  return isOfflinePersistQuery(query);
}

/**
 * Tylko udane zapytania z whitelisty — nigdy pending/fetching/error.
 * Zapobiega błędom persist: „dehydrated as pending ended up rejecting”.
 */
export function shouldDehydratePersistedQuery(query: Query): boolean {
  if (!isOfflinePersistQuery(query)) {
    return false;
  }

  if (query.state.status !== 'success' || query.state.data === undefined) {
    return false;
  }

  return true;
}
