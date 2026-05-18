import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AnnouncementsService,
  type Announcement,
  type AnnouncementDetails,
} from '../core/scraper/features/announcements/announcements.service';
import { ansColors } from '../theme/ansTheme';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function AnnouncementsScreen({ navigation }: Props) {
  const announcementsService = useMemo(() => new AnnouncementsService(), []);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selected, setSelected] = useState<AnnouncementDetails | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSelected(null);
      setSelectedId(null);
      const data = await announcementsService.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('[ANNOUNCEMENTS SCREEN]', err);
      setError('Nie udało się pobrać ogłoszeń');
    } finally {
      setLoading(false);
    }
  }, [announcementsService]);

  const fetchDetails = useCallback(
    async (item: Announcement) => {
      try {
        setDetailsLoading(true);
        setError('');
        setSelectedId(item.id);
        const data = await announcementsService.getAnnouncementDetails(
          item.url || item.id
        );
        setSelected(data);
      } catch (err) {
        console.error('[ANNOUNCEMENTS SCREEN] details', err);
        setError('Nie udało się pobrać szczegółów ogłoszenia');
        setSelected(null);
        setSelectedId(null);
      } finally {
        setDetailsLoading(false);
      }
    },
    [announcementsService]
  );

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const normalizeContent = useCallback((value: string) => {
    return value.replace(/<br\s*\/?>/gi, '\n');
  }, []);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={ansColors.gold} />
        <Text style={styles.stateText}>Wczytywanie ogłoszeń...</Text>
      </View>
    );
  }

  if (error && announcements.length === 0 && !selected) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchAnnouncements} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (selected) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => {
            setSelected(null);
            setSelectedId(null);
          }}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>← Lista ogłoszeń</Text>
        </TouchableOpacity>

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
          <Text style={styles.contentText}>
            {selected.content ? normalizeContent(selected.content) : '-'}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          error || detailsLoading ? (
            <View style={styles.listHeader}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {detailsLoading ? (
                <Text style={styles.infoText}>Wczytywanie szczegółów...</Text>
              ) : null}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.stateText}>Brak ogłoszeń</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isFetching = detailsLoading && selectedId === item.id;

          return (
            <TouchableOpacity
              onPress={() => fetchDetails(item)}
              disabled={isFetching}
              style={[styles.card, isFetching && styles.cardDisabled]}
              accessibilityRole="button"
            >
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={styles.cardAuthor} numberOfLines={1}>
                {item.authorName}
              </Text>

              <Text style={styles.cardAction}>
                {isFetching ? 'Wczytywanie…' : 'Zobacz szczegóły →'}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ansColors.dashboardBg,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  listHeader: {
    marginBottom: 12,
    gap: 6,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ansColors.dashboardBg,
    paddingHorizontal: 24,
    gap: 10,
  },
  stateText: {
    fontSize: 15,
    color: ansColors.gray,
    textAlign: 'center',
  },
  errorText: {
    color: ansColors.error,
    fontSize: 15,
    textAlign: 'center',
  },
  infoText: {
    color: ansColors.gray,
    fontSize: 14,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: ansColors.charcoal,
  },
  retryButtonText: {
    color: ansColors.surface,
    fontWeight: '700',
  },
  card: {
    backgroundColor: ansColors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ansColors.charcoal,
    marginBottom: 6,
  },
  cardAuthor: {
    fontSize: 13,
    color: ansColors.gray,
    marginBottom: 4,
  },
  cardAction: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: ansColors.goldDark,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: ansColors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaValue: {
    flex: 1,
    fontSize: 13,
    color: ansColors.charcoal,
    textAlign: 'right',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: ansColors.surface,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
    marginBottom: 12,
  },
  backButtonText: {
    color: ansColors.charcoal,
    fontWeight: '600',
  },
  detailsContent: {
    paddingBottom: 24,
  },
  detailsCard: {
    backgroundColor: ansColors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
    marginBottom: 12,
  },
  contentCard: {
    backgroundColor: ansColors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: ansColors.charcoal,
  },
});
