import { useMemo } from 'react';
import { RefreshControl } from 'react-native';

import { useScreenRefresh } from '../context/ScreenRefreshContext';
import { ansColors } from '../theme/ansTheme';

export function useRefreshControlProps() {
  const { refreshing, onRefresh } = useScreenRefresh();

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[ansColors.gold]}
        tintColor={ansColors.gold}
      />
    ),
    [refreshing, onRefresh]
  );

  return { refreshing, refreshControl };
}
