import React, { useCallback, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthService } from '../core/scraper/auth/auth.service';

type Props = {
  navigation: any;
};

export default function DashboardScreen({
  navigation,
}: Props) {
  const authService = useMemo(
    () => new AuthService(),
    []
  );

  const [loading, setLoading] =
    useState(false);

  const handleLogout = useCallback(
    async () => {
      if (loading) return;

      try {
        setLoading(true);

        console.log(
          '[DASHBOARD] LOGOUT START'
        );

        await authService.logout();

        console.log(
          '[DASHBOARD] LOGOUT SUCCESS'
        );

        navigation.replace('Login');
      } catch (err) {
        console.error(
          '[DASHBOARD] LOGOUT ERROR',
          err
        );

        alert(
          'Błąd wylogowania: ' +
          (err instanceof Error ? err.message : 'Nieznany błąd')
        );
      } finally {
        setLoading(false);
      }
    },
    [authService, navigation, loading]
  );

  return (
    <View>
      <Text>
        Dashboard
      </Text>

      <Text>
        Zalogowano pomyślnie
      </Text>

      <View>
        <Text>
          Panel użytkownika
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Plan')
          }
          activeOpacity={0.7}
        >
          <Text>
            Mój plan zajęć
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text>
            Wyloguj
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}