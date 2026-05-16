import { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthService } from '../../../core/scraper/auth/auth.service';
import {
  ProfileService,
  type ProfileSummary,
} from '../../../core/scraper/features/profile/profile.service';
import { DASHBOARD_FEATURES } from '../dashboard.features';

type Navigation = {
  navigate: (route: string) => void;
  replace: (route: string) => void;
};

export function useDashboard(navigation: Navigation) {
  const authService = useMemo(() => new AuthService(), []);
  const profileService = useMemo(() => new ProfileService(), []);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(
    null
  );
  const [profileLoading, setProfileLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setProfileLoading(true);
        // Krótkie opóźnienie po przejściu z ekranu logowania (sesja / layout WD).
        await new Promise((resolve) => setTimeout(resolve, 400));
        if (cancelled) {
          return;
        }
        const summary = await profileService.getProfileSummary();
        if (!cancelled) {
          setProfileSummary(summary);
        }
      } catch (err) {
        console.error('[DASHBOARD] profile summary', err);
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileService]);

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
  }, [authService, navigation, logoutLoading]);

  return {
    features: DASHBOARD_FEATURES,
    profileSummary,
    profileLoading,
    onFeaturePress,
    logoutLoading,
    onLogout,
  };
}
