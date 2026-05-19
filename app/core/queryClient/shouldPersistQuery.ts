import type { Query } from '@tanstack/react-query';

export function shouldPersistQuery(query: Query): boolean {
  return query.queryKey[0] === 'studentPlan';
}
