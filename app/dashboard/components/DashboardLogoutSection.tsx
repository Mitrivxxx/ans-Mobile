import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';

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
      onPress={onLogout}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text>Wyloguj</Text>
      )}
    </TouchableOpacity>
  );
}
