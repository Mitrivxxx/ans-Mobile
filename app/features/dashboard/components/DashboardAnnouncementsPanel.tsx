import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAppTheme } from '../../../context/AppThemeContext';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import AnnouncementDetailsView from '../../announcements/components/AnnouncementDetailsView';
import AnnouncementListItem from '../../announcements/components/AnnouncementListItem';
import { createAnnouncementsUiStyles } from '../../announcements/announcementsUi.styles';
import { useAnnouncementsArchive } from '../../announcements/hooks/useAnnouncementsArchive';
import { useAnnouncementSelection } from '../../announcements/hooks/useAnnouncementSelection';
import { useAnnouncementsQuery } from '../../announcements/hooks/useAnnouncementsQuery';
import { takeLatestAnnouncements } from '../../announcements/utils/takeLatestAnnouncements';
import SyncBanner from '../../../components/SyncBanner';
import { useRegisterScreenRefresh } from '../../../hooks/useRegisterScreenRefresh';
import { useSyncBanner } from '../../../hooks/useSyncBanner';
import { ANNOUNCEMENTS_ACCENT_COLOR } from '../dashboard.quickActions';
import { createDashboardAnnouncementsPanelStyles } from './DashboardAnnouncementsPanel.styles';

const DASHBOARD_ANNOUNCEMENTS_LIMIT = 5;

export default function DashboardAnnouncementsPanel() {
  const { colors } = useAppTheme();
  const panelStyles = useThemedStyles(createDashboardAnnouncementsPanelStyles);
  const uiStyles = useThemedStyles(createAnnouncementsUiStyles);
  const {
    announcements,
    isInitialLoading,
    hasCachedAnnouncements,
    isFatalError,
    refetch,
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
  } = useAnnouncementSelection(refetch, forceRefresh);

  const { archivingId, isArchived, toggleArchive } = useAnnouncementsArchive();

  const { bannerStatus, dismissUpToDate } = useSyncBanner(syncStatus);

  useRegisterScreenRefresh(refreshSelection);

  const latestAnnouncements = useMemo(
    () => takeLatestAnnouncements(announcements, DASHBOARD_ANNOUNCEMENTS_LIMIT),
    [announcements]
  );

  if (isInitialLoading && !hasCachedAnnouncements) {
    return (
      <View style={panelStyles.wrap}>
        <View style={uiStyles.centerState}>
          <ActivityIndicator color={colors.gold} />
          <Text style={uiStyles.stateText}>Wczytywanie ogłoszeń...</Text>
        </View>
      </View>
    );
  }

  if (isFatalError && announcements.length === 0 && !selectedItem) {
    return (
      <View style={panelStyles.wrap}>
        <View style={uiStyles.centerState}>
          <Text style={uiStyles.errorText}>Nie udało się pobrać ogłoszeń</Text>
          <TouchableOpacity
            onPress={() => void refetch()}
            style={uiStyles.retryButton}
          >
            <Text style={uiStyles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (selectedItem) {
    if (detailsLoading && !selected) {
      return (
        <View style={panelStyles.wrap}>
          <View style={uiStyles.centerState}>
            <ActivityIndicator color={colors.gold} />
            <Text style={uiStyles.stateText}>Wczytywanie szczegółów...</Text>
          </View>
        </View>
      );
    }

    if (detailsError && !selected) {
      return (
        <View style={panelStyles.wrap}>
          <View style={uiStyles.centerState}>
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
          </View>
        </View>
      );
    }

    if (selected) {
      return (
        <View style={panelStyles.wrap}>
          <AnnouncementDetailsView
            selected={selected}
            styles={uiStyles}
            onBack={clearSelection}
            archiveAction={
              selectedItem
                ? {
                    isArchived: isArchived(selectedItem.id),
                    isArchiving: archivingId === selectedItem.id,
                    onToggle: () => void toggleArchive(selectedItem),
                  }
                : undefined
            }
          />
        </View>
      );
    }
  }

  return (
    <View style={panelStyles.wrap}>
      <SyncBanner
        status={bannerStatus}
        loadingText="Aktualizowanie ogłoszeń…"
        errorText="Nie udało się zaktualizować ogłoszeń"
        accentColor={ANNOUNCEMENTS_ACCENT_COLOR}
        onDismissUpToDate={dismissUpToDate}
      />
      {detailsError ? (
        <Text style={uiStyles.errorText}>{detailsError}</Text>
      ) : null}
      {detailsLoading && selectedItem ? (
        <Text style={uiStyles.infoText}>Wczytywanie szczegółów...</Text>
      ) : null}

      {latestAnnouncements.length === 0 ? (
        <View style={uiStyles.emptyState}>
          <Text style={uiStyles.stateText}>Brak ogłoszeń</Text>
        </View>
      ) : (
        <View style={uiStyles.list}>
          {latestAnnouncements.map((item) => {
            const isFetching = detailsLoading && selectedItem?.id === item.id;

            return (
              <AnnouncementListItem
                key={item.id}
                item={item}
                styles={uiStyles}
                isFetching={isFetching}
                onPress={() => setSelectedItem(item)}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
