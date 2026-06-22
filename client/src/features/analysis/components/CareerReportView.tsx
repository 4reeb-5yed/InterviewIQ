import { Card, CardBody, CardHeader } from "../../../components/ui/card";
import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import type { CareerReport } from "../../../types/analysis.types";

function scoreTone(score: number): PillTone {
  return score >= 70 ? "green" : score >= 40 ? "amber" : "red";
}

function impactTone(level: string): PillTone {
  return level === "high" || level === "critical" ? "red" : level === "medium" || level === "recommended" ? "amber" : "slate";
}

function ScoreHeader({ title, score, rating }: { title: string; score: number; rating: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-medium text-slate-800">{title}</h3>
      <div className="flex items-center gap-2">
        <StatusPill label={rating} tone={scoreTone(score)} />
        <span className="text-lg font-semibold text-slate-900">{score}</span>
        <span className="text-xs text-slate-400">/100</span>
      </div>
    </div>
  );
}

function Reasoning({ text }: { text: string }) {
  return <p className="mt-1 text-sm text-slate-600">{text}</p>;
}

function Evidence({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-500">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function CareerReportView({ report }: { report: CareerReport }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h2 className="font-medium text-slate-800">Career Intelligence — summary</h2>
          <p className="mt-1 text-sm text-slate-600">{report.overallSummary}</p>
        </CardBody>
      </Card>

      {/* Headline scores */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <ScoreHeader title="ATS Readiness" score={report.atsReadiness.score} rating={report.atsReadiness.rating} />
            <Reasoning text={report.atsReadiness.reasoning} />
            <Evidence items={report.atsReadiness.evidence} />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <ScoreHeader title="Resume Quality" score={report.resumeQuality.score} rating={report.resumeQuality.rating} />
            <Reasoning text={report.resumeQuality.reasoning} />
            <Evidence items={report.resumeQuality.evidence} />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <ScoreHeader title="Employability" score={report.employability.score} rating={report.employability.rating} />
            <Reasoning text={report.employability.reasoning} />
            <Evidence items={report.employability.evidence} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody>
            <ScoreHeader
              title="Recruiter Interview Probability"
              score={report.interviewProbability.score}
              rating={report.interviewProbability.rating}
            />
            <Reasoning text={report.interviewProbability.reasoning} />
            <Evidence items={report.interviewProbability.evidence} />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-800">Current Career Level</h3>
              <StatusPill label={report.careerLevel.level} tone="indigo" />
            </div>
            <Reasoning text={report.careerLevel.reasoning} />
            <Evidence items={report.careerLevel.evidence} />
          </CardBody>
        </Card>
      </div>

      {/* ATS issues */}
      {report.atsReadiness.issues.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-medium text-slate-800">ATS Issues</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {report.atsReadiness.issues.map((issue, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  <StatusPill label={issue.severity} tone={impactTone(issue.severity)} />
                  <span className="font-medium text-slate-800">{issue.issue}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{issue.reasoning}</p>
                <p className="mt-1 text-xs text-green-700">Fix: {issue.fix}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Strengths & weaknesses */}
      <Card>
        <CardHeader>
          <h3 className="font-medium text-slate-800">Strengths &amp; Weaknesses</h3>
        </CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-green-700">Strengths</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {report.strengthsWeaknesses.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-red-700">Weaknesses</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {report.strengthsWeaknesses.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
          <p className="md:col-span-2 text-sm text-slate-500">{report.strengthsWeaknesses.reasoning}</p>
        </CardBody>
      </Card>

      {/* Role matches */}
      <Card>
        <CardHeader>
          <h3 className="font-medium text-slate-800">Role Match Analysis</h3>
        </CardHeader>
        <CardBody className="space-y-2">
          {report.roleMatches.map((role, i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <span className="font-medium text-slate-800">{role.role}</span>
                <p className="text-sm text-slate-600">{role.reasoning}</p>
              </div>
              <StatusPill label={`${role.fitScore}`} tone={scoreTone(role.fitScore)} />
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Gap to next level */}
      <Card>
        <CardHeader>
          <h3 className="font-medium text-slate-800">
            Gap to Next Level — {report.gapToNextLevel.targetLevel}
          </h3>
        </CardHeader>
        <CardBody className="space-y-2">
          <p className="text-sm text-slate-500">{report.gapToNextLevel.reasoning}</p>
          {report.gapToNextLevel.gaps.map((gap, i) => (
            <div key={i} className="rounded-lg border border-slate-200 px-4 py-3">
              <span className="font-medium text-slate-800">{gap.area}</span>
              <p className="text-sm text-indigo-700">→ {gap.action}</p>
              <p className="text-xs text-slate-500">{gap.reasoning}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* ROI improvements */}
      <Card>
        <CardHeader>
          <h3 className="font-medium text-slate-800">High-ROI Resume Improvements</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {report.roiImprovements.map((item, i) => (
            <div key={i} className="rounded-lg border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <StatusPill label={item.impact} tone={impactTone(item.impact)} />
                <span className="font-medium text-slate-800">{item.change}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.reasoning}</p>
              {item.exampleBefore && (
                <p className="mt-1 text-xs text-red-600">Before: {item.exampleBefore}</p>
              )}
              {item.exampleAfter && (
                <p className="text-xs text-green-700">After: {item.exampleAfter}</p>
              )}
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Career roadmap */}
      <Card>
        <CardHeader>
          <h3 className="font-medium text-slate-800">Career Roadmap</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {report.careerRoadmap.map((step, i) => (
            <div key={i} className="rounded-lg border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <StatusPill label={step.timeframe} tone="indigo" />
                <span className="font-medium text-slate-800">{step.focus}</span>
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {step.actions.map((a, j) => <li key={j}>{a}</li>)}
              </ul>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Missing sections + hidden strengths */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-medium text-slate-800">Missing Sections</h3>
          </CardHeader>
          <CardBody className="space-y-2">
            {report.missingSections.length === 0 ? (
              <p className="text-sm text-slate-500">No critical sections missing.</p>
            ) : (
              report.missingSections.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <StatusPill label={m.importance} tone={impactTone(m.importance)} />
                  <div>
                    <span className="text-sm font-medium text-slate-800">{m.section}</span>
                    <p className="text-xs text-slate-500">{m.reasoning}</p>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-medium text-slate-800">Hidden Strengths</h3>
          </CardHeader>
          <CardBody className="space-y-2">
            {report.hiddenStrengths.map((h, i) => (
              <div key={i} className="rounded-lg border border-slate-200 px-4 py-3">
                <span className="text-sm font-medium text-slate-800">{h.strength}</span>
                <p className="text-xs text-slate-500">Evidence: {h.evidence}</p>
                <p className="text-xs text-indigo-700">Leverage: {h.howToLeverage}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
