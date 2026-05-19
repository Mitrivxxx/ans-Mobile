import { StyleSheet } from 'react-native';

import { ansColors } from '../theme/ansTheme';

export const APP_HEADER_HEIGHT = 64;
export const APP_HEADER_LOGO_SIZE = 44;
export const APP_HEADER_AVATAR_SIZE = 46;
export const APP_HEADER_SIDE_WIDTH = 48;

export const appHeaderStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: ansColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ansColors.dashboardFeatureBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: APP_HEADER_HEIGHT,
    paddingHorizontal: 16,
  },
  side: {
    width: APP_HEADER_SIDE_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    width: APP_HEADER_SIDE_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    width: APP_HEADER_AVATAR_SIZE,
    height: APP_HEADER_AVATAR_SIZE,
    borderRadius: APP_HEADER_AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: ansColors.background,
    borderWidth: 1.5,
    borderColor: ansColors.dashboardFeatureBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: APP_HEADER_AVATAR_SIZE,
    height: APP_HEADER_AVATAR_SIZE,
  },
  avatarPlaceholder: {
    fontSize: 16,
    fontWeight: '800',
    color: ansColors.goldDark,
  },
  avatarLoading: {
    width: APP_HEADER_AVATAR_SIZE,
    height: APP_HEADER_AVATAR_SIZE,
    borderRadius: APP_HEADER_AVATAR_SIZE / 2,
    backgroundColor: ansColors.dashboardBg,
  },
});
