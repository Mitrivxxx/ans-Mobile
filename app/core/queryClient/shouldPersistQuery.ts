import type { Query } from '@tanstack/react-query';

const PERSISTED_ROOT_KEYS = new Set([
  'studentPlan',
  'grades',
  'announcements',
]);

export function shouldPersistQuery(query: Query): boolean {
  const root = query.queryKey[0];
  return typeof root === 'string' && PERSISTED_ROOT_KEYS.has(root);
}
