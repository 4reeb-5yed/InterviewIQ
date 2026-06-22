import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import type { JobIngestPayload } from "../../services/scraper.service";
import { ApiError } from "../../types/api.types";
import { DropZone } from "./components/DropZone";
import { JobInputCard } from "./components/JobInputCard";
import { Stepper } from "./components/Stepper";
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
      onError: (e) => setError(messageOf(e, "Upload failed")),
    });
  };

  const handleJob = (payload: JobIngestPayload) => {
    setError(null);
    jobIngest.mutate(payload, {
      onSuccess: (data) => setJobId(data.jobId),
      onError: (e) => setError(messageOf(e, "Job ingestion failed")),
    });
  };

  const handleRun = () => {
    if (!resumeId || !jobId) return;
    setError(null);
    runAnalysis.mutate(
      { resumeId, jobId },
      {
        onSuccess: (data) => navigate(`/analysis/${data.taskId}`),
        onError: (e) => setError(messageOf(e, "Could not start analysis")),
      },
    );
  };

  const ready = Boolean(resumeId && jobId);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analyze your interview readiness</h1>
        <p className="text-sm text-slate-500">
          Upload your resume and a target job to get a skill-gap analysis and predicted questions.
        </p>
      </div>

      <Stepper
        steps={[
          { label: "Resume", complete: Boolean(resumeId) },
          { label: "Job", complete: Boolean(jobId) },
          { label: "Analyze", complete: false },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <DropZone
          onSelect={handleFile}
          isUploading={resumeUpload.isPending}
          isDone={Boolean(resumeId)}
          fileName={resumeUpload.data?.parsedData.name}
        />
        <JobInputCard
          onSubmit={handleJob}
          isSubmitting={jobIngest.isPending}
          isDone={Boolean(jobId)}
          jobTitle={jobIngest.data?.jobData.title}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleRun} disabled={!ready || runAnalysis.isPending}>
          {runAnalysis.isPending ? "Starting…" : "Run Analysis"}
        </Button>
      </div>
    </div>
  );
}
