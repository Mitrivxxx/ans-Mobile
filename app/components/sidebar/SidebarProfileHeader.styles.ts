import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';

export const SIDEBAR_AVATAR_SIZE = 78;

export function createSidebarProfileHeaderStyles(c: AnsColors) {
  return StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.dashboardFeatureBorder,
    backgroundColor: c.surface,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    left: 8,
    zIndex: 1,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  closeButtonPressed: {
    opacity: 0.7,
    backgroundColor: c.dashboardFeatureBg,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: c.gray,
  },
  avatarWrap: {
    width: SIDEBAR_AVATAR_SIZE,
    height: SIDEBAR_AVATAR_SIZE,
    borderRadius: SIDEBAR_AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: c.gold,
    overflow: 'hidden',
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: SIDEBAR_AVATAR_SIZE,
    height: SIDEBAR_AVATAR_SIZE,
  },
  avatarPlaceholder: {
    fontSize: 28,
    fontWeight: '800',
    color: c.goldDark,
  },
  name: {
    marginTop: 10,
    fontSize: 19,
    fontWeight: '800',
    color: c.charcoal,
    lineHeight: 24,
    textAlign: 'center',
  },
  major: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 19,
    color: c.gray,
    textAlign: 'center',
  },
  album: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 19,
    color: c.gray,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: c.gray,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: c.goldDark,
  },
});
}
