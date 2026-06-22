import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { ArrowRight } from "../../components/ui/icons";
import type { JobIngestPayload } from "../../services/scraper.service";
import { ApiError } from "../../types/api.types";
import { DropZone } from "./components/DropZone";
import { JobInputCard } from "./components/JobInputCard";
import { useJobIngest } from "./hooks/useJobIngest";
import { useResumeUpload } from "./hooks/useResumeUpload";
import { useRunAnalysis } from "./hooks/useRunAnalysis";

function messageOf(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function UploadPage() {
  const navigate = useNavigate();
  const resumeUpload = useResumeUpload();
  const jobIngest = useJobIngest();
  const runAnalysis = useRunAnalysis();

  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    resumeUpload.mutate(file, {
      onSuccess: (data) => setResumeId(data.resumeId),
      onError: (e) => setError(messageOf(e, "Upload failed. Please try a different PDF.")),
    });
  };

  const handleJob = (payload: JobIngestPayload) => {
    setError(null);
    jobIngest.mutate(payload, {
      onSuccess: (data) => setJobId(data.jobId),
      onError: (e) => setError(messageOf(e, "Couldn’t read that job. Check the URL or paste the text.")),
    });
  };

  const handleRun = () => {
    if (!resumeId) return;
    setError(null);
    runAnalysis.mutate(
      { resumeId, jobId: jobId ?? undefined },
      {
        onSuccess: (data) => navigate(`/analysis/${data.taskId}`),
        onError: (e) => setError(messageOf(e, "Could not start analysis. Please try again.")),
      },
    );
  };

  const ready = Boolean(resumeId);

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Analyze your resume
        </h1>
        <p className="mt-2 text-sm font-normal text-slate-500 dark:text-slate-400">
          Upload a PDF for a full Career Intelligence Report. A job description is optional.
        </p>
      </div>

      <DropZone
        onSelect={handleFile}
        isUploading={resumeUpload.isPending}
        isDone={Boolean(resumeId)}
        parsedName={resumeUpload.data?.parsedData.name}
      />

      <JobInputCard
        onSubmit={handleJob}
        isSubmitting={jobIngest.isPending}
        isDone={Boolean(jobId)}
        jobTitle={jobIngest.data?.jobData.title}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-normal text-slate-400">
          {jobId ? "Resume + job match" : "Resume-only Career Intelligence"}
        </span>
        <Button size="lg" onClick={handleRun} disabled={!ready || runAnalysis.isPending}>
          {runAnalysis.isPending ? "Starting…" : jobId ? "Run analysis" : "Analyze resume"}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
