import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useAppTheme } from '../context/AppThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { createFindLecturerScreenStyles } from '../features/lecturer/FindLecturerScreen.styles';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  LecturersService,
  type LecturerSearchResult,
} from '../core/scraper/features/lecturers/lecturers.service';
import type { RootParamList } from '../navigation/navigationRef';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';

type FindLecturerNav = StackNavigationProp<RootParamList, 'FindLecturer'>;

export default function FindLecturerScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createFindLecturerScreenStyles);
  const navigation = useNavigation<FindLecturerNav>();
  const lecturersService = useMemo(() => new LecturersService(), []);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [results, setResults] = useState<LecturerSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSearch = (firstName.trim() || lastName.trim()) && !loading;

  const focusLastName = useCallback(() => {
    lastNameRef.current?.focus();
  }, []);

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSearched(true);
      const data = await lecturersService.searchLecturers({
        firstName,
        lastName,
      });
      setResults(data);
    } catch (err) {
      console.error('[FIND LECTURER SCREEN]', err);
      setResults([]);
      setError(
        err instanceof Error
          ? err.message
          : 'Nie udało się wyszukać prowadzącego'
      );
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, lecturersService]);

  const refreshScreen = useCallback(async () => {
    if (searched && (firstName.trim() || lastName.trim())) {
      await handleSearch();
    }
  }, [firstName, handleSearch, lastName, searched]);

  useRegisterScreenRefresh(refreshScreen);

  const handleReset = useCallback(() => {
    setFirstName('');
    setLastName('');
    setResults([]);
    setSearched(false);
    setError('');
    firstNameRef.current?.focus();
  }, []);

  const renderResultCard = (item: LecturerSearchResult, index: number) => (
    <View
      key={`${item.scheduleId || item.name}-${index}`}
      style={styles.resultCard}
    >
      <Text style={styles.resultName} numberOfLines={2}>
        {item.name}
      </Text>
      <TouchableOpacity
        style={[
          styles.classesButton,
          !item.scheduleId && styles.buttonDisabled,
        ]}
        disabled={!item.scheduleId}
        onPress={() =>
          navigation.navigate('LecturerPlan', {
            scheduleId: item.scheduleId,
            lecturerName: item.name,
            organizationalUnits: item.organizationalUnits,
            additionalInfo: item.additionalInfo,
          })
        }
        accessibilityRole="button"
        accessibilityLabel="Zajęcia prowadzącego"
      >
        <Text style={styles.classesButtonText}>Zajęcia prowadzącego</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}
    >
      <RefreshableScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Imię</Text>
            <TextInput
              ref={firstNameRef}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={focusLastName}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nazwisko</Text>
            <TextInput
              ref={lastNameRef}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              returnKeyType="search"
              onSubmitEditing={() => {
                if (canSearch) {
                  void handleSearch();
                }
              }}
              style={styles.input}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              style={[
                styles.secondaryButton,
                loading && styles.buttonDisabled,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Wyczyść</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSearch}
              disabled={!canSearch}
              style={[
                styles.primaryButton,
                !canSearch && styles.buttonDisabled,
              ]}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryButtonText} />
              ) : (
                <Text style={styles.primaryButtonText}>Szukaj</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.inlineLoader}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.inlineLoaderText}>Szukam prowadzących…</Text>
          </View>
        ) : null}

        {!loading && searched && !error && results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Brak wyników</Text>
            <Text style={styles.emptyDescription}>
              Spróbuj zmienić kryteria wyszukiwania lub sprawdź pisownię.
            </Text>
          </View>
        ) : null}

        {!loading && results.length > 0 ? (
          <View style={styles.resultsSection}>
            {results.map(renderResultCard)}
          </View>
        ) : null}
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

