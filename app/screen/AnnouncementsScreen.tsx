import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
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
import { archivedAnnouncementToDetails } from '../core/announcements/archive/announcementsArchive.utils';
import type { ArchivedAnnouncement } from '../core/announcements/archive/announcementsArchive.types';
import AnnouncementsArchiveView from '../features/announcements/components/AnnouncementsArchiveView';
import AnnouncementDetailsView from '../features/announcements/components/AnnouncementDetailsView';
import AnnouncementListItem from '../features/announcements/components/AnnouncementListItem';
import AnnouncementsTabBar, {
  type AnnouncementsTab,
} from '../features/announcements/components/AnnouncementsTabBar';
import { createAnnouncementsUiStyles } from '../features/announcements/announcementsUi.styles';
import { useAnnouncementSelection } from '../features/announcements/hooks/useAnnouncementSelection';
import { useAnnouncementsArchive } from '../features/announcements/hooks/useAnnouncementsArchive';
import { useAnnouncementsQuery } from '../features/announcements/hooks/useAnnouncementsQuery';
import { createAnnouncementsScreenStyles } from '../features/announcements/AnnouncementsScreen.styles';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';
import { useRefreshControlProps } from '../hooks/useRefreshControlProps';
import { useSyncBanner } from '../hooks/useSyncBanner';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function AnnouncementsScreen(_props: Props) {
  const { colors } = useAppTheme();
  const screenStyles = useThemedStyles(createAnnouncementsScreenStyles);
  const uiStyles = useThemedStyles(createAnnouncementsUiStyles);
  const [activeTab, setActiveTab] = useState<AnnouncementsTab>('announcements');
  const [selectedArchived, setSelectedArchived] =
    useState<ArchivedAnnouncement | null>(null);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('announcements');
    }, [])
  );

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

  const {
    archived,
    isLoading: isArchiveLoading,
    archivingId,
    removingId,
    isArchived,
    toggleArchive,
    removeFromArchive,
    reload: reloadArchive,
  } = useAnnouncementsArchive();

  const handleTabChange = useCallback(
    (tab: AnnouncementsTab) => {
      setActiveTab(tab);
      clearSelection();
      setSelectedArchived(null);
    },
    [clearSelection]
  );

  const { bannerStatus, dismissUpToDate } = useSyncBanner(syncStatus);

  useRegisterScreenRefresh(
    useCallback(async () => {
      await reloadArchive();
      await refreshSelection();
    }, [reloadArchive, refreshSelection])
  );
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

  if (selectedArchived) {
    return (
      <RefreshableScrollView
        style={screenStyles.screen}
        contentContainerStyle={screenStyles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        <AnnouncementDetailsView
          selected={archivedAnnouncementToDetails(selectedArchived)}
          styles={uiStyles}
          onBack={() => setSelectedArchived(null)}
          backLabel="← Archiwum"
        />
      </RefreshableScrollView>
    );
  }

  if (isInitialLoading && activeTab === 'announcements') {
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

  if (
    activeTab === 'announcements' &&
    isFatalError &&
    announcements.length === 0 &&
    !selectedItem
  ) {
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

  if (selectedItem && activeTab === 'announcements') {
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

  if (activeTab === 'archive') {
    return (
      <RefreshableScrollView
        style={screenStyles.screen}
        contentContainerStyle={screenStyles.archiveContent}
        showsVerticalScrollIndicator={false}
      >
        <AnnouncementsTabBar activeTab={activeTab} onTabChange={handleTabChange} />
        <AnnouncementsArchiveView
          items={archived}
          isLoading={isArchiveLoading}
          removingId={removingId}
          uiStyles={uiStyles}
          onOpen={setSelectedArchived}
          onRemove={(id) => void removeFromArchive(id)}
        />
      </RefreshableScrollView>
    );
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
            <AnnouncementsTabBar
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
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
            <AnnouncementListItem
              item={item}
              styles={uiStyles}
              isFetching={isFetching}
              isArchived={isArchived(item.id)}
              isArchiving={archivingId === item.id}
              onPress={() => setSelectedItem(item)}
              onToggleArchive={() => void toggleArchive(item)}
            />
          );
        }}
      />
    </View>
  );
}
