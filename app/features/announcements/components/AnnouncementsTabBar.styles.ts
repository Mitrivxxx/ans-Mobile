import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';

export function createAnnouncementsTabBarStyles(c: AnsColors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.dashboardFeatureBorder,
      backgroundColor: c.surface,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: c.gold,
      borderColor: c.gold,
    },
    tabPressed: {
      opacity: 0.85,
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: c.charcoal,
    },
    tabLabelActive: {
      color: c.black,
    },
  });
}
