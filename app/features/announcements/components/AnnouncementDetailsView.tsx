import React from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import ScreenBackButton from '../../../components/ScreenBackButton';
import type { AnnouncementDetails } from '../../../core/scraper/features/announcements/announcements.types';
import type { createAnnouncementsUiStyles } from '../announcementsUi.styles';
import AnnouncementContentText from './AnnouncementContentText';

type AnnouncementsUiStyles = ReturnType<typeof createAnnouncementsUiStyles>;

type Props = {
  selected: AnnouncementDetails;
  styles: AnnouncementsUiStyles;
  onBack: () => void;
  backLabel?: string;
};

export default function AnnouncementDetailsView({
  selected,
  styles,
  onBack,
  backLabel = '← Lista ogłoszeń',
}: Props) {
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

  return (
    <View>
      <ScreenBackButton label={backLabel} onPress={onBack} />

      <View style={styles.detailsCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Nadawca</Text>
          <Text style={styles.metaValue} numberOfLines={2}>
            {selected.authorName || '-'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Data</Text>
          <Text style={styles.metaValue}>{selected.date || '-'}</Text>
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
          <Text style={styles.attachmentLabel}>Załącznik</Text>
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
