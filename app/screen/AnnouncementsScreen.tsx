import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import RefreshableScrollView from '../components/RefreshableScrollView';
import ScreenBackButton from '../components/ScreenBackButton';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';
import { useRefreshControlProps } from '../hooks/useRefreshControlProps';
import { type Announcement } from '../core/scraper/features/announcements/announcements.service';
import { useAnnouncementDetailsQuery } from '../features/announcements/hooks/useAnnouncementDetailsQuery';
import { useAnnouncementsQuery } from '../features/announcements/hooks/useAnnouncementsQuery';
import { ansColors } from '../theme/ansTheme';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function AnnouncementsScreen({ navigation }: Props) {
  const {
    announcements,
    isInitialLoading,
    isFatalError,
    refetch: refetchAnnouncements,
  } = useAnnouncementsQuery();
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);

  const detailsQuery = useAnnouncementDetailsQuery(
    selectedItem?.id ?? null,
    selectedItem ? selectedItem.url || selectedItem.id : null
  );

  const selected = detailsQuery.data ?? null;
  const detailsLoading = detailsQuery.isFetching;
  const detailsError =
    detailsQuery.isError && !detailsQuery.data
      ? 'Nie udało się pobrać szczegółów ogłoszenia'
      : '';

  const refreshScreen = useCallback(async () => {
    if (selectedItem) {
      await detailsQuery.refetch();
      return;
    }
    await refetchAnnouncements();
  }, [detailsQuery, refetchAnnouncements, selectedItem]);

  useRegisterScreenRefresh(refreshScreen);
  const { refreshControl } = useRefreshControlProps();

  const normalizeContent = useCallback((value: string) => {
    return value.replace(/<br\s*\/?>/gi, '\n');
  }, []);

  if (isInitialLoading) {
    return (
      <RefreshableScrollView
        style={styles.screen}
        contentContainerStyle={styles.centerStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <ActivityIndicator color={ansColors.gold} />
        <Text style={styles.stateText}>Wczytywanie ogłoszeń...</Text>
      </RefreshableScrollView>
    );
  }

  if (isFatalError && announcements.length === 0 && !selectedItem) {
    return (
      <RefreshableScrollView
        style={styles.screen}
        contentContainerStyle={styles.centerStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.errorText}>Nie udało się pobrać ogłoszeń</Text>
        <TouchableOpacity
          onPress={() => void refetchAnnouncements()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </RefreshableScrollView>
    );
  }

  if (selectedItem) {
    if (detailsLoading && !selected) {
      return (
        <RefreshableScrollView
          style={styles.screen}
          contentContainerStyle={styles.centerStateScroll}
          showsVerticalScrollIndicator={false}
        >
          <ActivityIndicator color={ansColors.gold} />
          <Text style={styles.stateText}>Wczytywanie szczegółów...</Text>
        </RefreshableScrollView>
      );
    }

    if (detailsError && !selected) {
      return (
        <RefreshableScrollView
          style={styles.screen}
          contentContainerStyle={styles.centerStateScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.errorText}>{detailsError}</Text>
          <TouchableOpacity
            onPress={() => void detailsQuery.refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedItem(null)}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>← Lista ogłoszeń</Text>
          </TouchableOpacity>
        </RefreshableScrollView>
      );
    }

    if (selected) {
      return (
        <RefreshableScrollView
          style={styles.screen}
          contentContainerStyle={styles.detailsContent}
          showsVerticalScrollIndicator={false}
        >
          <ScreenBackButton
            label="← Lista ogłoszeń"
            onPress={() => setSelectedItem(null)}
          />

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
        </RefreshableScrollView>
      );
    }
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        ListHeaderComponent={
          detailsError || (detailsLoading && selectedItem) ? (
            <View style={styles.listHeader}>
              {detailsError ? (
                <Text style={styles.errorText}>{detailsError}</Text>
              ) : null}
              {detailsLoading && selectedItem ? (
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
          const isFetching =
            detailsLoading && selectedItem?.id === item.id;

          return (
            <TouchableOpacity
              onPress={() => setSelectedItem(item)}
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
  centerStateScroll: {
    flexGrow: 1,
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
