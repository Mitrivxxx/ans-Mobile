import { StyleSheet } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';

export const dashboardFeaturesSectionStyles = StyleSheet.create({
  block: {
    width: '100%',
    backgroundColor: ansColors.dashboardBg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: ansColors.charcoal,
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
