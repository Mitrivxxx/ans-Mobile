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
  checkAndFetchAppUpdate,
  getRunningUpdateLabel,
  isAppUpdatesSupported,
  reloadAppWithUpdate,
  type AppUpdateCheckResult,
} from '../core/updates/appUpdates';

const FOREGROUND_CHECK_INTERVAL_MS = 5 * 60 * 1000;

type AppUpdatesContextValue = {
  supported: boolean;
  pendingReload: boolean;
  checking: boolean;
  runningUpdateId: string | null;
  checkForUpdate: (options?: { userInitiated?: boolean }) => Promise<AppUpdateCheckResult>;
  applyPendingUpdate: () => Promise<void>;
};

const AppUpdatesContext = createContext<AppUpdatesContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function AppUpdatesProvider({ children }: Props) {
  const [pendingReload, setPendingReload] = useState(false);
  const [checking, setChecking] = useState(false);
  const lastForegroundCheckRef = useRef(0);
  const checkInFlightRef = useRef(false);

  const supported = isAppUpdatesSupported();
  const runningUpdateId = getRunningUpdateLabel();

  const runCheck = useCallback(
    async (options?: { userInitiated?: boolean }): Promise<AppUpdateCheckResult> => {
      if (!isAppUpdatesSupported()) {
        return __DEV__ ? { status: 'dev' } : { status: 'disabled' };
      }
      if (checkInFlightRef.current) {
        return pendingReload ? { status: 'downloaded' } : { status: 'upToDate' };
      }

      checkInFlightRef.current = true;
      setChecking(true);
      try {
        const result = await checkAndFetchAppUpdate();
        if (result.status === 'downloaded') {
          setPendingReload(true);
          if (options?.userInitiated) {
            await reloadAppWithUpdate();
          }
        }
        return result;
      } finally {
        checkInFlightRef.current = false;
        setChecking(false);
      }
    },
    [pendingReload]
  );

  const applyPendingUpdate = useCallback(async () => {
    if (!pendingReload) {
      return;
    }
    await reloadAppWithUpdate();
  }, [pendingReload]);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  useEffect(() => {
    const onAppStateChange = (next: AppStateStatus) => {
      if (next !== 'active') {
        return;
      }
      const now = Date.now();
      if (now - lastForegroundCheckRef.current < FOREGROUND_CHECK_INTERVAL_MS) {
        return;
      }
      lastForegroundCheckRef.current = now;
      void runCheck();
    };

    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, [runCheck]);

  const value = useMemo<AppUpdatesContextValue>(
    () => ({
      supported,
      pendingReload,
      checking,
      runningUpdateId,
      checkForUpdate: runCheck,
      applyPendingUpdate,
    }),
    [
      supported,
      pendingReload,
      checking,
      runningUpdateId,
      runCheck,
      applyPendingUpdate,
    ]
  );

  return (
    <AppUpdatesContext.Provider value={value}>
      {children}
    </AppUpdatesContext.Provider>
  );
}

export function useAppUpdates(): AppUpdatesContextValue {
  const ctx = useContext(AppUpdatesContext);
  if (!ctx) {
    throw new Error('useAppUpdates must be used within AppUpdatesProvider');
  }
  return ctx;
}
