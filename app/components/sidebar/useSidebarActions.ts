// Akcje nawigacji i wylogowania menu.
import { useCallback, useState } from 'react';

import { useAuthSession } from '../../context/AuthSessionContext';
import { useStudentProfile } from '../../context/StudentProfileContext';
import {
  navigateTo,
  type SidebarRouteName,
} from '../../navigation/navigationRef';
import { useSidebar } from './SidebarContext';

export function useSidebarActions() {
  const { close } = useSidebar();
  const { clear } = useStudentProfile();
  const { signOut } = useAuthSession();
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
      clear();
      await signOut();
      close();
    } catch (err) {
      console.error('[SIDEBAR] LOGOUT ERROR', err);
      alert(
        'Błąd wylogowania: ' +
          (err instanceof Error ? err.message : 'Nieznany błąd')
      );
    } finally {
      setLogoutLoading(false);
    }
  }, [clear, close, logoutLoading, signOut]);

  return {
    onNavigate,
    onLogout,
    logoutLoading,
  };
}
