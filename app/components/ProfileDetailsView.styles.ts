import type { AnsColors } from '../theme/ansTheme';

const AVATAR_SIZE = 128;

export function createProfileDetailsStyles(c: AnsColors) {
  return {
    root: {
      gap: 16,
    },
    headerCard: {
      backgroundColor: c.surface,
      borderRadius: 22,
      padding: 20,
      borderWidth: 1,
      borderColor: c.grayBorder,
      shadowColor: c.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    headerTopRow: {
      flexDirection: 'row' as const,
      gap: 16,
      alignItems: 'center' as const,
    },
    avatarWrap: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 2,
      borderColor: c.gold,
      overflow: 'hidden' as const,
      backgroundColor: c.surface,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
    },
    avatarPlaceholder: {
      color: c.gold,
      fontSize: 22,
      fontWeight: '800' as const,
    },
    headerCopy: {
      flex: 1,
    },
    headerName: {
      color: c.charcoal,
      fontSize: 26,
      fontWeight: '800' as const,
      lineHeight: 30,
    },
    headerMeta: {
      color: c.gray,
      fontSize: 15,
      marginTop: 8,
      lineHeight: 21,
    },
    chipRow: {
      marginTop: 16,
      flexDirection: 'row' as const,
      gap: 8,
      flexWrap: 'wrap' as const,
    },
    chip: {
      minWidth: 84,
      flexGrow: 1,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.grayBorder,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
    chipLabel: {
      color: c.gray,
      fontSize: 11,
      marginBottom: 4,
    },
    chipValue: {
      color: c.charcoal,
      fontSize: 13,
      fontWeight: '700' as const,
    },
    sectionCard: {
      backgroundColor: c.surface,
      borderRadius: 22,
      padding: 16,
      shadowColor: c.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 4,
      borderWidth: 1,
      borderColor: c.grayBorder,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800' as const,
      color: c.charcoal,
      marginBottom: 12,
    },
    sectionBody: {
      gap: 8,
    },
    fieldRow: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      backgroundColor: c.background,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: c.grayBorder,
    },
    fieldIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(201,162,39,0.14)',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: 8,
      marginTop: 0,
    },
    fieldTextWrap: {
      flex: 1,
    },
    fieldLabel: {
      fontSize: 11,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
      color: c.gray,
      marginBottom: 4,
      fontWeight: '700' as const,
    },
    fieldValue: {
      fontSize: 14,
      lineHeight: 19,
      color: c.charcoal,
      fontWeight: '600' as const,
    },
    groupsStateText: {
      fontSize: 14,
      lineHeight: 19,
      color: c.gray,
      fontWeight: '600' as const,
      paddingVertical: 4,
    },
  };
}

export type ProfileDetailsStyles = ReturnType<typeof createProfileDetailsStyles>;
