import { apiClient, unwrap } from "./api.client";
import type { JobIngestResponse } from "../types/analysis.types";

export interface JobIngestPayload {
  url?: string;
  description?: string;
  companyName?: string;
  roleTitle?: string;
}

export function ingestJob(payload: JobIngestPayload): Promise<JobIngestResponse> {
  return unwrap<JobIngestResponse>(apiClient.post("/api/v1/scrape/job", payload));
}
