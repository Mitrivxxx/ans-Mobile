import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import RefreshableScrollView from '../components/RefreshableScrollView';
import SyncBanner from '../components/SyncBanner';
import { useAppTheme } from '../context/AppThemeContext';
import AnnouncementDetailsView from '../features/announcements/components/AnnouncementDetailsView';
import { createAnnouncementsUiStyles } from '../features/announcements/announcementsUi.styles';
import { useAnnouncementSelection } from '../features/announcements/hooks/useAnnouncementSelection';
import { useAnnouncementsQuery } from '../features/announcements/hooks/useAnnouncementsQuery';
import { createAnnouncementsScreenStyles } from '../features/announcements/AnnouncementsScreen.styles';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';
import { useRefreshControlProps } from '../hooks/useRefreshControlProps';
import { useSyncBanner } from '../hooks/useSyncBanner';
import { useThemedStyles } from '../theme/useThemedStyles';

// do testu

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function AnnouncementsScreen(_props: Props) {
  const { colors } = useAppTheme();
  const screenStyles = useThemedStyles(createAnnouncementsScreenStyles);
  const uiStyles = useThemedStyles(createAnnouncementsUiStyles);
  const {
    announcements,
    isInitialLoading,
    isFatalError,
    refetch: refetchAnnouncements,
    forceRefresh,
    syncStatus,
  } = useAnnouncementsQuery();

  const {
    selectedItem,
    setSelectedItem,
    selected,
    detailsLoading,
    detailsError,
    detailsQuery,
    refreshSelection,
    clearSelection,
  } = useAnnouncementSelection(refetchAnnouncements, forceRefresh);

  const { bannerStatus, dismissUpToDate } = useSyncBanner(syncStatus);

  useRegisterScreenRefresh(refreshSelection);
  const { refreshControl } = useRefreshControlProps();

  const syncBanner = (
    <SyncBanner
      status={bannerStatus}
      loadingText="Aktualizowanie ogłoszeń…"
      errorText="Nie udało się zaktualizować ogłoszeń"
      accentColor={colors.gold}
      onDismissUpToDate={dismissUpToDate}
    />
  );

  if (isInitialLoading) {
    return (
      <RefreshableScrollView
        style={screenStyles.screen}
        contentContainerStyle={screenStyles.centerStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <ActivityIndicator color={colors.gold} />
        <Text style={uiStyles.stateText}>Wczytywanie ogłoszeń...</Text>
      </RefreshableScrollView>
    );
  }

  if (isFatalError && announcements.length === 0 && !selectedItem) {
    return (
      <RefreshableScrollView
        style={screenStyles.screen}
        contentContainerStyle={screenStyles.centerStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={uiStyles.errorText}>Nie udało się pobrać ogłoszeń</Text>
        <TouchableOpacity
          onPress={() => void refetchAnnouncements()}
          style={uiStyles.retryButton}
        >
          <Text style={uiStyles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </RefreshableScrollView>
    );
  }

  if (selectedItem) {
    if (detailsLoading && !selected) {
      return (
        <RefreshableScrollView
          style={screenStyles.screen}
          contentContainerStyle={screenStyles.centerStateScroll}
          showsVerticalScrollIndicator={false}
        >
          <ActivityIndicator color={colors.gold} />
          <Text style={uiStyles.stateText}>Wczytywanie szczegółów...</Text>
        </RefreshableScrollView>
      );
    }

    if (detailsError && !selected) {
      return (
        <RefreshableScrollView
          style={screenStyles.screen}
          contentContainerStyle={screenStyles.centerStateScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={uiStyles.errorText}>{detailsError}</Text>
          <TouchableOpacity
            onPress={() => void detailsQuery.refetch()}
            style={uiStyles.retryButton}
          >
            <Text style={uiStyles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={clearSelection}
            style={uiStyles.retryButton}
          >
            <Text style={uiStyles.retryButtonText}>← Lista ogłoszeń</Text>
          </TouchableOpacity>
        </RefreshableScrollView>
      );
    }

    if (selected) {
      return (
        <RefreshableScrollView
          style={screenStyles.screen}
          contentContainerStyle={screenStyles.detailsContent}
          showsVerticalScrollIndicator={false}
        >
          <AnnouncementDetailsView
            selected={selected}
            styles={uiStyles}
            onBack={clearSelection}
          />
        </RefreshableScrollView>
      );
    }
  }

  return (
    <View style={screenStyles.screen}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={screenStyles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        ListHeaderComponent={
          <View style={screenStyles.listHeader}>
            {syncBanner}
            {detailsError ? (
              <Text style={uiStyles.errorText}>{detailsError}</Text>
            ) : null}
            {detailsLoading && selectedItem ? (
              <Text style={uiStyles.infoText}>Wczytywanie szczegółów...</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={uiStyles.emptyState}>
            <Text style={uiStyles.stateText}>Brak ogłoszeń</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isFetching = detailsLoading && selectedItem?.id === item.id;

          return (
            <TouchableOpacity
              onPress={() => setSelectedItem(item)}
              disabled={isFetching}
              style={[uiStyles.card, isFetching && uiStyles.cardDisabled]}
              accessibilityRole="button"
            >
              <Text style={uiStyles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={uiStyles.cardAuthor} numberOfLines={1}>
                {item.authorName}
              </Text>

              <Text style={uiStyles.cardAction}>
                {isFetching ? 'Wczytywanie…' : 'Zobacz szczegóły →'}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
