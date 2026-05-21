import React from 'react';
import { Text, View } from 'react-native';

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
    </View>
  );
}
