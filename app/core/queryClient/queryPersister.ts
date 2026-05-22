import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

import {
  transformPersistedClientAfterRestore,
  transformPersistedClientForStorage,
} from './persistClientTransform';

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE_PLAN_ONLY',
  serialize: (client) =>
    JSON.stringify(transformPersistedClientForStorage(client)),
  deserialize: (cachedString) =>
    transformPersistedClientAfterRestore(JSON.parse(cachedString)),
});
