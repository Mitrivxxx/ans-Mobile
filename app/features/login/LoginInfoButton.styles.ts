import { StyleSheet } from 'react-native';

import { ansColors } from '../../theme/ansTheme';

export const loginInfoButtonStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: ansColors.surface,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: ansColors.goldDark,
  },
});
