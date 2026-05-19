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
import { queryClient } from '../core/queryClient/queryClient';
import { queryKeys } from '../core/queryClient/queryKeys';
import {
  hasScraperSession,
  loginWithSavedCredentials,
  refreshSessionOnForeground,
  registerSessionLostHandler,
  restoreRememberMeSession,
} from '../core/scraper/auth/ensureAuthenticated';
import { initClient } from '../core/scraper/client/client';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

type AuthSessionContextValue = {
  authStatus: AuthStatus;
  rememberMeEnabled: boolean;
  /** Sesja WD niedostępna, ale jest zapisany plan — tryb offline. */
  sessionDegraded: boolean;
  enableRememberMe: (username: string, password: string) => Promise<void>;
  disableRememberMe: () => Promise<void>;
  markAuthenticated: () => void;
  signOut: () => Promise<void>;
  retrySessionRestore: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

function hasStudentPlanCache(): boolean {
  const lessons = queryClient.getQueryData(queryKeys.studentPlan.lessons);
  const weekLessons = queryClient.getQueryData(
    queryKeys.studentPlan.weekLessons
  );
  return lessons !== undefined || weekLessons !== undefined;
}

async function resolveRememberMeWithDegradedFallback(): Promise<{
  status: Exclude<AuthStatus, 'unknown'>;
  sessionDegraded: boolean;
}> {
  const restored = await restoreRememberMeSession();

  if (restored.authenticated) {
    return { status: 'authenticated', sessionDegraded: false };
  }

  if (hasStudentPlanCache()) {
    return { status: 'authenticated', sessionDegraded: true };
  }

  return { status: 'unauthenticated', sessionDegraded: false };
}

async function resolveAuthStatus(): Promise<{
  status: Exclude<AuthStatus, 'unknown'>;
  sessionDegraded: boolean;
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

  if (await hasScraperSession()) {
    return {
      status: 'authenticated',
      sessionDegraded: false,
      rememberMeEnabled: false,
    };
  }

  return {
    status: 'unauthenticated',
    sessionDegraded: false,
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

  const applyResolvedSession = useCallback(
    (resolved: Awaited<ReturnType<typeof resolveAuthStatus>>) => {
      setAuthStatus(resolved.status);
      setRememberMeEnabled(resolved.rememberMeEnabled);
      setSessionDegraded(resolved.sessionDegraded);
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
      const rememberMe = await isRememberMeEnabled();
      if (!rememberMe) {
        setAuthStatus('unauthenticated');
        setSessionDegraded(false);
        return;
      }

      if (hasStudentPlanCache()) {
        setAuthStatus('authenticated');
        setSessionDegraded(true);
        return;
      }

      setAuthStatus('unauthenticated');
      setSessionDegraded(false);
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
        if (!rememberMe) {
          return;
        }

        const refreshed = await refreshSessionOnForeground();

        if (refreshed.authenticated) {
          setAuthStatus('authenticated');
          setSessionDegraded(refreshed.sessionDegraded);
          setRememberMeEnabled(true);
          return;
        }

        if (hasStudentPlanCache()) {
          setAuthStatus('authenticated');
          setSessionDegraded(true);
          setRememberMeEnabled(true);
          return;
        }

        setAuthStatus('unauthenticated');
        setSessionDegraded(false);
      })();
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [persistReady]);

  const markAuthenticated = useCallback(() => {
    setAuthStatus('authenticated');
    setSessionDegraded(false);
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
    setRememberMeEnabled(false);
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      authStatus,
      rememberMeEnabled,
      sessionDegraded,
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
