import { apiClient, unwrap } from "./api.client";
import type {
  AnalysisResultResponse,
  RunAnalysisResponse,
  TaskStatus,
} from "../types/analysis.types";

export interface RunAnalysisInput {
  resumeId: string;
  /** Optional: omit for a resume-only Career Intelligence Report. */
  jobId?: string;
}

export function runAnalysis(input: RunAnalysisInput): Promise<RunAnalysisResponse> {
  return unwrap<RunAnalysisResponse>(
    apiClient.post("/analysis/run", input),
  );
}

export function getTask(taskId: string): Promise<TaskStatus> {
  return unwrap<TaskStatus>(
    apiClient.get(`/tasks/${taskId}`),
  );
}

export function getAnalysis(analysisId: string): Promise<AnalysisResultResponse> {
  return unwrap<AnalysisResultResponse>(
    apiClient.get(`/analysis/${analysisId}`),
  );
}