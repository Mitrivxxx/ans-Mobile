import { Dimensions, StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';

export const SIDEBAR_WIDTH = Math.min(300, Dimensions.get('window').width * 0.86);

export function createAppSidebarStyles(c: AnsColors) {
  return StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  rootHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: c.surface,
    borderRightWidth: 1,
    borderRightColor: c.dashboardFeatureBorder,
    shadowColor: c.black,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
    gap: 12,
  },
  menuItemPressed: {
    opacity: 0.85,
  },
  menuItemActive: {
    backgroundColor: c.dashboardBluePale,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: c.charcoal,
  },
  menuTitleActive: {
    color: c.dashboardBlue,
  },
  menuDescription: {
    fontSize: 12,
    color: c.gray,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: c.dashboardFeatureBorder,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: c.errorBg,
    borderWidth: 1,
    borderColor: c.grayBorder,
  },
  logoutButtonDisabled: {
    opacity: 0.65,
  },
  logoutLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: c.error,
  },
});
}
