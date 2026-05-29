import { StyleSheet } from 'react-native';

import { ansColors } from '../../theme/ansTheme';

const CONTEXT_ICON_GREEN = '#1B5E3A';

export const loginContextSelectionStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: ansColors.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    shadowColor: ansColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CONTEXT_ICON_GREEN,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: ansColors.charcoal,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: ansColors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: ansColors.surface,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionText: {
    flex: 1,
    paddingRight: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ansColors.charcoal,
    lineHeight: 20,
  },
  optionSubtitle: {
    fontSize: 13,
    color: ansColors.gray,
    marginTop: 4,
    lineHeight: 18,
  },
  optionChevron: {
    fontSize: 18,
    color: ansColors.gray,
    fontWeight: '600',
  },
  formError: {
    fontSize: 14,
    lineHeight: 20,
    color: ansColors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignSelf: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: ansColors.gray,
    textDecorationLine: 'underline',
  },
});
