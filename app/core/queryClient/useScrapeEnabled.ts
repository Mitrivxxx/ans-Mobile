import { useAuthSession } from '../../context/AuthSessionContext';
import { isDemoPresentationMode } from '../../config/env';

/** Scrape WD dozwolony dopiero po potwierdzonej sesji (nie w trakcie „Logowanie…”). */
export function useScrapeEnabled(): boolean {
  const { authStatus, isRestoringSession } = useAuthSession();

  if (isDemoPresentationMode()) {
    return false;
  }

  return authStatus === 'authenticated' && !isRestoringSession;
}
