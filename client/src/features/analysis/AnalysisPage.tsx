import { Link, useParams } from "react-router-dom";
import type { ReactNode } from "react";

import { StatusPill } from "../../components/shared/StatusPill";
import { Card, CardBody, CardHeader } from "../../components/ui/card";
import { CareerReportView } from "./components/CareerReportView";
import { QuestionTable } from "./components/QuestionTable";
import { ReadinessGauge } from "./components/ReadinessGauge";
import { SkillGapCard } from "./components/SkillGapCard";
import { useAnalysis } from "./hooks/useAnalysis";
import type { JobMatch } from "../../types/analysis.types";

function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card className="animate-fade-in">
      <CardBody>
        <h2 className="font-medium text-slate-800">{title}</h2>
        {children && <div className="mt-1 text-sm text-slate-500">{children}</div>}
        <Link to="/" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          ← Start over
        </Link>
      </CardBody>
    </Card>
  );
}

function JobMatchSection({ jobMatch }: { jobMatch: JobMatch }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Job Match Analysis</h2>

      <Card>
        <CardBody className="flex flex-col items-center gap-4 sm:flex-row">
          <ReadinessGauge score={jobMatch.readinessScore} />
          <div className="flex-1">
            <h3 className="font-medium text-slate-800">Match summary</h3>
            <p className="mt-1 text-sm text-slate-600">
              {jobMatch.summary ?? "No summary provided."}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-medium text-slate-800">Skill gaps</h3>
        </CardHeader>
        <CardBody className="space-y-2">
          {jobMatch.skillGaps.length === 0 ? (
            <p className="text-sm text-slate-500">No skill gaps identified.</p>
          ) : (
            jobMatch.skillGaps.map((gap) => <SkillGapCard key={gap.skill} gap={gap} />)
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-medium text-slate-800">Predicted questions</h3>
        </CardHeader>
        <CardBody>
          <QuestionTable questions={jobMatch.predictedQuestions} />
        </CardBody>
      </Card>
    </div>
  );
}

export function AnalysisPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { data, isError } = useAnalysis(taskId);

  if (isError) {
    return <Notice title="Could not load analysis">Please try running the analysis again.</Notice>;
  }

  if (!data || data.status === "pending" || data.status === "running") {
    return (
      <Notice title="Analyzing…">
        Generating your Career Intelligence Report. This usually takes 15–30 seconds.
      </Notice>
    );
  }

  if (data.status === "failed") {
    return <Notice title="Analysis failed">{data.error ?? "An unexpected error occurred."}</Notice>;
  }

  const result = data.result;
  if (!result || !result.careerReport) {
    return <Notice title="No result available" />;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Career Intelligence</h1>
          <StatusPill
            label={result.mode === "job_match" ? "Resume + Job Match" : "Resume only"}
            tone={result.mode === "job_match" ? "indigo" : "slate"}
          />
        </div>
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← New analysis
        </Link>
      </div>

      <CareerReportView report={result.careerReport} />

      {result.jobMatch && <JobMatchSection jobMatch={result.jobMatch} />}
    </div>
  );
}
