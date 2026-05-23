import { ProfileService } from "../scraper/features/profile/profile.service";

import { profileSummaryForQueryCache } from "../scraper/features/profile/profileSummaryPhoto";

import { SessionExpiredError } from "../scraper/auth/sessionValidation";



import { CACHE_UNTIL_REPLACE_STALE_TIME } from "./cacheUntilReplace";

import { queryClient } from "./queryClient";

import { queryKeys } from "./queryKeys";



const profileService = new ProfileService();



async function prefetchIgnoringSessionExpiry<T>(

  options: Parameters<typeof queryClient.prefetchQuery<T>>[0]

): Promise<void> {

  try {

    await queryClient.prefetchQuery(options);

  } catch (error) {

    if (error instanceof SessionExpiredError) {

      return;

    }

    throw error;

  }

}



/**

 * Po logowaniu: tylko profil (header).

 * Plan, oceny i ogłoszenia — dopiero po wejściu w zakładkę na dashboardzie

 * (hooki paneli z syncOnMount) lub pełny ekran w sidebarze.

 */

export function prefetchUserScraperData(userKey: string): void {

  void prefetchIgnoringSessionExpiry({

    queryKey: queryKeys.profile.summary(userKey),

    queryFn: async () =>

      profileSummaryForQueryCache(

        await profileService.getProfileSummary(),

        userKey

      ),

    staleTime: CACHE_UNTIL_REPLACE_STALE_TIME,

  });

}

