import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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

export function StudentProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileService = useMemo(() => new ProfileService(), []);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeName, setRouteName] = useState<string | undefined>(
    getCurrentRouteName()
  );

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
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfileSummary();
      setSummary(data);
    } catch (err) {
      console.error('[STUDENT PROFILE]', err);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [profileService]);

  useEffect(() => {
    if (!routeName || routeName === 'Login') {
      clear();
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 400));
        if (cancelled) {
          return;
        }
        const data = await profileService.getProfileSummary();
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        console.error('[STUDENT PROFILE]', err);
        if (!cancelled) {
          setSummary(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clear, profileService, routeName]);

  const value = useMemo(
    () => ({ summary, loading, refetch, clear }),
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
