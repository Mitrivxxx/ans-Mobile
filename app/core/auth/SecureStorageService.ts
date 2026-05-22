import * as Keychain from 'react-native-keychain';

/** Usługa Keychain / Keystore — login i hasło „Zapamiętaj mnie”. */
const KEYCHAIN_SERVICE = 'pl.edu.ans-ns.wdmobile.login';

export type StoredCredentials = {
  username: string;
  password: string;
};

const keychainOptions: Keychain.SetOptions = {
  service: KEYCHAIN_SERVICE,
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

class SecureStorageService {
  async saveCredentials(
    username: string,
    password: string
  ): Promise<void> {
    const trimmed = username.trim();
    if (!trimmed || !password) {
      return;
    }

    await Keychain.setGenericPassword(trimmed, password, keychainOptions);
  }

  async getCredentials(): Promise<StoredCredentials | null> {
    const result = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (!result) {
      return null;
    }

    const username =
      typeof result.username === 'string' ? result.username.trim() : '';
    const password = typeof result.password === 'string' ? result.password : '';

    if (!username || !password) {
      return null;
    }

    return { username, password };
  }

  async clearCredentials(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    } catch {
      /* brak wpisu */
    }
  }

  async hasCredentials(): Promise<boolean> {
    return (await this.getCredentials()) !== null;
  }
}

export default new SecureStorageService();
