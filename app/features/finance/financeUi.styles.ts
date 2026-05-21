import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';

export function createFinanceUiStyles(c: AnsColors) {
  return StyleSheet.create({
    stateText: {
      marginTop: 8,
      fontSize: 14,
      color: c.gray,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: c.error,
      textAlign: 'center',
      marginBottom: 12,
    },
    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: c.black,
      marginTop: 8,
    },
    retryButtonText: {
      color: c.gold,
      fontWeight: '700',
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: c.dashboardFeatureBorder,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.charcoal,
      marginBottom: 10,
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12,
      marginTop: 4,
    },
    cardLabel: {
      fontSize: 12,
      color: c.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardValue: {
      flex: 1,
      fontSize: 13,
      color: c.charcoal,
      textAlign: 'right',
      fontWeight: '500',
    },
    statusPaid: {
      color: '#2D8C6E',
      fontWeight: '700',
    },
    statusUnpaid: {
      color: c.error,
      fontWeight: '700',
    },
    statusUnknown: {
      color: c.charcoal,
      fontWeight: '600',
    },
    cardAction: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: '600',
      color: c.goldDark,
    },
    emptyState: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    detailsCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: c.dashboardFeatureBorder,
      marginBottom: 12,
    },
    detailsSectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.charcoal,
      marginTop: 12,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12,
      marginTop: 6,
    },
    metaLabel: {
      fontSize: 12,
      color: c.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    metaValue: {
      flex: 1,
      fontSize: 13,
      color: c.charcoal,
      textAlign: 'right',
    },
  });
}

export function paymentStatusStyle(
  styles: ReturnType<typeof createFinanceUiStyles>,
  tone: 'paid' | 'unpaid' | 'unknown'
) {
  if (tone === 'paid') {
    return styles.statusPaid;
  }
  if (tone === 'unpaid') {
    return styles.statusUnpaid;
  }
  return styles.statusUnknown;
}
