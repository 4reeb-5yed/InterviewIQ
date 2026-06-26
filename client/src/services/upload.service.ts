import { apiClient, unwrap } from "./api.client";
import type { ResumeUploadResponse } from "../types/analysis.types";

export function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const form = new FormData();
  form.append("file", file);

  return unwrap<ResumeUploadResponse>(
    apiClient.post("/upload/resume", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  );
}