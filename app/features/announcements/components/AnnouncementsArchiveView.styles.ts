import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';

export function createAnnouncementsArchiveViewStyles(c: AnsColors) {
  return StyleSheet.create({
    wrap: {
      gap: 16,
    },
    noteCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: c.dashboardFeatureBorder,
      gap: 8,
    },
    noteTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.charcoal,
    },
    noteText: {
      fontSize: 14,
      lineHeight: 20,
      color: c.gray,
    },
    emptyState: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: c.gray,
      textAlign: 'center',
    },
  });
}
