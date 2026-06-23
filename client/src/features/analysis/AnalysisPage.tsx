import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { StatusPill } from "../../components/shared/StatusPill";
import { Button } from "../../components/ui/button";
import { Card, CardBody } from "../../components/ui/card";
import { Check, Copy, Printer, Share } from "../../components/ui/icons";
import { Section } from "../../components/ui/Section";
import { copyReport, printReport, shareReport } from "../../lib/export";
import type { AnalysisResult, JobMatch } from "../../types/analysis.types";
import { AtsAnalysis } from "./components/AtsAnalysis";
import { CareerProjection } from "./components/CareerProjection";
import { CredibilityFlags } from "./components/CredibilityFlags";
import { GapAnalysisView } from "./components/GapAnalysisView";
import { MarketPositioning } from "./components/MarketPositioning";
import { ProjectAssessments } from "./components/ProjectAssessments";
import { QuestionTable } from "./components/QuestionTable";
import { ReadinessGauge } from "./components/ReadinessGauge";
import { RecruiterSimulation } from "./components/RecruiterSimulation";
import { ReportSkeleton } from "./components/ReportSkeleton";
import { RoiImprovements } from "./components/RoiImprovements";
import { SectionReviews } from "./components/SectionReviews";
import { SkillGapCard } from "./components/SkillGapCard";
import { SummaryBar } from "./components/SummaryBar";
import { useAnalysis } from "./hooks/useAnalysis";

function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card className="animate-fade-in">
      <CardBody>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {children && (
          <div className="mt-1 text-sm font-normal text-slate-500 dark:text-slate-400">
            {children}
          </div>
        )}
        <Link
          to="/analyze"
          className="mt-4 inline-block rounded-lg text-sm font-semibold text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
        >
          ← Start over
        </Link>
      </CardBody>
    </Card>
  );
}

function ExportBar({ result }: { result: AnalysisResult }) {
  const [msg, setMsg] = useState<string | null>(null);
  const flash = (text: string) => {
    setMsg(text);
    window.setTimeout(() => setMsg(null), 2000);
  };
  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <Button variant="secondary" onClick={() => copyReport(result).then(() => flash("Copied"))}>
        <Copy className="h-4 w-4" /> Copy
      </Button>
      <Button variant="secondary" onClick={() => printReport()}>
        <Printer className="h-4 w-4" /> Save as PDF
      </Button>
      <Button
        variant="secondary"
        onClick={() => shareReport(result).then((r) => flash(r === "shared" ? "Shared" : "Link copied"))}
      >
        <Share className="h-4 w-4" /> Share
      </Button>
      {msg && (
        <span className="flex items-center gap-1 text-sm font-semibold text-green-700 dark:text-green-400">
          <Check className="h-4 w-4" /> {msg}
        </span>
      )}
    </div>
  );
}

function JobMatchSection({ jobMatch }: { jobMatch: JobMatch }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-col items-center gap-4 sm:flex-row">
          <ReadinessGauge score={jobMatch.readinessScore} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Match summary</h3>
            <p className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-300">
              {jobMatch.summary ?? "No summary provided."}
            </p>
          </div>
        </CardBody>
      </Card>
      <div className="space-y-2">
        {jobMatch.skillGaps.map((gap) => (
          <SkillGapCard key={gap.skill} gap={gap} />
        ))}
      </div>
      <QuestionTable questions={jobMatch.predictedQuestions} />
    </div>
  );
}

export function AnalysisPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { data, isError } = useAnalysis(taskId);

  if (isError) {
    return (
      <Notice title="Couldn’t load your report">
        The analysis link may have expired. Please run a new analysis.
      </Notice>
    );
  }

  if (!data || data.status === "pending" || data.status === "running") {
    return <ReportSkeleton />;
  }

  if (data.status === "failed") {
    return (
      <Notice title="Analysis failed">
        {data.error ?? "Something went wrong. Please try running it again."}
      </Notice>
    );
  }

  const result = data.result;
  if (!result || !result.careerReport) {
    return <Notice title="No report available">Please run a new analysis.</Notice>;
  }

  const report = result.careerReport;

  return (
    <div className="animate-fade-in">
      <SummaryBar report={report} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Your report
          </h1>
          <StatusPill
            label={result.mode === "job_match" ? "Resume + job" : "Resume only"}
            tone={result.mode === "job_match" ? "indigo" : "slate"}
          />
        </div>
        <ExportBar result={result} />
      </div>

      {/* Summary + detected context (visible by default) */}
      <Card className="mb-6">
        <CardBody>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusPill label={`stage: ${report.candidateContext.stage}`} tone="indigo" />
          </div>
          <p className="text-sm font-normal text-slate-700 dark:text-slate-200">
            {report.overallSummary}
          </p>
          <p className="mt-2 text-sm font-normal text-slate-500 dark:text-slate-400">
            {report.candidateContext.reasoning}
          </p>
        </CardBody>
      </Card>

      <div className="space-y-4">
        <Section title="Recruiter Simulation" subtitle="10s / 30s / full review + verdict" defaultOpen>
          <RecruiterSimulation sim={report.recruiterSimulation} />
        </Section>

        <Section title="Career Projection" subtitle="Probabilities with evidence + confidence">
          <CareerProjection data={report.careerProjection} />
        </Section>

        <Section title="ATS Analysis" subtitle="Parsing, structure, keywords + how ATS reads it">
          <AtsAnalysis ats={report.ats} />
        </Section>

        <Section title="Section-by-Section Review" subtitle={`${report.sectionReviews.length} sections`}>
          <SectionReviews reviews={report.sectionReviews} />
        </Section>

        <Section title="Project Assessment" subtitle="Judged by purpose — engineering vs business impact">
          <ProjectAssessments projects={report.projectAssessments} />
        </Section>

        <Section title="Market Positioning" subtitle="Realistic / stretch / unlikely roles">
          <MarketPositioning data={report.marketPositioning} />
        </Section>

        <Section title="Gap to Next Level" subtitle="Why employers care + how to acquire">
          <GapAnalysisView data={report.gapAnalysis} />
        </Section>

        <Section title="Credibility Flags" subtitle={`${report.credibilityIssues.length} flagged`}>
          <CredibilityFlags issues={report.credibilityIssues} />
        </Section>

        <Section title="High-ROI Improvements" subtitle="Resume edits ranked by impact">
          <RoiImprovements items={report.roiImprovements} />
        </Section>

        {report.strengths.length > 0 && (
          <Section title="Genuine Strengths" subtitle="Backed by evidence">
            <div className="space-y-2">
              {report.strengths.map((s, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {s.strength}
                    </p>
                    <StatusPill
                      label={`confidence: ${s.confidence}`}
                      tone={s.confidence === "high" ? "green" : s.confidence === "medium" ? "amber" : "slate"}
                    />
                  </div>
                  <p className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-300">
                    {s.evidence}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {result.jobMatch && (
          <Section title="Job Match Analysis" subtitle="Skill gaps + predicted questions">
            <JobMatchSection jobMatch={result.jobMatch} />
          </Section>
        )}
      </div>
    </div>
  );
}
