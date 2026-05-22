import { useEffect } from 'react';

import {
  getSavedCredentials,
  isRememberMeEnabled,
} from '../../../core/auth/rememberMe.storage';

type Setters = {
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  setRememberMe: (value: boolean) => void;
};

/**
 * Po starcie ekranu logowania: flaga „Zapamiętaj mnie” + login/hasło z Keychain
 * (tylko gdy użytkownik wcześniej zapisał dane po udanym logowaniu).
 */
export function useLoginStoredCredentials({
  setUsername,
  setPassword,
  setRememberMe,
}: Setters): void {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [enabled, credentials] = await Promise.all([
        isRememberMeEnabled(),
        getSavedCredentials(),
      ]);

      if (cancelled) {
        return;
      }

      setRememberMe(enabled);

      if (credentials) {
        setUsername(credentials.username);
        setPassword(credentials.password);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUsername, setPassword, setRememberMe]);
}
