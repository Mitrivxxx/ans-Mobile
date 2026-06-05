import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DATA_REFRESH_INTERVAL_OPTIONS,
  DEFAULT_DATA_REFRESH_INTERVAL_MS,
  getDataRefreshIntervalMs,
  getDataRefreshIntervalOptionByMs,
  setDataRefreshIntervalMs,
} from '../core/preferences/dataRefreshInterval.storage';

type DataRefreshIntervalContextValue = {
  intervalMs: number;
  selectedOption: (typeof DATA_REFRESH_INTERVAL_OPTIONS)[number];
  options: typeof DATA_REFRESH_INTERVAL_OPTIONS;
  setIntervalMs: (ms: number) => Promise<void>;
  ready: boolean;
};

const DataRefreshIntervalContext =
  createContext<DataRefreshIntervalContextValue | null>(null);

export function DataRefreshIntervalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [intervalMs, setIntervalMsState] = useState(
    DEFAULT_DATA_REFRESH_INTERVAL_MS
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getDataRefreshIntervalMs().then((storedMs) => {
      if (!cancelled) {
        setIntervalMsState(storedMs);
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setIntervalMs = useCallback(async (ms: number) => {
    await setDataRefreshIntervalMs(ms);
    setIntervalMsState(ms);
  }, []);

  const selectedOption = useMemo(
    () =>
      getDataRefreshIntervalOptionByMs(intervalMs) ??
      getDataRefreshIntervalOptionByMs(DEFAULT_DATA_REFRESH_INTERVAL_MS)!,
    [intervalMs]
  );

  const value = useMemo(
    () => ({
      intervalMs,
      selectedOption,
      options: DATA_REFRESH_INTERVAL_OPTIONS,
      setIntervalMs,
      ready,
    }),
    [intervalMs, ready, selectedOption, setIntervalMs]
  );

  return (
    <DataRefreshIntervalContext.Provider value={value}>
      {children}
    </DataRefreshIntervalContext.Provider>
  );
}

export function useDataRefreshInterval() {
  const context = useContext(DataRefreshIntervalContext);
  if (!context) {
    throw new Error(
      'useDataRefreshInterval must be used within DataRefreshIntervalProvider'
    );
  }
  return context;
}
