import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';

export const SIDEBAR_AVATAR_SIZE = 64;

export function createSidebarProfileHeaderStyles(c: AnsColors) {
  return StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: c.dashboardFeatureBorder,
    backgroundColor: c.surface,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
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
    fontSize: 22,
    fontWeight: '800',
    color: c.goldDark,
  },
  name: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '800',
    color: c.charcoal,
    lineHeight: 22,
    textAlign: 'center',
  },
  major: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: c.gray,
    textAlign: 'center',
  },
  album: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
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
