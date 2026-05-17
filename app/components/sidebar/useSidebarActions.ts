import { useCallback, useMemo, useState } from 'react';

import { AuthService } from '../../core/scraper/auth/auth.service';
import { useStudentProfile } from '../../context/StudentProfileContext';
import {
  navigateTo,
  replaceTo,
  type AppRouteName,
} from '../../navigation/navigationRef';
import { useSidebar } from './SidebarContext';

export function useSidebarActions() {
  const { close } = useSidebar();
  const { clear } = useStudentProfile();
  const authService = useMemo(() => new AuthService(), []);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const onNavigate = useCallback(
    (route: AppRouteName) => {
      navigateTo(route);
      close();
    },
    [close]
  );

  const onLogout = useCallback(async () => {
    if (logoutLoading) {
      return;
    }

    try {
      setLogoutLoading(true);
      await authService.logout();
      clear();
      close();
      replaceTo('Login');
    } catch (err) {
      console.error('[SIDEBAR] LOGOUT ERROR', err);
      alert(
        'Błąd wylogowania: ' +
          (err instanceof Error ? err.message : 'Nieznany błąd')
      );
    } finally {
      setLogoutLoading(false);
    }
  }, [authService, clear, close, logoutLoading]);

  return {
    onNavigate,
    onLogout,
    logoutLoading,
  };
}
