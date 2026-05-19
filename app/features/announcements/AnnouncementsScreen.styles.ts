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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.dashboardBg,
    paddingHorizontal: 24,
    gap: 10,
  },
  centerStateScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.dashboardBg,
    paddingHorizontal: 24,
    gap: 10,
  },
  stateText: {
    fontSize: 15,
    color: c.gray,
    textAlign: 'center',
  },
  errorText: {
    color: c.error,
    fontSize: 15,
    textAlign: 'center',
  },
  infoText: {
    color: c.gray,
    fontSize: 14,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: c.charcoal,
  },
  retryButtonText: {
    color: c.surface,
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
    paddingVertical: 40,
    alignItems: 'center',
  },
  detailsContent: {
    paddingBottom: 24,
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
