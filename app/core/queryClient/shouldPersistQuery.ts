import type { Query } from '@tanstack/react-query';

const PERSISTED_ROOT_KEYS = new Set([
  'studentPlan',
  'grades',
  'announcements',
]);

function isPersistedRootQuery(query: Query): boolean {
  const root = query.queryKey[0];
  return typeof root === 'string' && PERSISTED_ROOT_KEYS.has(root);
}

export function shouldPersistQuery(query: Query): boolean {
  return isPersistedRootQuery(query);
}

/**
 * Tylko udane zapytania z danymi — nigdy pending/fetching/error.
 * Zapobiega błędom persist: „dehydrated as pending ended up rejecting”.
 */
export function shouldDehydratePersistedQuery(query: Query): boolean {
  if (!isPersistedRootQuery(query)) {
    return false;
  }

  if (query.state.status !== 'success' || query.state.data === undefined) {
    return false;
  }

  return true;
}
