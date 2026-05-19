import { AnnouncementsService } from "../scraper/features/announcements/announcements.service";
import { GradesService } from "../scraper/features/grades/grades.service";
import { PlanService } from "../scraper/features/plan/plan.service";
import { ProfileService } from "../scraper/features/profile/profile.service";

import { PERSISTENT_QUERY_STALE_TIME_MS } from "./persistentQueryConfig";
import { queryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

const planService = new PlanService();
const gradesService = new GradesService();
const announcementsService = new AnnouncementsService();
const profileService = new ProfileService();

/** Równoległe rozgrzanie cache po zalogowaniu / starcie sesji. */
export function prefetchUserScraperData(userKey: string): void {
  const staleTime = PERSISTENT_QUERY_STALE_TIME_MS;
  const gradesKey = queryKeys.grades.list(userKey);

  void Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: queryKeys.studentPlan.weekLessons(userKey),
      queryFn: () => planService.getWeekLessons(),
      staleTime,
    }),
    queryClient.prefetchQuery({
      queryKey: gradesKey,
      queryFn: () =>
        gradesService.getGrades((partial) => {
          queryClient.setQueryData(gradesKey, partial);
        }),
      staleTime,
    }),
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
}
