import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useAppTheme } from '../../../context/AppThemeContext';
import type { ArchivedAnnouncement } from '../../../core/announcements/archive/announcementsArchive.types';
import { createAnnouncementsUiStyles } from '../announcementsUi.styles';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import AnnouncementArchiveListItem from './AnnouncementArchiveListItem';
import { createAnnouncementsArchiveViewStyles } from './AnnouncementsArchiveView.styles';

type AnnouncementsUiStyles = ReturnType<typeof createAnnouncementsUiStyles>;

type Props = {
  items: ArchivedAnnouncement[];
  isLoading: boolean;
  removingId: string | null;
  uiStyles: AnnouncementsUiStyles;
  onOpen: (item: ArchivedAnnouncement) => void;
  onRemove: (id: string) => void;
};

export default function AnnouncementsArchiveView({
  items,
  isLoading,
  removingId,
  uiStyles,
  onOpen,
  onRemove,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createAnnouncementsArchiveViewStyles);

  return (
    <View style={styles.wrap}>
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Archiwum ogłoszeń</Text>
        <Text style={styles.noteText}>
          Ogłoszenia zapisane w archiwum są przechowywane przez 6 miesięcy od daty
          archiwizacji. Po tym czasie zostaną automatycznie usunięte. Uwaga:
          załączniki nie są zapisywane w archiwum.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.emptyText}>Wczytywanie archiwum…</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Brak zapisanych ogłoszeń</Text>
        </View>
      ) : (
        <View style={uiStyles.list}>
          {items.map((item) => (
            <AnnouncementArchiveListItem
              key={item.id}
              item={item}
              styles={uiStyles}
              isRemoving={removingId === item.id}
              onPress={() => onOpen(item)}
              onRemove={() => onRemove(item.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
