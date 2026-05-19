import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { performSignOut } from '../core/auth/performSignOut';
import {
  clearRememberMe,
  isRememberMeEnabled,
  saveRememberMeCredentials,
} from '../core/auth/rememberMe.storage';
import { hasAppLoginRecord } from '../core/auth/sessionUser.storage';
import {
  formatDegradedCacheMessage,
  getDegradedCacheKinds,
  hasAnyUserCache,
} from '../core/queryClient/hasAnyUserCache';
import {
  hasScraperSession,
  refreshSessionOnForeground,
  registerSessionLostHandler,
  restoreRememberMeSession,
} from '../core/scraper/auth/ensureAuthenticated';
import { initClient } from '../core/scraper/client/client';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

type AuthSessionContextValue = {
  authStatus: AuthStatus;
  rememberMeEnabled: boolean;
  /** Sesja WD niedostępna, ale jest cache danych — tryb offline. */
  sessionDegraded: boolean;
  sessionDegradedMessage: string;
  enableRememberMe: (username: string, password: string) => Promise<void>;
  disableRememberMe: () => Promise<void>;
  markAuthenticated: () => void;
  signOut: () => Promise<void>;
  retrySessionRestore: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

function resolveDegradedState(): {
  status: 'authenticated';
  sessionDegraded: true;
  sessionDegradedMessage: string;
} {
  const kinds = getDegradedCacheKinds();
  return {
    status: 'authenticated',
    sessionDegraded: true,
    sessionDegradedMessage: formatDegradedCacheMessage(kinds),
  };
}

async function resolveRememberMeWithDegradedFallback(): Promise<{
  status: Exclude<AuthStatus, 'unknown'>;
  sessionDegraded: boolean;
  sessionDegradedMessage: string;
}> {
  const restored = await restoreRememberMeSession();

  if (restored.authenticated) {
    return {
      status: 'authenticated',
      sessionDegraded: false,
      sessionDegradedMessage: '',
    };
  }

  if ((await hasAppLoginRecord()) && hasAnyUserCache()) {
    const degraded = resolveDegradedState();
    return {
      status: degraded.status,
      sessionDegraded: degraded.sessionDegraded,
      sessionDegradedMessage: degraded.sessionDegradedMessage,
    };
  }

  return {
    status: 'unauthenticated',
    sessionDegraded: false,
    sessionDegradedMessage: '',
  };
}

async function resolveAuthStatus(): Promise<{
  status: Exclude<AuthStatus, 'unknown'>;
  sessionDegraded: boolean;
  sessionDegradedMessage: string;
  rememberMeEnabled: boolean;
}> {
  try {
    await initClient();
  } catch {
    /* proceed */
  }

  const rememberMe = await isRememberMeEnabled();

  if (rememberMe) {
    const resolved = await resolveRememberMeWithDegradedFallback();
    return {
      ...resolved,
      rememberMeEnabled: true,
    };
  }

  const hadLoginBefore = await hasAppLoginRecord();

  if (hadLoginBefore && (await hasScraperSession())) {
    return {
      status: 'authenticated',
      sessionDegraded: false,
      sessionDegradedMessage: '',
      rememberMeEnabled: false,
    };
  }

  if (hadLoginBefore && hasAnyUserCache()) {
    const degraded = resolveDegradedState();
    return {
      status: degraded.status,
      sessionDegraded: degraded.sessionDegraded,
      sessionDegradedMessage: degraded.sessionDegradedMessage,
      rememberMeEnabled: false,
    };
  }

  return {
    status: 'unauthenticated',
    sessionDegraded: false,
    sessionDegradedMessage: '',
    rememberMeEnabled: false,
  };
}

export function AuthSessionProvider({
  children,
  persistReady,
}: {
  children: React.ReactNode;
  persistReady: boolean;
}) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unknown');
  const [rememberMeEnabled, setRememberMeEnabled] = useState(false);
  const [sessionDegraded, setSessionDegraded] = useState(false);
  const [sessionDegradedMessage, setSessionDegradedMessage] = useState('');

  const applyResolvedSession = useCallback(
    (resolved: Awaited<ReturnType<typeof resolveAuthStatus>>) => {
      setAuthStatus(resolved.status);
      setRememberMeEnabled(resolved.rememberMeEnabled);
      setSessionDegraded(resolved.sessionDegraded);
      setSessionDegradedMessage(resolved.sessionDegradedMessage);
    },
    []
  );

  const restoreSession = useCallback(
    async (options?: { showSplash?: boolean }) => {
      if (options?.showSplash !== false) {
        setAuthStatus('unknown');
      }
      const resolved = await resolveAuthStatus();
      applyResolvedSession(resolved);
    },
    [applyResolvedSession]
  );

  const handleSessionLost = useCallback(() => {
    void (async () => {
      if ((await hasAppLoginRecord()) && hasAnyUserCache()) {
        const degraded = resolveDegradedState();
        setAuthStatus(degraded.status);
        setSessionDegraded(true);
        setSessionDegradedMessage(degraded.sessionDegradedMessage);
        return;
      }

      setAuthStatus('unauthenticated');
      setSessionDegraded(false);
      setSessionDegradedMessage('');
    })();
  }, []);

  useEffect(() => {
    return registerSessionLostHandler(handleSessionLost);
  }, [handleSessionLost]);

  useEffect(() => {
    if (!persistReady) {
      return;
    }

    void restoreSession({ showSplash: true });
  }, [persistReady, restoreSession]);

  useEffect(() => {
    if (!persistReady) {
      return;
    }

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        return;
      }

      void (async () => {
        const rememberMe = await isRememberMeEnabled();

        if (rememberMe) {
          const refreshed = await refreshSessionOnForeground();

          if (refreshed.authenticated) {
            setAuthStatus('authenticated');
            setSessionDegraded(refreshed.sessionDegraded);
            setSessionDegradedMessage('');
            setRememberMeEnabled(true);
            return;
          }

          if ((await hasAppLoginRecord()) && hasAnyUserCache()) {
            const degraded = resolveDegradedState();
            setAuthStatus(degraded.status);
            setSessionDegraded(true);
            setSessionDegradedMessage(degraded.sessionDegradedMessage);
            setRememberMeEnabled(true);
            return;
          }

          setAuthStatus('unauthenticated');
          setSessionDegraded(false);
          setSessionDegradedMessage('');
          return;
        }

        const hadLoginBefore = await hasAppLoginRecord();

        if (hadLoginBefore && (await hasScraperSession())) {
          setAuthStatus('authenticated');
          setSessionDegraded(false);
          setSessionDegradedMessage('');
          return;
        }

        if (hadLoginBefore && hasAnyUserCache()) {
          const degraded = resolveDegradedState();
          setAuthStatus(degraded.status);
          setSessionDegraded(true);
          setSessionDegradedMessage(degraded.sessionDegradedMessage);
          return;
        }

        setAuthStatus('unauthenticated');
        setSessionDegraded(false);
        setSessionDegradedMessage('');
      })();
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [persistReady]);

  const markAuthenticated = useCallback(() => {
    setAuthStatus('authenticated');
    setSessionDegraded(false);
    setSessionDegradedMessage('');
  }, []);

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
  }, []);

  const signOut = useCallback(async () => {
    await performSignOut();
    setAuthStatus('unauthenticated');
    setSessionDegraded(false);
    setSessionDegradedMessage('');
    setRememberMeEnabled(false);
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      authStatus,
      rememberMeEnabled,
      sessionDegraded,
      sessionDegradedMessage,
      enableRememberMe,
      disableRememberMe,
      markAuthenticated,
      signOut,
      retrySessionRestore: () => restoreSession({ showSplash: false }),
    }),
    [
      authStatus,
      rememberMeEnabled,
      sessionDegraded,
      sessionDegradedMessage,
      enableRememberMe,
      disableRememberMe,
      markAuthenticated,
      signOut,
      restoreSession,
    ]
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider');
  }
  return context;
}
