// Zarządza sesją i autoryzacją użytkownika.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import {
  canEnterOfflineDegradedSession,
  isDeviceOffline,
} from '../core/auth/authSessionPolicy';
import {
  clearEphemeralSession,
  isEphemeralSessionActive,
  setEphemeralSessionActive,
} from '../core/auth/ephemeralSession';
import { clearLocalUserSessionData } from '../core/auth/clearLocalUserSessionData';
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
  hasAnyUserCache,
} from '../core/queryClient/hasAnyUserCache';
import { hasAppLoginRecord } from '../core/auth/sessionUser.storage';
import {
  hasScraperSession,
  refreshSessionOnForeground,
  registerSessionLostHandler,
  restoreRememberMeSession,
} from '../core/scraper/auth/ensureAuthenticated';
import { clearSession } from '../core/scraper/auth/session.store';
import { probeWdSessionAlive } from '../core/scraper/auth/sessionValidation';
import { onNetworkReconnect } from '../core/network/networkSubscription';
import { devLog } from '../config/devLog';
import { isDemoPresentationMode } from '../config/env';
import { ensureScraperInfraReady } from '../core/scraper/auth/bootstrapSession';
import { startupMark, startupMeasure } from '../core/startup/startupMetrics';

export type AuthStatus =
  | 'unknown'
  | 'restoring'
  | 'authenticated'
  | 'unauthenticated';

type AuthSessionContextValue = {
  authStatus: AuthStatus;
  /** Probe / silent login w tle — banner „Logowanie…”, bez blokowania UI. */
  isRestoringSession: boolean;
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

function deferAuthRestoreUntilUiShown(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

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

async function resolveRememberMeOfflineEntry(): Promise<{
  status: 'authenticated';
  sessionDegraded: true;
  sessionDegradedMessage: string;
} | null> {
  if (!(await isRememberMeEnabled())) {
    return null;
  }
  if (!(await hasAppLoginRecord())) {
    return null;
  }
  if (!(await isDeviceOffline())) {
    return null;
  }
  return resolveDegradedState({ offline: true });
}

/** Online + remember me + login record → dashboard od razu (degraded gdy jest cache w RQ). */
async function resolveRememberMeOnlineCacheEntry(): Promise<{
  status: 'authenticated';
  sessionDegraded: boolean;
  sessionDegradedMessage: string;
} | null> {
  if (!(await isRememberMeEnabled())) {
    return null;
  }
  if (!(await hasAppLoginRecord())) {
    return null;
  }
  if (await isDeviceOffline()) {
    return null;
  }

  if (hasAnyUserCache()) {
    return resolveDegradedState();
  }

  return {
    status: 'authenticated',
    sessionDegraded: false,
    sessionDegradedMessage: '',
  };
}

async function resolveRememberMeOptimisticEntry(): Promise<{
  status: 'authenticated';
  sessionDegraded: boolean;
  sessionDegradedMessage: string;
  rememberMeEnabled: true;
} | null> {
  if (!(await isRememberMeEnabled())) {
    return null;
  }
  if (!(await hasAppLoginRecord())) {
    return null;
  }

  const offlineEntry = await resolveRememberMeOfflineEntry();
  if (offlineEntry) {
    return { ...offlineEntry, rememberMeEnabled: true };
  }

  const onlineEntry = await resolveRememberMeOnlineCacheEntry();
  if (onlineEntry) {
    return { ...onlineEntry, rememberMeEnabled: true };
  }

  return null;
}

async function resolveRememberMeWithDegradedFallback(): Promise<{
  status: Exclude<AuthStatus, 'unknown'>;
  sessionDegraded: boolean;
  sessionDegradedMessage: string;
}> {
  const offlineEntry = await resolveRememberMeOfflineEntry();
  if (offlineEntry) {
    return offlineEntry;
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
  const rememberMe = await isRememberMeEnabled();

  if (rememberMe) {
    const offlineEntry = await resolveRememberMeOfflineEntry();
    if (offlineEntry) {
      return {
        ...offlineEntry,
        rememberMeEnabled: true,
      };
    }
  }

  try {
    await ensureScraperInfraReady();
  } catch {
    /* proceed */
  }

  let hasSessionCache: boolean | null = null;
  const readHasScraperSession = async (): Promise<boolean> => {
    if (hasSessionCache === null) {
      hasSessionCache = await hasScraperSession();
    }
    return hasSessionCache;
  };

  if (rememberMe) {
    const resolved = await resolveRememberMeWithDegradedFallback();
    return {
      ...resolved,
      rememberMeEnabled: true,
    };
  }

  if (!isEphemeralSessionActive()) {
    // Cold start po logowaniu bez „Zapamiętaj mnie” — jak ręczne Wyloguj.
    await clearLocalUserSessionData();
    return {
      status: 'unauthenticated',
      sessionDegraded: false,
      sessionDegradedMessage: '',
      rememberMeEnabled: false,
    };
  }

  if (await hasLiveScraperSession()) {
    return {
      status: 'authenticated',
      sessionDegraded: false,
      sessionDegradedMessage: '',
      rememberMeEnabled: false,
    };
  }

  if (await readHasScraperSession()) {
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
  initialRememberMeRestore = false,
}: {
  children: React.ReactNode;
  persistReady: boolean;
  initialRememberMeRestore?: boolean;
}) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() => {
    if (isDemoPresentationMode()) {
      return 'authenticated';
    }
    return initialRememberMeRestore ? 'restoring' : 'unknown';
  });
  const [rememberMeEnabled, setRememberMeEnabled] = useState(
    isDemoPresentationMode() ? false : initialRememberMeRestore
  );
  const [isBackgroundSessionRestore, setIsBackgroundSessionRestore] =
    useState(
      isDemoPresentationMode() ? false : initialRememberMeRestore
    );
  const [sessionDegraded, setSessionDegraded] = useState(false);
  const [sessionDegradedMessage, setSessionDegradedMessage] = useState('');
  const sessionResolveRunIdRef = useRef(0);
  const authStatusRef = useRef(authStatus);
  authStatusRef.current = authStatus;
  const sessionDegradedRef = useRef(sessionDegraded);
  sessionDegradedRef.current = sessionDegraded;

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

  const finalizeRememberMeNetworkRestore = useCallback(
    async (runId: number) => {
      try {
        await ensureScraperInfraReady();
      } catch {
        /* proceed */
      }

      const resolved = await resolveRememberMeWithDegradedFallback();
      if (!isSessionResolveCurrent(runId)) {
        return;
      }

      startupMark('auth-restore-resolved');
      startupMeasure(
        'restoreSession -> resolved',
        'auth-restore-start',
        'auth-restore-resolved'
      );
      devLog(
        'Auth',
        `session resolved: ${resolved.status}${resolved.sessionDegraded ? ' (degraded)' : ''}`
      );
      applyResolvedSession({
        ...resolved,
        rememberMeEnabled: true,
      });
      if (resolved.status === 'authenticated' && !resolved.sessionDegraded) {
        await syncUserDataAfterSessionRestore();
      }
    },
    [applyResolvedSession, isSessionResolveCurrent]
  );

  const restoreSession = useCallback(
    async (options?: { showSplash?: boolean }) => {
      const runId = ++sessionResolveRunIdRef.current;
      const isStartup = options?.showSplash !== false;

      if (isDemoPresentationMode()) {
        if (isSessionResolveCurrent(runId)) {
          setIsBackgroundSessionRestore(false);
          applyResolvedSession({
            status: 'authenticated',
            sessionDegraded: false,
            sessionDegradedMessage: '',
            rememberMeEnabled: false,
          });
        }
        return;
      }

      startupMark('auth-restore-start');

      if (isStartup) {
        const optimistic = await resolveRememberMeOptimisticEntry();
        if (optimistic && isSessionResolveCurrent(runId)) {
          devLog('Auth', 'optimistic remember-me entry');
          setRememberMeEnabled(true);
          setSessionDegraded(optimistic.sessionDegraded);
          setSessionDegradedMessage(optimistic.sessionDegradedMessage);

          if (optimistic.sessionDegraded && (await isDeviceOffline())) {
            setAuthStatus('authenticated');
            setIsBackgroundSessionRestore(false);
            startupMark('auth-restore-resolved');
            startupMeasure(
              'restoreSession -> resolved',
              'auth-restore-start',
              'auth-restore-resolved'
            );
            return;
          }

          setAuthStatus('restoring');
          setIsBackgroundSessionRestore(true);
          try {
            await deferAuthRestoreUntilUiShown();
            if (!isSessionResolveCurrent(runId)) {
              return;
            }
            await finalizeRememberMeNetworkRestore(runId);
          } finally {
            if (isSessionResolveCurrent(runId)) {
              setIsBackgroundSessionRestore(false);
            }
          }
          return;
        }
      }

      const rememberMe = await isRememberMeEnabled();
      const showBackgroundBanner =
        !isStartup &&
        rememberMe &&
        (authStatusRef.current === 'authenticated' ||
          authStatusRef.current === 'restoring');

      if (showBackgroundBanner && isSessionResolveCurrent(runId)) {
        setIsBackgroundSessionRestore(true);
      }

      try {
        const resolved = await resolveAuthStatus();
        if (isSessionResolveCurrent(runId)) {
          startupMark('auth-restore-resolved');
          startupMeasure(
            'restoreSession -> resolved',
            'auth-restore-start',
            'auth-restore-resolved'
          );
          devLog(
            'Auth',
            `session resolved: ${resolved.status}${resolved.sessionDegraded ? ' (degraded)' : ''}`
          );
          applyResolvedSession(resolved);
        }
      } finally {
        if (isSessionResolveCurrent(runId)) {
          setIsBackgroundSessionRestore(false);
        }
      }
    },
    [applyResolvedSession, finalizeRememberMeNetworkRestore, isSessionResolveCurrent]
  );

  const refreshSessionAfterPersistReady = useCallback(async () => {
    if (!(await isRememberMeEnabled())) {
      return;
    }
    if (
      authStatusRef.current !== 'authenticated' &&
      authStatusRef.current !== 'restoring'
    ) {
      return;
    }

    const offline = await isDeviceOffline();
    const hasCache = hasAnyUserCache();

    if (offline) {
      if (!sessionDegradedRef.current) {
        setSessionDegraded(true);
      }
      setSessionDegradedMessage(
        formatDegradedCacheMessage(getDegradedCacheKinds(), { offline: true })
      );
      return;
    }

    if (sessionDegradedRef.current || hasCache) {
      setSessionDegradedMessage(
        formatDegradedCacheMessage(getDegradedCacheKinds())
      );
    }
  }, []);

  const handleSessionLost = useCallback(() => {
    if (isDemoPresentationMode()) {
      return;
    }

    const runId = ++sessionResolveRunIdRef.current;

    void (async () => {
      const offlineEntry = await resolveRememberMeOfflineEntry();
      if (!isSessionResolveCurrent(runId)) {
        return;
      }
      if (offlineEntry) {
        setAuthStatus(offlineEntry.status);
        setSessionDegraded(true);
        setSessionDegradedMessage(offlineEntry.sessionDegradedMessage);
        setRememberMeEnabled(true);
        return;
      }

      const rememberMe = await isRememberMeEnabled();
      if (rememberMe) {
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
    })();
  }, [isSessionResolveCurrent]);

  useEffect(() => {
    return registerSessionLostHandler(handleSessionLost);
  }, [handleSessionLost]);

  useLayoutEffect(() => {
    // Szybki resolve sesji na cold starcie (bez czekania na restore cache).
    void restoreSession({ showSplash: true });
  }, [restoreSession]);

  useEffect(() => {
    if (!persistReady) {
      return;
    }
    void (async () => {
      if (
        (await isRememberMeEnabled()) &&
        (authStatusRef.current === 'authenticated' ||
          authStatusRef.current === 'restoring')
      ) {
        await refreshSessionAfterPersistReady();
        return;
      }
      void restoreSession({ showSplash: false });
    })();
  }, [persistReady, refreshSessionAfterPersistReady, restoreSession]);

  useEffect(() => {
    if (!persistReady) {
      return;
    }

    return onNetworkReconnect(() => {
      if (
        authStatusRef.current !== 'authenticated' &&
        authStatusRef.current !== 'restoring'
      ) {
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
          const offlineEntry = await resolveRememberMeOfflineEntry();
          if (!isSessionResolveCurrent(runId)) {
            return;
          }
          if (offlineEntry) {
            setAuthStatus(offlineEntry.status);
            setSessionDegraded(true);
            setSessionDegradedMessage(offlineEntry.sessionDegradedMessage);
            setRememberMeEnabled(true);
            return;
          }

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
    devLog(
      'Auth',
      `authenticated (ephemeral=${options?.ephemeral === true ? 'yes' : 'no'})`
    );
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
    devLog('Auth', 'sign out');
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

    const rememberMe = await isRememberMeEnabled();

    if (rememberMe) {
      const offlineEntry = await resolveRememberMeOfflineEntry();
      if (!isSessionResolveCurrent(runId)) {
        return;
      }
      if (offlineEntry) {
        setAuthStatus(offlineEntry.status);
        setSessionDegraded(true);
        setSessionDegradedMessage(offlineEntry.sessionDegradedMessage);
        setRememberMeEnabled(true);
        return;
      }
    }

    try {
      await ensureScraperInfraReady();
    } catch {
      /* proceed */
    }

    if (rememberMe) {
      const restored = await restoreRememberMeSession();

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

      const degraded = await resolveRememberMeDegradedSession();
      if (!isSessionResolveCurrent(runId)) {
        return;
      }
      if (degraded) {
        const extra = restored.errorMessage?.trim();
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
      isRestoringSession:
        authStatus === 'restoring' || isBackgroundSessionRestore,
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
      isBackgroundSessionRestore,
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
