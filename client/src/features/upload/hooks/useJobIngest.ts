import { useMutation } from "@tanstack/react-query";

import { ingestJob, type JobIngestPayload } from "../../../services/scraper.service";

export function useJobIngest() {
  return useMutation({ mutationFn: (payload: JobIngestPayload) => ingestJob(payload) });
}
