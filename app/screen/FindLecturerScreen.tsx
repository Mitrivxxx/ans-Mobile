import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
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
import { ansColors } from '../theme/ansTheme';

type FindLecturerNav = StackNavigationProp<RootParamList, 'FindLecturer'>;

export default function FindLecturerScreen() {
  const navigation = useNavigation<FindLecturerNav>();
  const lecturersService = useMemo(() => new LecturersService(), []);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [results, setResults] = useState<LecturerSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSearch = (firstName.trim() || lastName.trim()) && !loading;

  const handleSearch = useCallback(async () => {
    Keyboard.dismiss();
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

  const handleReset = useCallback(() => {
    setFirstName('');
    setLastName('');
    setResults([]);
    setSearched(false);
    setError('');
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
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Imię</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              returnKeyType="next"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nazwisko</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
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
                <ActivityIndicator color={ansColors.surface} />
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
            <ActivityIndicator color={ansColors.gold} />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ansColors.dashboardBg,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 16,
  },
  formCard: {
    backgroundColor: ansColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    gap: 12,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ansColors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    backgroundColor: ansColors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: ansColors.charcoal,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: ansColors.charcoal,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: ansColors.surface,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
    backgroundColor: ansColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: ansColors.charcoal,
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  errorBox: {
    backgroundColor: ansColors.errorBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F4C7C7',
  },
  errorText: {
    color: ansColors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  inlineLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  inlineLoaderText: {
    color: ansColors.gray,
    fontSize: 14,
  },
  emptyState: {
    backgroundColor: ansColors.surface,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ansColors.charcoal,
  },
  emptyDescription: {
    fontSize: 13,
    color: ansColors.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  resultsSection: {
    gap: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: ansColors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  resultName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: ansColors.charcoal,
  },
  classesButton: {
    backgroundColor: ansColors.charcoal,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  classesButtonText: {
    color: ansColors.surface,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
