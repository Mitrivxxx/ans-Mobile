import { useCallback, useMemo, useState } from 'react';

import { AuthService } from '../../../core/scraper/auth/auth.service';
import { useStudentProfile } from '../../../context/StudentProfileContext';
import { DASHBOARD_FEATURES } from '../dashboard.features';

type Navigation = {
  navigate: (route: string) => void;
  replace: (route: string) => void;
};

export function useDashboard(navigation: Navigation) {
  const authService = useMemo(() => new AuthService(), []);
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
      console.log('[DASHBOARD] LOGOUT START');
      await authService.logout();
      console.log('[DASHBOARD] LOGOUT SUCCESS');
      clear();
      navigation.replace('Login');
    } catch (err) {
      console.error('[DASHBOARD] LOGOUT ERROR', err);
      alert(
        'Błąd wylogowania: ' +
          (err instanceof Error ? err.message : 'Nieznany błąd')
      );
    } finally {
      setLogoutLoading(false);
    }
  }, [authService, clear, navigation, logoutLoading]);

  return {
    features: DASHBOARD_FEATURES,
    profileSummary,
    profileLoading,
    onFeaturePress,
    logoutLoading,
    onLogout,
  };
}
