import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AnnouncementsService,
  type Announcement,
} from '../../../core/scraper/features/announcements/announcements.service';
import { ansColors } from '../../../theme/ansTheme';
import { isWithinLastDays } from '../utils/announcementDate';
import { dashboardAnnouncementsPanelStyles as styles } from './DashboardAnnouncementsPanel.styles';

const RECENT_WINDOW_DAYS = 7;

export default function DashboardAnnouncementsPanel() {
  const announcementsService = useMemo(() => new AnnouncementsService(), []);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await announcementsService.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('[DASHBOARD ANNOUNCEMENTS]', err);
      setError('Nie udało się pobrać ogłoszeń');
    } finally {
      setLoading(false);
    }
  }, [announcementsService]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const recentAnnouncements = useMemo(
    () =>
      announcements.filter((item) =>
        isWithinLastDays(item.date, RECENT_WINDOW_DAYS)
      ),
    [announcements]
  );

  if (loading) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <ActivityIndicator color={ansColors.gold} />
          <Text style={styles.stateText}>Wczytywanie ogłoszeń...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={fetchAnnouncements}
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
