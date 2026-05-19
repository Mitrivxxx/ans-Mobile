import { queryClient } from './queryClient';
import { queryPersister } from './queryPersister';

/** Czyści dane poprzedniego użytkownika (React Query + persist) przy wylogowaniu. */
export async function clearUserAppCache(): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();
  await queryPersister.removeClient();
}
