import { useQuery } from "@tanstack/react-query";

import { getTask } from "../../../services/analysis.service";
import type { TaskStatus } from "../../../types/analysis.types";

/**
 * Polls GET /tasks/{id} every 2s until the task reaches a terminal state.
 * TanStack Query stops polling automatically once completed/failed.
 */
export function useAnalysis(taskId: string | undefined) {
  return useQuery<TaskStatus>({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId as string),
    enabled: Boolean(taskId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 2000;
    },
  });
}
