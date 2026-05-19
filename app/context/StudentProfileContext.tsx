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

import { useAuthSession } from './AuthSessionContext';
import {
  ProfileService,
  type ProfileSummary,
} from '../core/scraper/features/profile/profile.service';
import {
  getCurrentRouteName,
  navigationRef,
} from '../navigation/navigationRef';

type StudentProfileContextValue = {
  summary: ProfileSummary | null;
  loading: boolean;
  refetch: () => Promise<void>;
  clear: () => void;
};

const StudentProfileContext = createContext<StudentProfileContextValue | null>(
  null
);

function isProfileRoute(routeName: string | undefined): boolean {
  return Boolean(routeName && routeName !== 'Login');
}

export function StudentProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileService = useMemo(() => new ProfileService(), []);
  const { authStatus, sessionDegraded } = useAuthSession();
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeName, setRouteName] = useState<string | undefined>(
    getCurrentRouteName()
  );
  const inFlightRef = useRef(false);
  const summaryRef = useRef<ProfileSummary | null>(null);
  summaryRef.current = summary;

  useEffect(() => {
    const syncRoute = () => setRouteName(getCurrentRouteName());

    if (navigationRef.isReady()) {
      syncRoute();
    }

    const unsubscribe = navigationRef.addListener('state', syncRoute);
    return unsubscribe;
  }, []);

  const clear = useCallback(() => {
    setSummary(null);
    setLoading(false);
    inFlightRef.current = false;
  }, []);

  const loadProfile = useCallback(async (): Promise<boolean> => {
    if (inFlightRef.current) {
      return false;
    }

    inFlightRef.current = true;
    setLoading(true);

    try {
      const data = await profileService.getProfileSummary();
      setSummary(data);
      return true;
    } catch (err) {
      console.error('[STUDENT PROFILE]', err);
      setSummary(null);
      return false;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [profileService]);

  const refetch = useCallback(async () => {
    inFlightRef.current = false;
    await loadProfile();
  }, [loadProfile]);

  const shouldAutoFetch =
    authStatus === 'authenticated' &&
    isProfileRoute(routeName) &&
    summary === null;

  useEffect(() => {
    if (!isProfileRoute(routeName)) {
      clear();
      return;
    }

    if (authStatus !== 'authenticated' || summary !== null) {
      return;
    }

    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const attempt = async (allowRetry: boolean) => {
      const ok = await loadProfile();
      if (
        ok ||
        !allowRetry ||
        cancelled ||
        summaryRef.current !== null
      ) {
        return;
      }

      retryTimeout = setTimeout(() => {
        if (!cancelled && summaryRef.current === null) {
          void attempt(false);
        }
      }, 2500);
    };

    void attempt(true);

    return () => {
      cancelled = true;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [
    authStatus,
    clear,
    loadProfile,
    routeName,
    sessionDegraded,
    summary,
  ]);

  useEffect(() => {
    if (!shouldAutoFetch) {
      return;
    }

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active' || summary !== null) {
        return;
      }

      void loadProfile();
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [shouldAutoFetch, summary, loadProfile]);

  const value = useMemo(
    () => ({
      summary,
      loading: loading && summary === null,
      refetch,
      clear,
    }),
    [summary, loading, refetch, clear]
  );

  return (
    <StudentProfileContext.Provider value={value}>
      {children}
    </StudentProfileContext.Provider>
  );
}

export function useStudentProfile() {
  const context = useContext(StudentProfileContext);
  if (!context) {
    throw new Error(
      'useStudentProfile must be used within StudentProfileProvider'
    );
  }
  return context;
}
