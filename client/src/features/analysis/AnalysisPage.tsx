import { Link, useParams } from "react-router-dom";
import type { ReactNode } from "react";

import { Card, CardBody, CardHeader } from "../../components/ui/card";
import { QuestionTable } from "./components/QuestionTable";
import { ReadinessGauge } from "./components/ReadinessGauge";
import { SkillGapCard } from "./components/SkillGapCard";
import { useAnalysis } from "./hooks/useAnalysis";

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

export function AnalysisPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { data, isError } = useAnalysis(taskId);

  if (isError) {
    return <Notice title="Could not load analysis">Please try running the analysis again.</Notice>;
  }

  if (!data || data.status === "pending" || data.status === "running") {
    return (
      <Notice title="Analyzing…">
        Running the resume vs. job pipeline. This usually takes 15–30 seconds.
      </Notice>
    );
  }

  if (data.status === "failed") {
    return <Notice title="Analysis failed">{data.error ?? "An unexpected error occurred."}</Notice>;
  }

  const result = data.result;
  if (!result) {
    return <Notice title="No result available" />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analysis</h1>
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← New analysis
        </Link>
      </div>

      <Card>
        <CardBody className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <ReadinessGauge score={result.readinessScore} />
          <div className="flex-1">
            <h2 className="font-medium text-slate-800">Summary</h2>
            <p className="mt-1 text-sm text-slate-600">
              {result.summary ?? "No summary provided."}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium text-slate-800">Skill gaps</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {result.skillGaps.length === 0 ? (
            <p className="text-sm text-slate-500">No skill gaps identified.</p>
          ) : (
            result.skillGaps.map((gap) => <SkillGapCard key={gap.skill} gap={gap} />)
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium text-slate-800">Predicted questions</h2>
        </CardHeader>
        <CardBody>
          <QuestionTable questions={result.predictedQuestions} />
        </CardBody>
      </Card>
    </div>
  );
}
