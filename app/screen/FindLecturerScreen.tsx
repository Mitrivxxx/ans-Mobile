import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  LecturersService,
  type LecturerSearchResult,
} from "../core/scraper/features/lecturers/lecturers.service";

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function FindLecturerScreen({ navigation }: Props) {
  const lecturersService = useMemo(() => new LecturersService(), []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [results, setResults] = useState<LecturerSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSearched(true);
      const data = await lecturersService.searchLecturers({
        firstName,
        lastName,
      });
      setResults(data);
    } catch (err) {
      console.error("[FIND LECTURER SCREEN]", err);
      setResults([]);
      setError(
        err instanceof Error
          ? err.message
          : "Nie udało się wyszukać prowadzącego"
      );
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, lecturersService]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text>← Powrót</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 20, fontWeight: "600" }}>Znajdź prowadzącego</Text>

      <TextInput
        placeholder="Imię"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
        }}
      />

      <TextInput
        placeholder="Nazwisko"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
        }}
      />

      <TouchableOpacity
        onPress={handleSearch}
        disabled={loading}
        style={{
          backgroundColor: "#333",
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "600" }}>Szukaj</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={{ color: "#c00" }}>{error}</Text> : null}

      {searched && !loading && !error && results.length === 0 ? (
        <Text>Brak wyników dla podanych kryteriów.</Text>
      ) : null}

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) =>
            `${item.scheduleId || item.name}-${item.email}`
          }
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                gap: 6,
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 16 }}>{item.name}</Text>
              {item.email ? <Text>E-mail: {item.email}</Text> : null}
              {item.organizationalUnits ? (
                <Text>{item.organizationalUnits}</Text>
              ) : null}
              {item.additionalInfo ? (
                <Text style={{ color: "#444" }}>{item.additionalInfo}</Text>
              ) : null}
              {item.schedulePath ? (
                <Text>Plan: {item.schedulePath}</Text>
              ) : null}
            </View>
          )}
        />
      ) : null}
    </ScrollView>
  );
}
