import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

function eventsPalette(
  c: AnsColors,
  isDarkMode: boolean,
  departmentColor?: string | null
) {
  if (departmentColor) {
    return {
      background: departmentColor,
      text: '#FFFFFF',
      titleUnderline: '#FFFFFF',
      divider: 'rgba(255, 255, 255, 0.24)',
      dropdownBackground: 'rgba(255, 255, 255, 0.14)',
      dropdownBorder: 'rgba(255, 255, 255, 0.35)',
      dropdownText: '#FFFFFF',
      dropdownItemPressed: 'rgba(255, 255, 255, 0.16)',
    };
  }

  if (isDarkMode) {
    return {
      background: '#1A4D3E',
      text: '#FFFFFF',
      titleUnderline: '#FFFFFF',
      divider: 'rgba(255, 255, 255, 0.22)',
      dropdownBackground: 'rgba(255, 255, 255, 0.14)',
      dropdownBorder: 'rgba(255, 255, 255, 0.35)',
      dropdownText: '#FFFFFF',
      dropdownItemPressed: 'rgba(255, 255, 255, 0.16)',
    };
  }

  return {
    background: '#E8F2EE',
    text: '#1A4D3E',
    titleUnderline: '#1A4D3E',
    divider: 'rgba(26, 77, 62, 0.18)',
    dropdownBackground: 'rgba(255, 255, 255, 0.72)',
    dropdownBorder: 'rgba(26, 77, 62, 0.22)',
    dropdownText: '#1A4D3E',
    dropdownItemPressed: 'rgba(26, 77, 62, 0.08)',
  };
}

export function createDashboardEventsSectionStyles(
  c: AnsColors,
  isDarkMode: boolean,
  departmentColor?: string | null
) {
  const palette = eventsPalette(c, isDarkMode, departmentColor);

  return StyleSheet.create({
    wrap: {
      paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
      paddingTop: 24,
      paddingBottom: 6,
    },
    card: {
      borderRadius: 21,
      backgroundColor: palette.background,
      paddingTop: 22,
      paddingBottom: 24,
      paddingHorizontal: 16,
      overflow: 'hidden',
    },
    headerRow: {
      alignItems: 'center',
      marginBottom: 18,
      paddingHorizontal: 4,
    },
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '600',
      color: palette.text,
      letterSpacing: 0.3,
      textAlign: 'center',
    },
    titleUnderline: {
      marginTop: 6,
      height: 2,
      width: '100%',
      maxWidth: 180,
      backgroundColor: palette.titleUnderline,
      alignSelf: 'center',
    },
    dropdownWrap: {
      marginTop: 12,
      width: '100%',
      maxWidth: 320,
      alignSelf: 'center',
      zIndex: 2,
    },
    dropdownButton: {
      minHeight: 36,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.dropdownBorder,
      backgroundColor: palette.dropdownBackground,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdownButtonText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: palette.dropdownText,
      fontWeight: '600',
    },
    dropdownChevron: {
      marginLeft: 10,
      fontSize: 12,
      color: palette.dropdownText,
      opacity: 0.85,
    },
    dropdownMenu: {
      marginTop: 8,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.dropdownBorder,
      backgroundColor: palette.dropdownBackground,
      overflow: 'hidden',
    },
    dropdownItem: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    dropdownItemPressed: {
      backgroundColor: palette.dropdownItemPressed,
    },
    dropdownItemText: {
      fontSize: 13,
      lineHeight: 18,
      color: palette.dropdownText,
    },
    dropdownItemTextActive: {
      fontWeight: '700',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    item: {
      flex: 1,
      paddingHorizontal: 6,
      alignItems: 'center',
    },
    itemDivider: {
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: palette.divider,
    },
    day: {
      fontSize: 34,
      lineHeight: 38,
      fontWeight: '700',
      color: palette.text,
      textAlign: 'center',
    },
    month: {
      marginTop: 2,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: palette.text,
      textAlign: 'center',
    },
    eventTitle: {
      marginTop: 12,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '500',
      color: palette.text,
      textAlign: 'center',
    },
    loadingWrap: {
      minHeight: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 8,
      fontSize: 13,
      color: palette.text,
      opacity: 0.75,
    },
  });
}
