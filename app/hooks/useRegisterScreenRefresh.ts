import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useScreenRefresh } from '../context/ScreenRefreshContext';

export function useRegisterScreenRefresh(
  refresh: () => void | Promise<unknown>
) {
  const { register, unregister } = useScreenRefresh();
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useFocusEffect(
    useCallback(() => {
      register(() => refreshRef.current());
      return unregister;
    }, [register, unregister])
  );
}
