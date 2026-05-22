import React, { type RefObject } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { getCookies } from '../../core/scraper/client/client';
import LoginIconInput from './LoginIconInput';
import { loginCaptchaStyles as styles } from './LoginCaptchaSection.styles';

type Props = {
  imageUrl: string | null;
  imageBuster: number;
  code: string;
  loading: boolean;
  onCodeChange: (text: string) => void;
  onRefreshImage: () => void;
  inputRef?: RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
};

function captchaUriWithBuster(url: string, buster: number): string {
  if (!url) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_cb=${buster}`;
}

export default function LoginCaptchaSection({
  imageUrl,
  imageBuster,
  code,
  loading,
  onCodeChange,
  onRefreshImage,
  inputRef,
  onSubmitEditing,
}: Props) {
  const cookieHeader = getCookies();

  return (
    <View style={styles.block}>
      <Text style={styles.label}>Wpisz kod z obrazka</Text>

      {imageUrl ? (
        <Image
          style={styles.image}
          source={{
            uri: captchaUriWithBuster(imageUrl, imageBuster),
            headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
          }}
          resizeMode="contain"
          accessibilityLabel="Obrazek CAPTCHA"
        />
      ) : (
        <Text style={styles.fallback}>
          Brak obrazka — użyj „Odśwież obrazek”.
        </Text>
      )}

      <TouchableOpacity
        style={styles.refresh}
        onPress={onRefreshImage}
        disabled={loading}
      >
        <Text style={styles.refreshText}>Odśwież obrazek</Text>
      </TouchableOpacity>

      <LoginIconInput
        ref={inputRef}
        icon="shield-check-outline"
        placeholder="Kod CAPTCHA"
        value={code}
        onChangeText={onCodeChange}
        maxLength={5}
        autoCapitalize="characters"
        returnKeyType="go"
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit
        editable={!loading}
        importantForAutofill="no"
        autoComplete="off"
      />
    </View>
  );
}
