import { useMutation } from "@tanstack/react-query";

import { runAnalysis } from "../../../services/analysis.service";

export function useRunAnalysis() {
  return useMutation({ mutationFn: runAnalysis });
}
