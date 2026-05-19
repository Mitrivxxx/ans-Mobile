import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ansColors } from '../../../theme/ansTheme';
import { useAnnouncementsQuery } from '../../announcements/hooks/useAnnouncementsQuery';
import { isWithinLastDays } from '../utils/announcementDate';
import { dashboardAnnouncementsPanelStyles as styles } from './DashboardAnnouncementsPanel.styles';
import { useRegisterScreenRefresh } from '../../../hooks/useRegisterScreenRefresh';

const RECENT_WINDOW_DAYS = 7;

export default function DashboardAnnouncementsPanel() {
  const { announcements, isInitialLoading, isFatalError, refetch } =
    useAnnouncementsQuery();

  useRegisterScreenRefresh(async () => {
    await refetch();
  });

  const recentAnnouncements = useMemo(
    () =>
      announcements.filter((item) =>
        isWithinLastDays(item.date, RECENT_WINDOW_DAYS)
      ),
    [announcements]
  );

  if (isInitialLoading) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <ActivityIndicator color={ansColors.gold} />
          <Text style={styles.stateText}>Wczytywanie ogłoszeń...</Text>
        </View>
      </View>
    );
  }

  if (isFatalError) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>Nie udało się pobrać ogłoszeń</Text>
          <TouchableOpacity
            onPress={() => void refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (recentAnnouncements.length === 0) {
    return (
      <View style={styles.wrap}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Brak nowych ogłoszeń w ciągu ostatnich 7 dni
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.list}>
        {recentAnnouncements.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaAuthor} numberOfLines={1}>
                {item.authorName}
              </Text>
              {item.date ? (
                <Text style={styles.metaDate}>{item.date}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
