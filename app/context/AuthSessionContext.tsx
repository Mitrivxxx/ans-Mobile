import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  canEnterOfflineDegradedSession,
  isDeviceOffline,
} from '../core/auth/authSessionPolicy';
import {
  clearEphemeralSession,
  isEphemeralSessionActive,
  setEphemeralSessionActive,
} from '../core/auth/ephemeralSession';
import { performSignOut } from '../core/auth/performSignOut';
import { syncUserDataAfterSessionRestore } from '../core/auth/syncUserDataAfterSessionRestore';
import {
  clearRememberMe,
  isRememberMeEnabled,
  saveRememberMeCredentials,
} from '../core/auth/rememberMe.storage';
import {
  formatDegradedCacheMessage,
  getDegradedCacheKinds,
} from '../core/queryClient/hasAnyUserCache';
import {
  hasScraperSession,
  refreshSessionOnForeground,
  registerSessionLostHandler,
  restoreRememberMeSession,
} from '../core/scraper/auth/ensureAuthenticated';
import { clearSession } from '../core/scraper/auth/session.store';
import { probeWdSessionAlive } from '../core/scraper/auth/sessionValidation';
import { onNetworkReconnect } from '../core/network/networkSubscription';
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
  markAuthenticated: (options?: { ephemeral?: boolean }) => void;
  signOut: () => Promise<void>;
  retrySessionRestore: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

function resolveDegradedState(options?: { offline?: boolean }): {
  status: 'authenticated';
  sessionDegraded: true;
  sessionDegradedMessage: string;
} {
  const kinds = getDegradedCacheKinds();
  return {
    status: 'authenticated',
    sessionDegraded: true,
    sessionDegradedMessage: formatDegradedCacheMessage(kinds, options),
  };
}

async function resolveRememberMeDegradedSession(options?: {
  offline?: boolean;
}): Promise<{
  status: 'authenticated';
  sessionDegraded: true;
  sessionDegradedMessage: string;
} | null> {
  if (!(await canEnterOfflineDegradedSession(true))) {
    return null;
  }
  return resolveDegradedState(options);
}

async function resolveRememberMeWithDegradedFallback(): Promise<{
  status: Exclude<AuthStatus, 'unknown'>;
  sessionDegraded: boolean;
  sessionDegradedMessage: string;
}> {
  const offline = await isDeviceOffline();

  if (offline) {
    const degraded = await resolveRememberMeDegradedSession({ offline: true });
    if (degraded) {
      return degraded;
    }
    return {
      status: 'unauthenticated',
      sessionDegraded: false,
      sessionDegradedMessage: '',
    };
  }

  const restored = await restoreRememberMeSession();

  if (restored.authenticated) {
    return {
      status: 'authenticated',
      sessionDegraded: false,
      sessionDegradedMessage: '',
    };
  }

  const degraded = await resolveRememberMeDegradedSession();
  if (degraded) {
    return degraded;
  }

  return {
    status: 'unauthenticated',
    sessionDegraded: false,
    sessionDegradedMessage: '',
  };
}

async function hasLiveScraperSession(): Promise<boolean> {
  if (!(await hasScraperSession())) {
    return false;
  }

  try {
    return await probeWdSessionAlive();
  } catch {
    return false;
  }
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

  if (!isEphemeralSessionActive()) {
    if (await hasScraperSession()) {
      await clearSession();
    }
  } else if (await hasLiveScraperSession()) {
    return {
      status: 'authenticated',
      sessionDegraded: false,
      sessionDegradedMessage: '',
      rememberMeEnabled: false,
    };
  }

  if (await hasScraperSession()) {
    await clearSession();
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
  const sessionResolveRunIdRef = useRef(0);
  const authStatusRef = useRef(authStatus);
  authStatusRef.current = authStatus;

  const bumpSessionResolve = useCallback(() => {
    sessionResolveRunIdRef.current += 1;
  }, []);

  const isSessionResolveCurrent = useCallback(
    (runId: number) => runId === sessionResolveRunIdRef.current,
    []
  );

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
      const runId = ++sessionResolveRunIdRef.current;
      if (options?.showSplash !== false) {
        setAuthStatus('unknown');
      }
      const resolved = await resolveAuthStatus();
      if (isSessionResolveCurrent(runId)) {
        applyResolvedSession(resolved);
      }
    },
    [applyResolvedSession, isSessionResolveCurrent]
  );

  const handleSessionLost = useCallback(() => {
    const runId = ++sessionResolveRunIdRef.current;

    void (async () => {
      const rememberMe = await isRememberMeEnabled();
      if (rememberMe) {
        const offline = await isDeviceOffline();
        const degraded = await resolveRememberMeDegradedSession({
          offline,
        });
        if (!isSessionResolveCurrent(runId)) {
          return;
        }
        if (degraded) {
          setAuthStatus(degraded.status);
          setSessionDegraded(true);
          setSessionDegradedMessage(degraded.sessionDegradedMessage);
          return;
        }
      }

      if (!isSessionResolveCurrent(runId)) {
        return;
      }

      setAuthStatus('unauthenticated');
      setSessionDegraded(false);
      setSessionDegradedMessage('');
    })();
  }, [isSessionResolveCurrent]);

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

    return onNetworkReconnect(() => {
      if (authStatusRef.current !== 'authenticated') {
        return;
      }
      void restoreSession({ showSplash: false });
    });
  }, [persistReady, restoreSession]);

  useEffect(() => {
    if (!persistReady) {
      return;
    }

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        bumpSessionResolve();
        return;
      }
      if (nextState !== 'active') {
        return;
      }

      const runId = ++sessionResolveRunIdRef.current;

      void (async () => {
        const rememberMe = await isRememberMeEnabled();

        if (rememberMe) {
          const offline = await isDeviceOffline();
          if (offline) {
            const degraded = await resolveRememberMeDegradedSession({
              offline: true,
            });
            if (!isSessionResolveCurrent(runId)) {
              return;
            }
            if (degraded) {
              setAuthStatus(degraded.status);
              setSessionDegraded(true);
              setSessionDegradedMessage(degraded.sessionDegradedMessage);
              setRememberMeEnabled(true);
              return;
            }
          } else {
            const refreshed = await refreshSessionOnForeground();

            if (!isSessionResolveCurrent(runId)) {
              return;
            }
            if (refreshed.authenticated) {
              setAuthStatus('authenticated');
              setSessionDegraded(false);
              setSessionDegradedMessage('');
              setRememberMeEnabled(true);
              return;
            }

            const degraded = await resolveRememberMeDegradedSession();
            if (!isSessionResolveCurrent(runId)) {
              return;
            }
            if (degraded) {
              setAuthStatus(degraded.status);
              setSessionDegraded(true);
              setSessionDegradedMessage(degraded.sessionDegradedMessage);
              setRememberMeEnabled(true);
              return;
            }
          }

          if (!isSessionResolveCurrent(runId)) {
            return;
          }

          setAuthStatus('unauthenticated');
          setSessionDegraded(false);
          setSessionDegradedMessage('');
          return;
        }

        if (!isSessionResolveCurrent(runId)) {
          return;
        }

        if (isEphemeralSessionActive() && (await hasScraperSession())) {
          setAuthStatus('authenticated');
          setSessionDegraded(false);
          setSessionDegradedMessage('');
          return;
        }

        if (!isSessionResolveCurrent(runId)) {
          return;
        }

        setAuthStatus('unauthenticated');
        setSessionDegraded(false);
        setSessionDegradedMessage('');
      })();
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [bumpSessionResolve, isSessionResolveCurrent, persistReady]);

  const markAuthenticated = useCallback((options?: { ephemeral?: boolean }) => {
    bumpSessionResolve();
    if (options?.ephemeral === true) {
      setEphemeralSessionActive(true);
    } else if (options?.ephemeral === false) {
      setEphemeralSessionActive(false);
    }
    setAuthStatus('authenticated');
    setSessionDegraded(false);
    setSessionDegradedMessage('');
  }, [bumpSessionResolve]);

  const enableRememberMe = useCallback(
    async (username: string, password: string) => {
      await saveRememberMeCredentials(username, password);
      setEphemeralSessionActive(false);
      setRememberMeEnabled(true);
    },
    []
  );

  const disableRememberMe = useCallback(async () => {
    await clearRememberMe();
    setRememberMeEnabled(false);
  }, []);

  const signOut = useCallback(async () => {
    bumpSessionResolve();
    clearEphemeralSession();
    await performSignOut();
    setAuthStatus('unauthenticated');
    setSessionDegraded(false);
    setSessionDegradedMessage('');
    setRememberMeEnabled(false);
  }, [bumpSessionResolve]);

  /** Ręczne odnowienie sesji (banner / pull-to-refresh) — bez czyszczenia ciasteczek jak przy cold start. */
  const retrySessionRestore = useCallback(async () => {
    const runId = ++sessionResolveRunIdRef.current;

    try {
      await initClient();
    } catch {
      /* proceed */
    }

    const rememberMe = await isRememberMeEnabled();

    if (rememberMe) {
      const offline = await isDeviceOffline();
      let restored: Awaited<ReturnType<typeof restoreRememberMeSession>> | null =
        null;

      if (!offline) {
        restored = await restoreRememberMeSession();

        if (!isSessionResolveCurrent(runId)) {
          return;
        }
        if (restored.authenticated) {
          setAuthStatus('authenticated');
          setSessionDegraded(false);
          setSessionDegradedMessage('');
          setRememberMeEnabled(true);
          await syncUserDataAfterSessionRestore();
          return;
        }
      }

      const degraded = await resolveRememberMeDegradedSession({
        offline: offline || undefined,
      });
      if (!isSessionResolveCurrent(runId)) {
        return;
      }
      if (degraded) {
        const extra = restored?.errorMessage?.trim();
        setAuthStatus(degraded.status);
        setSessionDegraded(true);
        setSessionDegradedMessage(
          extra
            ? `${degraded.sessionDegradedMessage} ${extra}`
            : degraded.sessionDegradedMessage
        );
        setRememberMeEnabled(true);
        return;
      }

      setAuthStatus('unauthenticated');
      setSessionDegraded(false);
      setSessionDegradedMessage('');
      setRememberMeEnabled(true);
      return;
    }

    if (!isSessionResolveCurrent(runId)) {
      return;
    }

    if (await hasLiveScraperSession()) {
      if (!isEphemeralSessionActive()) {
        setEphemeralSessionActive(true);
      }
      setAuthStatus('authenticated');
      setSessionDegraded(false);
      setSessionDegradedMessage('');
      setRememberMeEnabled(false);
      await syncUserDataAfterSessionRestore();
      return;
    }

    if (!isSessionResolveCurrent(runId)) {
      return;
    }

    setAuthStatus('unauthenticated');
    setSessionDegraded(false);
    setSessionDegradedMessage('');
    setRememberMeEnabled(false);
  }, [isSessionResolveCurrent]);

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
      retrySessionRestore,
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
      retrySessionRestore,
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
