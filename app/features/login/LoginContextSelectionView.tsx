import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { LoginContextOption } from '../../core/scraper/auth/contextSelection.parser';
import { ansColors } from '../../theme/ansTheme';
import { loginContextSelectionStyles as styles } from './LoginContextSelectionView.styles';

type Props = {
  options: LoginContextOption[];
  loading: boolean;
  error?: string;
  onSelect: (option: LoginContextOption) => void;
  onBack?: () => void;
};

export default function LoginContextSelectionView({
  options,
  loading,
  error,
  onSelect,
  onBack,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="account-group"
            size={30}
            color={ansColors.surface}
          />
        </View>

        <Text style={styles.title}>Wybór kontekstu logowania</Text>
        <Text style={styles.subtitle}>Wybierz kontekst logowania</Text>

        {!!error && <Text style={styles.formError}>{error}</Text>}

        <View style={styles.list}>
          {options.map((option) => {
            const key = `${option.personType}-${option.id ?? option.href}`;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.option, loading && styles.optionDisabled]}
                onPress={() => onSelect(option)}
                disabled={loading}
                activeOpacity={0.75}
                accessibilityRole="button"
              >
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>
                    {option.title || 'Kontekst logowania'}
                  </Text>
                  {!!option.subtitle && (
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  )}
                </View>
                {loading ? (
                  <ActivityIndicator size="small" color={ansColors.gray} />
                ) : (
                  <Text style={styles.optionChevron}>→</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {onBack && !loading && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Wróć do logowania</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
