import { StyleSheet } from 'react-native';

import { ansColors } from '../../theme/ansTheme';

export const LOGIN_INPUT_HEIGHT = 56;

export const loginIconInputStyles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: LOGIN_INPUT_HEIGHT,
    backgroundColor: ansColors.surface,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    borderRadius: LOGIN_INPUT_HEIGHT / 2,
    paddingHorizontal: 18,
  },
  fieldError: {
    marginTop: 6,
    marginLeft: 18,
    fontSize: 13,
    color: ansColors.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: ansColors.charcoal,
    paddingVertical: 0,
  },
});
