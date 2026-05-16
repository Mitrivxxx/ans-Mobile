import { StyleSheet } from 'react-native';

import { gradesColors } from './gradesTheme';

export const GRADES_HORIZONTAL_PADDING = 20;

export const gradesScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: gradesColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: GRADES_HORIZONTAL_PADDING,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 12,
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    color: gradesColors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: gradesColors.text,
    letterSpacing: 0.2,
    marginBottom: 20,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: GRADES_HORIZONTAL_PADDING,
    gap: 16,
  },
  stateText: {
    fontSize: 16,
    color: gradesColors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: gradesColors.primary,
  },
  retryText: {
    color: gradesColors.surface,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 15,
    color: gradesColors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  subjectList: {
    gap: 12,
    marginTop: 4,
  },
});
