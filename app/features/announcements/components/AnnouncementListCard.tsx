import React from 'react';
import {
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '../../../context/AppThemeContext';
import type { Announcement } from '../../../core/scraper/features/announcements/announcements.types';
import type { createAnnouncementsUiStyles } from '../announcementsUi.styles';
import { resolveAnnouncementListAccentColor } from '../utils/announcementListIconTheme';

type AnnouncementsUiStyles = ReturnType<typeof createAnnouncementsUiStyles>;

type Props = {
  item: Pick<Announcement, 'listIcon'>;
  styles: AnnouncementsUiStyles;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
};

/** Karta ogłoszenia z opcjonalnym paskiem priorytetu (jak ScheduleLessonCard). */
export default function AnnouncementListCard({
  item,
  styles,
  style,
  disabled,
  onPress,
  accessibilityLabel,
  children,
}: Props) {
  const { colors } = useAppTheme();
  const accentColor = resolveAnnouncementListAccentColor(item.listIcon, colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, style, disabled && styles.cardDisabled]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {accentColor ? (
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      ) : null}
      <View style={styles.cardBody}>{children}</View>
    </TouchableOpacity>
  );
}
