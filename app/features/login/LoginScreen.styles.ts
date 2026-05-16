import { StyleSheet } from 'react-native';

import { ansColors } from '../../theme/ansTheme';
import { LOGIN_INPUT_HEIGHT } from './LoginIconInput.styles';

/** Dodatkowa przestrzeń pod przyciskiem — więcej scrolla w dół nad klawiaturą. */
export const LOGIN_SCROLL_BOTTOM_PADDING = 140;
export const LOGIN_SCROLL_BOTTOM_PADDING_CAPTCHA = 220;

export const loginScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ansColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: LOGIN_SCROLL_BOTTOM_PADDING,
  },
  scrollContentWithCaptcha: {
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingBottom: LOGIN_SCROLL_BOTTOM_PADDING_CAPTCHA,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 141,
    height: 141,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: ansColors.charcoal,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    color: ansColors.gray,
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  button: {
    height: LOGIN_INPUT_HEIGHT,
    borderRadius: LOGIN_INPUT_HEIGHT / 2,
    backgroundColor: ansColors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: ansColors.goldDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: ansColors.black,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  formError: {
    fontSize: 14,
    lineHeight: 20,
    color: ansColors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
});
