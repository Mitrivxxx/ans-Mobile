import React, { useCallback, useState } from 'react';
import { useAppTheme } from '../context/AppThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { createAnnouncementsScreenStyles } from '../features/announcements/AnnouncementsScreen.styles';
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
type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function AnnouncementsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createAnnouncementsScreenStyles);
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
        <ActivityIndicator color={colors.gold} />
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
          <ActivityIndicator color={colors.gold} />
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

