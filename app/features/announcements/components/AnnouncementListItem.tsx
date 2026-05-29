import React from 'react';

import type { Announcement } from '../../../core/scraper/features/announcements/announcements.types';
import type { createAnnouncementsUiStyles } from '../announcementsUi.styles';
import { announcementListIconA11ySuffix } from '../utils/announcementListIconTheme';
import AnnouncementListCard from './AnnouncementListCard';
import AnnouncementListTitle from './AnnouncementListTitle';

type AnnouncementsUiStyles = ReturnType<typeof createAnnouncementsUiStyles>;

type Props = {
  item: Announcement;
  styles: AnnouncementsUiStyles;
  isFetching: boolean;
  onPress: () => void;
};

export default function AnnouncementListItem({
  item,
  styles,
  isFetching,
  onPress,
}: Props) {
  return (
    <AnnouncementListCard
      item={item}
      styles={styles}
      disabled={isFetching}
      onPress={onPress}
      accessibilityLabel={`${item.title}${announcementListIconA11ySuffix(item.listIcon)}${
        item.hasAttachment ? ', z załącznikiem' : ''
      }, zobacz szczegóły`}
    >
      <AnnouncementListTitle item={item} styles={styles} />
    </AnnouncementListCard>
  );
}
