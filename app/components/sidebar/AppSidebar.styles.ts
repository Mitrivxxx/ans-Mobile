// Style bocznego menu aplikacji.
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
    backgroundColor: c.backdrop,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: c.surfaceRaised,
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
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 2,
    gap: 14,
  },
  menuItemPressed: {
    opacity: 0.85,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 2,
  },
  iconSlot: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: c.charcoal,
  },
  menuTitleActive: {
    fontWeight: '700',
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
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
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
