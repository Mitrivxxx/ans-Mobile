import { useCallback, useMemo, useState } from 'react';

import { clearUserAppCache } from '../../core/queryClient/clearUserAppCache';
import { AuthService } from '../../core/scraper/auth/auth.service';
import { useRememberMeAuth } from '../../context/RememberMeAuthContext';
import { useStudentProfile } from '../../context/StudentProfileContext';
import {
  navigateTo,
  replaceTo,
  type SidebarRouteName,
} from '../../navigation/navigationRef';
import { useSidebar } from './SidebarContext';

export function useSidebarActions() {
  const { close } = useSidebar();
  const { clear } = useStudentProfile();
  const { disableRememberMe } = useRememberMeAuth();
  const authService = useMemo(() => new AuthService(), []);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const onNavigate = useCallback(
    (route: SidebarRouteName) => {
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
      await disableRememberMe();
      clear();
      await clearUserAppCache();
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
  }, [authService, clear, close, disableRememberMe, logoutLoading]);

  return {
    onNavigate,
    onLogout,
    logoutLoading,
  };
}
