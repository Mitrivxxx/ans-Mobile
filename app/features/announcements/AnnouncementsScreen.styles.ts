import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';

export function createAnnouncementsScreenStyles(c: AnsColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.dashboardBg,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    listContent: {
      paddingBottom: 24,
      gap: 12,
    },
    listHeader: {
      marginBottom: 12,
      gap: 6,
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
    archiveContent: {
      paddingBottom: 24,
    },
  });
}
