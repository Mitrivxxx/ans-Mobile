import { queryClient } from './queryClient';
import { queryPersister } from './queryPersister';

/** Czyści cache React Query bez wylogowania z WD. */
export async function clearQueryCacheOnly(): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();
  await queryPersister.removeClient();
}
