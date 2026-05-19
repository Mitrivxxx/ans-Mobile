import React from 'react';
import { View } from 'react-native';

import AppLogo from '../../../components/AppLogo';
import {
  DASHBOARD_HEADER_LOGO_SIZE,
  dashboardHeaderBackgroundStyles as styles,
} from './DashboardHeaderBackground.styles';

export default function DashboardHeaderBackground() {
  return (
    <View style={styles.root}>
      <AppLogo size={DASHBOARD_HEADER_LOGO_SIZE} />
    </View>
  );
}
