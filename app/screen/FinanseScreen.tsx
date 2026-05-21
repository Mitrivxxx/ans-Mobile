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
import type { StudentFee } from '../core/scraper/features/finance/finance.types';
import { FINANCE_ACCENT_COLOR } from '../features/dashboard/dashboard.features';
import StudentFeeDetailsView from '../features/finance/components/StudentFeeDetailsView';
import { createFinanseScreenStyles } from '../features/finance/FinanseScreen.styles';
import {
  createFinanceUiStyles,
  paymentStatusStyle,
} from '../features/finance/financeUi.styles';
import { useStudentFeesQuery } from '../features/finance/hooks/useStudentFeesQuery';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';
import { useRefreshControlProps } from '../hooks/useRefreshControlProps';
import { useSyncBanner } from '../hooks/useSyncBanner';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function FinanseScreen() {
  const { colors } = useAppTheme();
  const screenStyles = useThemedStyles(createFinanseScreenStyles);
  const uiStyles = useThemedStyles(createFinanceUiStyles);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);

  const {
    fees,
    isLoading,
    isError,
    error,
    refetch,
    syncStatus,
    forceRefresh,
  } = useStudentFeesQuery();

  const { bannerStatus, dismissUpToDate } = useSyncBanner(syncStatus);

  useRegisterScreenRefresh(forceRefresh);
  const { refreshControl } = useRefreshControlProps();

  const syncBanner = (
    <SyncBanner
      status={bannerStatus}
      loadingText="Aktualizowanie opłat…"
      errorText="Nie udało się zaktualizować opłat"
      accentColor={FINANCE_ACCENT_COLOR}
      onDismissUpToDate={dismissUpToDate}
    />
  );

  if (isLoading && fees.length === 0) {
    return (
      <RefreshableScrollView
        style={screenStyles.screen}
        contentContainerStyle={screenStyles.centerStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <ActivityIndicator color={colors.gold} />
        <Text style={uiStyles.stateText}>Wczytywanie opłat...</Text>
      </RefreshableScrollView>
    );
  }

  if (isError && fees.length === 0 && !selectedFee) {
    const message =
      error instanceof Error ? error.message : 'Nie udało się pobrać opłat';
    return (
      <RefreshableScrollView
        style={screenStyles.screen}
        contentContainerStyle={screenStyles.centerStateScroll}
        showsVerticalScrollIndicator={false}
      >
        {syncBanner}
        <Text style={uiStyles.errorText}>{message}</Text>
        <TouchableOpacity
          onPress={() => void refetch()}
          style={uiStyles.retryButton}
        >
          <Text style={uiStyles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </RefreshableScrollView>
    );
  }

  if (selectedFee) {
    return (
      <RefreshableScrollView
        style={screenStyles.screen}
        contentContainerStyle={screenStyles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        {syncBanner}
        <StudentFeeDetailsView
          fee={selectedFee}
          styles={uiStyles}
          onBack={() => setSelectedFee(null)}
        />
      </RefreshableScrollView>
    );
  }

  return (
    <View style={screenStyles.screen}>
      <View style={screenStyles.listHeader}>{syncBanner}</View>
      <FlatList
        data={fees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={screenStyles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        ListEmptyComponent={
          <View style={uiStyles.emptyState}>
            <Text style={uiStyles.stateText}>Brak opłat do wyświetlenia</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusStyle = paymentStatusStyle(
            uiStyles,
            item.paymentStatusTone
          );

          return (
            <TouchableOpacity
              onPress={() => setSelectedFee(item)}
              style={uiStyles.card}
              accessibilityRole="button"
            >
              <Text style={uiStyles.cardTitle} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={uiStyles.cardRow}>
                <Text style={uiStyles.cardLabel}>Termin</Text>
                <Text style={uiStyles.cardValue}>{item.dueDate || '—'}</Text>
              </View>

              <View style={uiStyles.cardRow}>
                <Text style={uiStyles.cardLabel}>Kwota stanu</Text>
                <Text style={uiStyles.cardValue}>{item.amountDue || '—'}</Text>
              </View>

              <View style={uiStyles.cardRow}>
                <Text style={uiStyles.cardLabel}>Stan opłaty</Text>
                <Text style={[uiStyles.cardValue, statusStyle]} numberOfLines={2}>
                  {item.paymentStatus || '—'}
                </Text>
              </View>

              <Text style={uiStyles.cardAction}>Szczegóły →</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
