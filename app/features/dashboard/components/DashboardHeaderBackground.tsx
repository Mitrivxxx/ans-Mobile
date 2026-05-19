import React from 'react';
import { View } from 'react-native';

import AppLogo from '../../../components/AppLogo';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import {
  DASHBOARD_HEADER_LOGO_SIZE,
  createDashboardHeaderBackgroundStyles,
} from './DashboardHeaderBackground.styles';

export default function DashboardHeaderBackground() {
  const styles = useThemedStyles(createDashboardHeaderBackgroundStyles);
  return (
    <View style={styles.root}>
      <AppLogo size={DASHBOARD_HEADER_LOGO_SIZE} />
    </View>
  );
}
