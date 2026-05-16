import { StyleSheet } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';

export const gradesSummaryCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#31ABA0',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 148,
  },
  averageBlock: {
    flexShrink: 0,
    paddingRight: 20,
    maxWidth: '40%',
  },
  label: {
    fontSize: 14,
    color: ansColors.surface,
    marginBottom: 10,
  },
  averageValue: {
    fontSize: 32,
    fontWeight: '700',
    color: ansColors.surface,
    lineHeight: 36,
  },
  detailsBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 2,
  },
  detailLine: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  detailLabel: {
    color: ansColors.surface,
  },
  detailValue: {
    fontWeight: '700',
    color: ansColors.surface,
  },
});
