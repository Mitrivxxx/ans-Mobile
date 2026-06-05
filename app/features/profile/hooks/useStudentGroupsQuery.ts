import { queryKeys } from "../../../core/queryClient/queryKeys";
import { useUserPersistentQuery } from "../../../core/queryClient/useUserPersistentQuery";
import {
  GroupsService,
  type StudentGroupsData,
} from "../../../core/scraper/features/groups/groups.service";

const groupsService = new GroupsService();

export function useStudentGroupsQuery(academicSemester: string | null) {
  const query = useUserPersistentQuery<StudentGroupsData>({
    queryKey: (userKey) =>
      queryKeys.profile.groups(userKey, academicSemester ?? "default"),
    queryFn: () => groupsService.getStudentGroups(academicSemester),
    syncOnMount: false,
  });

  return {
    data: query.data ?? null,
    isInitialLoading: query.isInitialLoading,
    hasCachedGroups: query.hasCachedData,
    syncStatus: query.syncStatus,
    refetch: query.refetch,
    forceRefresh: query.forceRefresh,
    isFatalError: query.isFatalError,
  };
}
