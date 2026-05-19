import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';

export function createDashboardFeaturesSectionStyles(c: AnsColors) {
  return StyleSheet.create({
  block: {
    width: '100%',
    backgroundColor: c.dashboardBg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: c.charcoal,
    letterSpacing: 0.2,
    marginBottom: 16,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
});
}
