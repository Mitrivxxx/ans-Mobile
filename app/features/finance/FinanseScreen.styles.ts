import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';

export function createFinanseScreenStyles(c: AnsColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.dashboardBg,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    listHeader: {
      paddingBottom: 0,
    },
    listContent: {
      paddingBottom: 24,
      gap: 12,
    },
    centerStateScroll: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.dashboardBg,
      paddingHorizontal: 24,
      gap: 10,
    },
    detailsContent: {
      paddingBottom: 24,
    },
  });
}
