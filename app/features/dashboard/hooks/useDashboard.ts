import { useCallback, useState } from 'react';

import { useAuthSession } from '../../../context/AuthSessionContext';
import { useStudentProfile } from '../../../context/StudentProfileContext';
import { DASHBOARD_FEATURES } from '../dashboard.features';

type Navigation = {
  navigate: (route: string) => void;
};

export function useDashboard(navigation: Navigation) {
  const { signOut } = useAuthSession();
  const { summary: profileSummary, loading: profileLoading, clear } =
    useStudentProfile();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const onFeaturePress = useCallback(
    (route: string) => {
      navigation.navigate(route);
    },
    [navigation]
  );

  const onLogout = useCallback(async () => {
    if (logoutLoading) {
      return;
    }

    try {
      setLogoutLoading(true);
      clear();
      await signOut();
    } catch (err) {
      console.error('[DASHBOARD] LOGOUT ERROR', err);
      alert(
        'Błąd wylogowania: ' +
          (err instanceof Error ? err.message : 'Nieznany błąd')
      );
    } finally {
      setLogoutLoading(false);
    }
  }, [clear, logoutLoading, signOut]);

  return {
    features: DASHBOARD_FEATURES,
    profileSummary,
    profileLoading,
    onFeaturePress,
    logoutLoading,
    onLogout,
  };
}
