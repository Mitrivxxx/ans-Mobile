import React from 'react';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTheme } from '../../../context/AppThemeContext';
import { createDashboardLogoutSectionStyles } from './DashboardLogoutSection.styles';

type Props = {
  loading: boolean;
  onLogout: () => void;
};

export default function DashboardLogoutSection({
  loading,
  onLogout,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createDashboardLogoutSectionStyles);
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={onLogout}
      disabled={loading}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Wyloguj"
    >
      {loading ? (
        <ActivityIndicator color={colors.error} />
      ) : (
        <>
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color={colors.error}
          />
          <Text style={styles.label}>Wyloguj</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
