/** Krótki komunikat błędu w alertcie (bez żargonu technicznego). */
export function getUpdateErrorAlertMessage(technicalMessage: string): string {
  const text = technicalMessage.toLowerCase();

  if (text.includes('failed to check for update') || text.includes('odrzucił')) {
    return (
      'Nie udało się sprawdzić aktualizacji. Upewnij się, że masz internet, ' +
      'a potem spróbuj ponownie. Jeśli problem się powtarza, zainstaluj najnowszy plik APK z GitHub.'
    );
  }

  if (text.includes('fingerprint') || text.includes('selekcji')) {
    return (
      'Ta aktualizacja nie pasuje do wersji aplikacji na telefonie. ' +
      'Zainstaluj najnowszy plik APK z GitHub, a potem sprawdź aktualizacje ponownie.'
    );
  }

  if (text.includes('internet') || text.includes('network')) {
    return 'Brak połączenia z internetem. Połącz się z siecią i spróbuj jeszcze raz.';
  }

  return 'Nie udało się pobrać aktualizacji. Spróbuj ponownie za chwilę.';
}
