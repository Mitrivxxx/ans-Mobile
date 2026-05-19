import { StyleSheet } from 'react-native';

import { LOGIN_INPUT_HEIGHT } from '../../../features/login/LoginIconInput.styles';
import type { AnsColors } from '../../../theme/ansTheme';

export function createDashboardLogoutSectionStyles(c: AnsColors) {
  return StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: LOGIN_INPUT_HEIGHT,
    borderRadius: LOGIN_INPUT_HEIGHT / 2,
    marginTop: 16,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.grayBorder,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: c.error,
  },
});
}
