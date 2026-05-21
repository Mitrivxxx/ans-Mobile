import { getLastUsername } from './sessionUser.storage';
import { getSavedCredentials } from './rememberMe.storage';
import { prefetchUserScraperData } from '../queryClient/prefetchUserScraperData';
import { queryClient } from '../queryClient/queryClient';
import { confirmWdSessionAfterLogin } from '../scraper/auth/sessionValidation';

const CACHE_ROOT_KEYS = new Set([
  'studentPlan',
  'grades',
  'profile',
  'announcements',
]);

async function resolveQueryUserKey(): Promise<string> {
  const credentials = await getSavedCredentials();
  const lastUsername = await getLastUsername();
  return credentials?.username ?? lastUsername ?? 'session';
}

/** Po przywróceniu sesji WD — unieważnij cache i uruchom prefetch (dashboard itd.). */
export async function syncUserDataAfterSessionRestore(): Promise<void> {
  const sessionReady = await confirmWdSessionAfterLogin();
  if (!sessionReady) {
    return;
  }

  const userKey = await resolveQueryUserKey();

  await queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === 'string' &&
      CACHE_ROOT_KEYS.has(query.queryKey[0]),
  });

  prefetchUserScraperData(userKey);
}
