import { useMemo } from 'react';
import { RefreshControl } from 'react-native';

import { useScreenRefresh } from '../context/ScreenRefreshContext';
import { useAppTheme } from '../context/AppThemeContext';

export function useRefreshControlProps() {
  const { refreshing, onRefresh } = useScreenRefresh();
  const { colors } = useAppTheme();

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[colors.gold]}
        tintColor={colors.gold}
      />
    ),
    [colors.gold, onRefresh, refreshing]
  );

  return { refreshing, refreshControl };
}
