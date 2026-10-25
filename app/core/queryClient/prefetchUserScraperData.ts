import { ProfileService } from "../scraper/features/profile/profile.service";
import { getCachedProfilePhoto } from "../scraper/features/profile/profilePhotoSessionCache";
import { profileSummaryForQueryCache } from "../scraper/features/profile/profileSummaryPhoto";
import { SessionExpiredError } from "../scraper/auth/sessionValidation";

import { CACHE_UNTIL_REPLACE_STALE_TIME } from "./cacheUntilReplace";
import { queryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

const profileService = new ProfileService();

/**
 * Po logowaniu: tylko profil (header).
 * Plan, oceny i ogłoszenia — dopiero po wejściu w zakładkę na dashboardzie
 * (hooki paneli z syncOnMount) lub pełny ekran w sidebarze.
 *
 * Brak zdjęcia w cache sesji wymusza sieć — pusty summary ze staleTime Infinity
 * nie może zablokować dociągnięcia awatara po wyborze kontekstu.
 */
export function prefetchUserScraperData(userKey: string): void {
  void prefetchProfileSummary(userKey);
}

async function prefetchProfileSummary(userKey: string): Promise<void> {
  const queryKey = queryKeys.profile.summary(userKey);
  const missingPhoto = !getCachedProfilePhoto(userKey);

  if (missingPhoto) {
    await queryClient.invalidateQueries({
      queryKey,
      refetchType: "none",
    });
  }

  try {
    await queryClient.fetchQuery({
      queryKey,
      queryFn: async () =>
        profileSummaryForQueryCache(
          await profileService.getProfileSummary(),
          userKey
        ),
      staleTime: missingPhoto ? 0 : CACHE_UNTIL_REPLACE_STALE_TIME,
    });
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return;
    }
    throw error;
  }
}
