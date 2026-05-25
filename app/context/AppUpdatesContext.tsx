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
  isAutoUpdatesEnabled,
  setAutoUpdatesEnabled as persistAutoUpdatesEnabled,
} from '../core/preferences/autoUpdates.storage';
import {
  checkAndFetchAppUpdate,
  getOtaChannel,
  getRunningUpdateLabel,
  isAppUpdatesSupported,
  probeAppUpdateAvailability,
  reloadAppWithUpdate,
  type AppUpdateCheckResult,
} from '../core/updates/appUpdates';

const FOREGROUND_CHECK_INTERVAL_MS = 5 * 60 * 1000;

type AppUpdatesContextValue = {
  supported: boolean;
  autoCheckEnabled: boolean;
  setAutoCheckEnabled: (enabled: boolean) => Promise<void>;
  pendingReload: boolean;
  /** Serwer ma nowy bundel (probe) lub update już pobrany — do komunikatu w Ustawieniach. */
  updateAvailable: boolean;
  probingAvailability: boolean;
  checking: boolean;
  runningUpdateId: string | null;
  otaChannel: string | null;
  probeUpdateAvailability: () => Promise<void>;
  checkForUpdate: (options?: { userInitiated?: boolean }) => Promise<AppUpdateCheckResult>;
  applyPendingUpdate: () => Promise<void>;
};

const AppUpdatesContext = createContext<AppUpdatesContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function AppUpdatesProvider({ children }: Props) {
  const [autoCheckEnabled, setAutoCheckEnabledState] = useState(false);
  const [autoCheckReady, setAutoCheckReady] = useState(false);
  const [pendingReload, setPendingReload] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [probingAvailability, setProbingAvailability] = useState(false);
  const [checking, setChecking] = useState(false);
  const lastForegroundCheckRef = useRef(0);
  const checkInFlightRef = useRef(false);
  const checkPromiseRef = useRef<Promise<AppUpdateCheckResult> | null>(null);

  const supported = isAppUpdatesSupported();
  const runningUpdateId = getRunningUpdateLabel();
  const otaChannel = getOtaChannel();

  useEffect(() => {
    void (async () => {
      const enabled = await isAutoUpdatesEnabled();
      setAutoCheckEnabledState(enabled);
      setAutoCheckReady(true);
    })();
  }, []);

  const setAutoCheckEnabled = useCallback(async (enabled: boolean) => {
    await persistAutoUpdatesEnabled(enabled);
    setAutoCheckEnabledState(enabled);
  }, []);

  const applyAvailabilityFromProbe = useCallback(
    (status: Awaited<ReturnType<typeof probeAppUpdateAvailability>>['status']) => {
      if (status === 'available') {
        setUpdateAvailable(true);
      } else if (status === 'upToDate') {
        setUpdateAvailable(false);
      }
    },
    []
  );

  const probeUpdateAvailability = useCallback(async () => {
    if (!isAppUpdatesSupported()) {
      return;
    }
    if (pendingReload) {
      setUpdateAvailable(true);
      return;
    }

    setProbingAvailability(true);
    try {
      const result = await probeAppUpdateAvailability();
      if (result.status === 'error') {
        setUpdateAvailable(false);
      } else {
        applyAvailabilityFromProbe(result.status);
      }
    } finally {
      setProbingAvailability(false);
    }
  }, [applyAvailabilityFromProbe, pendingReload]);

  const runCheck = useCallback(
    async (options?: { userInitiated?: boolean }): Promise<AppUpdateCheckResult> => {
      if (!isAppUpdatesSupported()) {
        return __DEV__ ? { status: 'dev' } : { status: 'disabled' };
      }

      if (checkPromiseRef.current) {
        return checkPromiseRef.current;
      }

      const checkPromise = (async (): Promise<AppUpdateCheckResult> => {
        checkInFlightRef.current = true;
        setChecking(true);
        try {
          const result = await checkAndFetchAppUpdate();
          if (result.status === 'downloaded') {
            setPendingReload(true);
            setUpdateAvailable(true);
          } else if (result.status === 'upToDate') {
            setUpdateAvailable(false);
          }
          return result;
        } finally {
          checkInFlightRef.current = false;
          setChecking(false);
          checkPromiseRef.current = null;
        }
      })();

      checkPromiseRef.current = checkPromise;
      return checkPromise;
    },
    []
  );

  const applyPendingUpdate = useCallback(async () => {
    if (!pendingReload) {
      return;
    }
    await reloadAppWithUpdate();
  }, [pendingReload]);

  useEffect(() => {
    if (!autoCheckReady || !autoCheckEnabled) {
      return;
    }
    void runCheck();
  }, [autoCheckReady, autoCheckEnabled, runCheck]);

  useEffect(() => {
    if (!autoCheckReady || !autoCheckEnabled) {
      return;
    }

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
  }, [autoCheckReady, autoCheckEnabled, runCheck]);

  const value = useMemo<AppUpdatesContextValue>(
    () => ({
      supported,
      autoCheckEnabled,
      setAutoCheckEnabled,
      pendingReload,
      updateAvailable,
      probingAvailability,
      checking,
      runningUpdateId,
      otaChannel,
      probeUpdateAvailability,
      checkForUpdate: runCheck,
      applyPendingUpdate,
    }),
    [
      supported,
      autoCheckEnabled,
      setAutoCheckEnabled,
      pendingReload,
      updateAvailable,
      probingAvailability,
      checking,
      runningUpdateId,
      otaChannel,
      probeUpdateAvailability,
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
