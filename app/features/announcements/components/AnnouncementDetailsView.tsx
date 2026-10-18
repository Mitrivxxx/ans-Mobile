import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '../../../context/AppThemeContext';
import type { AnnouncementDetails } from '../../../core/scraper/features/announcements/announcements.types';
import type { createAnnouncementsUiStyles } from '../announcementsUi.styles';
import AnnouncementContentText from './AnnouncementContentText';

type AnnouncementsUiStyles = ReturnType<typeof createAnnouncementsUiStyles>;

type ArchiveAction = {
  isArchived: boolean;
  isArchiving: boolean;
  onToggle: () => void;
};

type Props = {
  selected: AnnouncementDetails;
  styles: AnnouncementsUiStyles;
  onBack: () => void;
  backLabel?: string;
  archiveAction?: ArchiveAction;
};

export default function AnnouncementDetailsView({
  selected,
  styles,
  onBack,
  backLabel = 'Lista ogłoszeń',
  archiveAction,
}: Props) {
  const { colors } = useAppTheme();

  const handleOpenAttachment = React.useCallback(async () => {
    if (!selected.attachmentUrl) {
      return;
    }

    try {
      const supported = await Linking.canOpenURL(selected.attachmentUrl);
      if (!supported) {
        Alert.alert('Nie można otworzyć linku', selected.attachmentUrl);
        return;
      }
      await Linking.openURL(selected.attachmentUrl);
    } catch {
      Alert.alert('Nie można otworzyć linku', selected.attachmentUrl);
    }
  }, [selected.attachmentUrl]);

  const archiveLabel = archiveAction?.isArchived
    ? 'Usuń z archiwum'
    : 'Dodaj do archiwum';

  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsToolbar}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.detailsBackButton,
            pressed && styles.detailsBackButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={colors.charcoal}
          />
          <Text style={styles.detailsBackLabel} numberOfLines={1}>
            {backLabel}
          </Text>
        </Pressable>

        {archiveAction ? (
          <Pressable
            onPress={archiveAction.onToggle}
            disabled={archiveAction.isArchiving}
            style={({ pressed }) => [
              styles.detailsArchiveButton,
              archiveAction.isArchived && styles.detailsArchiveButtonArchived,
              pressed && styles.archiveButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={archiveLabel}
          >
            {archiveAction.isArchiving ? (
              <ActivityIndicator size="small" color={colors.goldDark} />
            ) : (
              <Text
                style={[
                  styles.detailsArchiveButtonText,
                  archiveAction.isArchived &&
                    styles.detailsArchiveButtonTextArchived,
                ]}
              >
                {archiveLabel}
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Nadawca</Text>
          <Text style={styles.metaValueBold} numberOfLines={3}>
            {selected.authorName || '-'}
          </Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Data</Text>
          <Text style={styles.metaValueBold}>{selected.date || '-'}</Text>
        </View>
      </View>

      <View style={styles.contentCard}>
        <AnnouncementContentText
          html={selected.content}
          baseStyle={styles.contentText}
        />
      </View>

      {selected.attachmentUrl ? (
        <View style={styles.attachmentCard}>
          <View style={styles.attachmentHeader}>
            <View style={styles.attachmentIconCircle}>
              <MaterialCommunityIcons
                name="paperclip"
                size={18}
                color={colors.attachmentAccent}
              />
            </View>
            <Text style={styles.attachmentLabel}>Załącznik</Text>
          </View>
          <Pressable onPress={handleOpenAttachment} accessibilityRole="link">
            <Text style={styles.attachmentLink}>
              {selected.attachmentName || 'Pobierz plik'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
