import { AnnouncementsService } from "../scraper/features/announcements/announcements.service";
import { PlanService } from "../scraper/features/plan/plan.service";
import { ProfileService } from "../scraper/features/profile/profile.service";

import { PERSISTENT_QUERY_STALE_TIME_MS } from "./persistentQueryConfig";
import { queryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

const planService = new PlanService();
const announcementsService = new AnnouncementsService();
const profileService = new ProfileService();

/** Plan tygodnia pierwszy (dashboard), potem reszta równolegle w tle. */
export function prefetchUserScraperData(userKey: string): void {
  const staleTime = PERSISTENT_QUERY_STALE_TIME_MS;

  void (async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.studentPlan.weekLessons(userKey),
      queryFn: () => planService.getWeekLessons(),
      staleTime,
    });

    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: queryKeys.announcements.list(userKey),
        queryFn: () => announcementsService.getAnnouncements(),
        staleTime,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.profile.summary(userKey),
        queryFn: () => profileService.getProfileSummary(),
        staleTime,
      }),
    ]);
  })();
}
