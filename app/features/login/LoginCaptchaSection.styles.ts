import { StyleSheet } from 'react-native';

import { ansColors } from '../../theme/ansTheme';

export const loginCaptchaStyles = StyleSheet.create({
  block: {
    marginBottom: 8,
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: ansColors.surface,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: ansColors.charcoal,
    marginBottom: 12,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    maxWidth: 280,
    height: 88,
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: ansColors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
  },
  fallback: {
    fontSize: 13,
    color: ansColors.gray,
    textAlign: 'center',
    marginBottom: 10,
  },
  refresh: {
    alignSelf: 'center',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  refreshText: {
    color: ansColors.goldDark,
    fontSize: 14,
    fontWeight: '600',
  },
});
