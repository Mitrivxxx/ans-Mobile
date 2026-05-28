import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAppTheme } from '../../../context/AppThemeContext';
import type { Announcement } from '../../../core/scraper/features/announcements/announcements.types';
import type { createAnnouncementsUiStyles } from '../announcementsUi.styles';

type AnnouncementsUiStyles = ReturnType<typeof createAnnouncementsUiStyles>;

type Props = {
  item: Announcement;
  styles: AnnouncementsUiStyles;
  isFetching: boolean;
  isArchived: boolean;
  isArchiving: boolean;
  onPress: () => void;
  onToggleArchive: () => void;
};

export default function AnnouncementListItem({
  item,
  styles,
  isFetching,
  isArchived,
  isArchiving,
  onPress,
  onToggleArchive,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isFetching}
      style={[styles.card, isFetching && styles.cardDisabled]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, zobacz szczegóły`}
    >
      <View style={styles.cardRow}>
        <View style={[styles.cardMain, styles.cardMainCentered]}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>

        <Pressable
          onPress={onToggleArchive}
          disabled={isArchiving}
          style={({ pressed }) => [
            styles.archiveButton,
            isArchived && styles.archiveButtonArchived,
            pressed && styles.archiveButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isArchived ? 'Usuń z archiwum' : 'Dodaj do archiwum'
          }
        >
          {isArchiving ? (
            <ActivityIndicator size="small" color={colors.goldDark} />
          ) : (
            <Text
              style={[
                styles.archiveButtonText,
                isArchived && styles.archiveButtonTextArchived,
              ]}
            >
              {isArchived ? 'Usuń z archiwum' : 'Dodaj do archiwum'}
            </Text>
          )}
        </Pressable>
      </View>
    </TouchableOpacity>
  );
}
