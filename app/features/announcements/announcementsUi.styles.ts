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
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.dashboardFeatureBorder,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    cardAccent: {
      width: 6,
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
      padding: 16,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 10,
    },
    cardMain: {
      flex: 1,
      minWidth: 0,
    },
    cardMainCentered: {
      justifyContent: 'center',
    },
    cardDisabled: {
      opacity: 0.7,
    },
    archiveButton: {
      alignSelf: 'center',
      maxWidth: 96,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.goldDark,
      backgroundColor: c.dashboardBg,
      justifyContent: 'center',
    },
    archiveButtonInDetails: {
      marginTop: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.goldDark,
      backgroundColor: c.dashboardBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    archiveButtonPressed: {
      opacity: 0.75,
    },
    archiveButtonText: {
      fontSize: 11,
      fontWeight: '600',
      color: c.goldDark,
      textAlign: 'center',
      lineHeight: 14,
    },
    archiveButtonArchived: {
      borderColor: c.error,
      backgroundColor: c.errorBg,
    },
    archiveButtonTextArchived: {
      color: c.error,
    },
    archiveRemoveButton: {
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.error,
      backgroundColor: c.errorBg,
      alignSelf: 'flex-start',
    },
    archiveRemoveButtonPressed: {
      opacity: 0.75,
    },
    archiveRemoveButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.error,
    },
    archiveSavedAt: {
      fontSize: 12,
      color: c.gray,
      marginTop: 4,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 6,
    },
    cardTitle: {
      flex: 1,
      minWidth: 0,
      fontSize: 16,
      fontWeight: '700',
      color: c.charcoal,
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
    attachmentCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: c.dashboardFeatureBorder,
      marginBottom: 12,
    },
    attachmentLabel: {
      fontSize: 12,
      color: c.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 8,
    },
    attachmentLink: {
      fontSize: 14,
      fontWeight: '600',
      color: c.goldDark,
    },
    contentText: {
      fontSize: 14,
      lineHeight: 20,
      color: c.charcoal,
    },
  });
}
