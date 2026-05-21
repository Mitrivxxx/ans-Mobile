import { AnnouncementsService } from "../scraper/features/announcements/announcements.service";
import { getWeekMondayDateKey } from "../scraper/features/plan/plan.dateRange";
import { PlanService } from "../scraper/features/plan/plan.service";
import { ProfileService } from "../scraper/features/profile/profile.service";
import { SessionExpiredError } from "../scraper/auth/sessionValidation";

import { PERSISTENT_QUERY_STALE_TIME_MS } from "./persistentQueryConfig";
import { queryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

const planService = new PlanService();
const announcementsService = new AnnouncementsService();
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

/** Plan tygodnia pierwszy (dashboard), potem reszta równolegle w tle. */
export function prefetchUserScraperData(userKey: string): void {
  const staleTime = PERSISTENT_QUERY_STALE_TIME_MS;

  void (async () => {
    const currentWeekMondayKey = getWeekMondayDateKey();
    await prefetchIgnoringSessionExpiry({
      queryKey: queryKeys.studentPlan.weekLessons(userKey, currentWeekMondayKey),
      queryFn: () => planService.getWeekLessons(),
      staleTime,
    });

    await Promise.allSettled([
      prefetchIgnoringSessionExpiry({
        queryKey: queryKeys.announcements.list(userKey),
        queryFn: () => announcementsService.getAnnouncements(),
        staleTime,
      }),
      prefetchIgnoringSessionExpiry({
        queryKey: queryKeys.profile.summary(userKey),
        queryFn: () => profileService.getProfileSummary(),
        staleTime,
      }),
    ]);
  })();
}
