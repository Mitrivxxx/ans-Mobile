import React from 'react';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import { Text, View } from 'react-native';

import { createDashboardInfoBannerStyles } from './DashboardInfoBanner.styles';

/** Tymczasowa treść — docelowo z API / konfiguracji. */
export const DASHBOARD_INFO_BANNER_DEV_MESSAGE =
  'Twoje zamówienie jest w toku. Przetwarzanie zamówienia może potrwać maksymalnie dobę.';

type Props = {
  message?: string;
};

export default function DashboardInfoBanner({
  message = DASHBOARD_INFO_BANNER_DEV_MESSAGE,
}: Props) {
  const styles = useThemedStyles(createDashboardInfoBannerStyles);
  if (!message.trim()) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.banner} accessibilityRole="text">
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}
