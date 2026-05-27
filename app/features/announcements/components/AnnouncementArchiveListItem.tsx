import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAppTheme } from '../../../context/AppThemeContext';
import type { ArchivedAnnouncement } from '../../../core/announcements/archive/announcementsArchive.types';
import type { createAnnouncementsUiStyles } from '../announcementsUi.styles';

type AnnouncementsUiStyles = ReturnType<typeof createAnnouncementsUiStyles>;

type Props = {
  item: ArchivedAnnouncement;
  styles: AnnouncementsUiStyles;
  isRemoving: boolean;
  onPress: () => void;
  onRemove: () => void;
};

function formatSavedAt(savedAt: number): string {
  return new Date(savedAt).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AnnouncementArchiveListItem({
  item,
  styles,
  isRemoving,
  onPress,
  onRemove,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, zobacz szczegóły`}
      >
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.cardAuthor} numberOfLines={1}>
          {item.authorName}
        </Text>

        <Text style={styles.archiveSavedAt}>
          Zapisano: {formatSavedAt(item.savedAt)}
        </Text>

        <Text style={styles.cardAction}>Zobacz szczegóły →</Text>
      </TouchableOpacity>

      <Pressable
        onPress={onRemove}
        disabled={isRemoving}
        style={({ pressed }) => [
          styles.archiveRemoveButton,
          pressed && styles.archiveRemoveButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Usuń z archiwum"
      >
        {isRemoving ? (
          <ActivityIndicator size="small" color={colors.error} />
        ) : (
          <Text style={styles.archiveRemoveButtonText}>Usuń z archiwum</Text>
        )}
      </Pressable>
    </View>
  );
}
