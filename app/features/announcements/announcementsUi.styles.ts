import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';

/** Wspólne style listy i szczegółów ogłoszeń (ekran + dashboard). */
export function createAnnouncementsUiStyles(c: AnsColors) {
  return StyleSheet.create({
    list: {
      gap: 12,
    },
    centerState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      gap: 10,
    },
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
    infoText: {
      color: c.gray,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 8,
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
    cardDisabled: {
      opacity: 0.7,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.charcoal,
      marginBottom: 6,
    },
    cardAuthor: {
      fontSize: 13,
      color: c.gray,
      marginBottom: 4,
    },
    cardAction: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: '600',
      color: c.goldDark,
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
    contentCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: c.dashboardFeatureBorder,
    },
    contentText: {
      fontSize: 14,
      lineHeight: 20,
      color: c.charcoal,
    },
  });
}
