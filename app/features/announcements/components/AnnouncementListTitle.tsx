import React from 'react';
import { Text, View } from 'react-native';

import type { Announcement } from '../../../core/scraper/features/announcements/announcements.types';
import { useAppTheme } from '../../../context/AppThemeContext';
import type { createAnnouncementsUiStyles } from '../announcementsUi.styles';
import AnnouncementAttachmentIcon from './AnnouncementAttachmentIcon';

type AnnouncementsUiStyles = ReturnType<typeof createAnnouncementsUiStyles>;

type Props = {
  item: Pick<Announcement, 'title' | 'hasAttachment'>;
  styles: AnnouncementsUiStyles;
};

export default function AnnouncementListTitle({ item, styles }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.hasAttachment ? (
        <AnnouncementAttachmentIcon color={colors.gray} />
      ) : null}
    </View>
  );
}
