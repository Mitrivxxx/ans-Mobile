import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ansColors } from '../../../theme/ansTheme';
import { dashboardLogoutSectionStyles as styles } from './DashboardLogoutSection.styles';

type Props = {
  loading: boolean;
  onLogout: () => void;
};

export default function DashboardLogoutSection({
  loading,
  onLogout,
}: Props) {
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
        <ActivityIndicator color={ansColors.error} />
      ) : (
        <>
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color={ansColors.error}
          />
          <Text style={styles.label}>Wyloguj</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
