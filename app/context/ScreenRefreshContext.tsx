import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

type ScreenRefreshFn = () => void | Promise<unknown>;

type ScreenRefreshContextValue = {
  register: (refresh: ScreenRefreshFn) => void;
  unregister: () => void;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
};

const ScreenRefreshContext = createContext<ScreenRefreshContextValue | null>(
  null
);

export function ScreenRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const handlerRef = useRef<ScreenRefreshFn | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const register = useCallback((refresh: ScreenRefreshFn) => {
    handlerRef.current = refresh;
  }, []);

  const unregister = useCallback(() => {
    handlerRef.current = null;
  }, []);

  const onRefresh = useCallback(async () => {
    const refresh = handlerRef.current;
    if (!refresh) {
      return;
    }

    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      register,
      unregister,
      refreshing,
      onRefresh,
    }),
    [register, unregister, refreshing, onRefresh]
  );

  return (
    <ScreenRefreshContext.Provider value={value}>
      {children}
    </ScreenRefreshContext.Provider>
  );
}

function useScreenRefreshContext() {
  const context = useContext(ScreenRefreshContext);
  if (!context) {
    throw new Error(
      'useScreenRefresh must be used within ScreenRefreshProvider'
    );
  }
  return context;
}

export function useScreenRefresh() {
  return useScreenRefreshContext();
}
