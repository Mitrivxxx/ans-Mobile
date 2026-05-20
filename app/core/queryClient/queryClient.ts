import { QueryClient } from '@tanstack/react-query';

import { SessionExpiredError } from '../scraper/auth/sessionValidation';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof SessionExpiredError) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
