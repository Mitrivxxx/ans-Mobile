import { queryClient } from './queryClient';
import { queryPersister } from './queryPersister';

export async function clearQueryCacheOnly(): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();
  await queryPersister.removeClient();
}
