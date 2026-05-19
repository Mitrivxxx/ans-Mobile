import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';

export const AVATAR_SIZE = 80;
export const META_ICON_SIZE = 15;

export function createDashboardMiniProfileStyles(c: AnsColors) {
  return StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: c.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: c.gray,
  },
  content: {
    alignItems: 'center',
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: c.gold,
    overflow: 'hidden',
    backgroundColor: c.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarPlaceholder: {
    fontSize: 26,
    fontWeight: '700',
    color: c.goldDark,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: c.charcoal,
    letterSpacing: 0.2,
    textAlign: 'center',
    marginTop: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 5,
    maxWidth: '100%',
  },
  metaText: {
    fontSize: 14,
    color: c.gray,
    lineHeight: 20,
    textAlign: 'center',
    flexShrink: 1,
  },
  emptyText: {
    fontSize: 14,
    color: c.gray,
    textAlign: 'center',
    paddingVertical: 18,
  },
});
}
