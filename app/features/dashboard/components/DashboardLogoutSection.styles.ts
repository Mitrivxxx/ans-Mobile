import { StyleSheet } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';
import { LOGIN_INPUT_HEIGHT } from '../../../features/login/LoginIconInput.styles';

export const dashboardLogoutSectionStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: LOGIN_INPUT_HEIGHT,
    borderRadius: LOGIN_INPUT_HEIGHT / 2,
    marginTop: 16,
    backgroundColor: ansColors.surface,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: ansColors.error,
  },
});
