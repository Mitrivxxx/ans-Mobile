import { useEffect, useState } from 'react';

import { getLastUsername } from '../auth/sessionUser.storage';
import { getSavedCredentials } from '../auth/rememberMe.storage';
import { useAuthSession } from '../../context/AuthSessionContext';

const SESSION_USER_KEY = 'session';

export function useQueryUserKey(): string {
  const { authStatus } = useAuthSession();
  const [userKey, setUserKey] = useState(SESSION_USER_KEY);

  useEffect(() => {
    const canResolveUserScopedCache =
      authStatus === 'authenticated' || authStatus === 'restoring';
    if (!canResolveUserScopedCache) {
      setUserKey(SESSION_USER_KEY);
      return;
    }

    let cancelled = false;

    void (async () => {
      const credentials = await getSavedCredentials();
      const lastUsername = await getLastUsername();
      if (cancelled) {
        return;
      }
      setUserKey(
        credentials?.username ?? lastUsername ?? SESSION_USER_KEY
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  return userKey;
}
