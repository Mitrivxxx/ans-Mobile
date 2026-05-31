import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const mocksDir = path.join(rootDir, '__tests__', 'mocks');

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    globals: false,
    setupFiles: [path.join(rootDir, '__tests__', 'setup.ts')],
  },
  resolve: {
    alias: {
      'expo-constants': path.join(mocksDir, 'expo-constants.ts'),
      'react-native': path.join(mocksDir, 'react-native.ts'),
      '@react-native-async-storage/async-storage': path.join(
        mocksDir,
        'async-storage.ts'
      ),
      '@react-native-cookies/cookies': path.join(mocksDir, 'cookies.ts'),
      'react-native-keychain': path.join(mocksDir, 'keychain.ts'),
    },
  },
});
