import { useEffect } from 'react';
import { BackHandler } from 'react-native';

import { useSidebar } from './SidebarContext';

/** Android: hardware back zamyka menu boczne zamiast wychodzić z ekranu. */
export default function SidebarBackHandler() {
  const { isOpen, close } = useSidebar();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isOpen) {
        return false;
      }
      close();
      return true;
    });

    return () => subscription.remove();
  }, [close, isOpen]);

  return null;
}
