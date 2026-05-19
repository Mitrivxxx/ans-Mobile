import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  clearRememberMe,
  isRememberMeEnabled,
  saveRememberMeCredentials,
} from '../core/auth/rememberMe.storage';
import { loginWithSavedCredentials } from '../core/scraper/auth/ensureAuthenticated';
import { initClient } from '../core/scraper/client/client';

export type BackgroundLoginStatus = 'idle' | 'syncing' | 'error';

type RememberMeAuthContextValue = {
  bootstrapped: boolean;
  rememberMeEnabled: boolean;
  backgroundLoginStatus: BackgroundLoginStatus;
  backgroundLoginError: string | null;
  enableRememberMe: (username: string, password: string) => Promise<void>;
  disableRememberMe: () => Promise<void>;
  dismissBackgroundLoginError: () => void;
  retryBackgroundLogin: () => Promise<void>;
};

const RememberMeAuthContext = createContext<RememberMeAuthContextValue | null>(
  null
);

export function RememberMeAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const rememberMeEnabledAtLaunch = useRef(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [rememberMeEnabled, setRememberMeEnabled] = useState(false);
  const [backgroundLoginStatus, setBackgroundLoginStatus] =
    useState<BackgroundLoginStatus>('idle');
  const [backgroundLoginError, setBackgroundLoginError] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapRememberMe() {
      try {
        const enabled = await isRememberMeEnabled();
        rememberMeEnabledAtLaunch.current = enabled;
        if (!cancelled) {
          setRememberMeEnabled(enabled);
        }
      } finally {
        if (!cancelled) {
          setBootstrapped(true);
        }
      }
    }

    void bootstrapRememberMe();

    return () => {
      cancelled = true;
    };
  }, []);

  const runBackgroundLogin = useCallback(async () => {
    try {
      await initClient();
    } catch {
      /* proceed */
    }

    setBackgroundLoginStatus('syncing');
    setBackgroundLoginError(null);

    const outcome = await loginWithSavedCredentials();

    if (outcome.success) {
      setBackgroundLoginStatus('idle');
      setBackgroundLoginError(null);
      return;
    }

    setBackgroundLoginStatus('error');
    setBackgroundLoginError(
      outcome.errorMessage
        ? `Nie udało się zalogować: ${outcome.errorMessage}`
        : 'Nie udało się zalogować: brak zapisanych danych logowania. Zaloguj się ponownie.'
    );
  }, []);

  useEffect(() => {
    if (!bootstrapped || !rememberMeEnabledAtLaunch.current) {
      return;
    }

    void runBackgroundLogin();
  }, [bootstrapped, runBackgroundLogin]);

  const enableRememberMe = useCallback(
    async (username: string, password: string) => {
      await saveRememberMeCredentials(username, password);
      setRememberMeEnabled(true);
    },
    []
  );

  const disableRememberMe = useCallback(async () => {
    await clearRememberMe();
    setRememberMeEnabled(false);
    setBackgroundLoginStatus('idle');
    setBackgroundLoginError(null);
  }, []);

  const dismissBackgroundLoginError = useCallback(() => {
    setBackgroundLoginStatus('idle');
    setBackgroundLoginError(null);
  }, []);

  const value = useMemo<RememberMeAuthContextValue>(
    () => ({
      bootstrapped,
      rememberMeEnabled,
      backgroundLoginStatus,
      backgroundLoginError,
      enableRememberMe,
      disableRememberMe,
      dismissBackgroundLoginError,
      retryBackgroundLogin: runBackgroundLogin,
    }),
    [
      bootstrapped,
      rememberMeEnabled,
      backgroundLoginStatus,
      backgroundLoginError,
      enableRememberMe,
      disableRememberMe,
      dismissBackgroundLoginError,
      runBackgroundLogin,
    ]
  );

  return (
    <RememberMeAuthContext.Provider value={value}>
      {children}
    </RememberMeAuthContext.Provider>
  );
}

export function useRememberMeAuth(): RememberMeAuthContextValue {
  const context = useContext(RememberMeAuthContext);
  if (!context) {
    throw new Error(
      'useRememberMeAuth must be used within RememberMeAuthProvider'
    );
  }
  return context;
}
