import { ConfidenceTag } from "../../../components/shared/ConfidenceTag";
import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import type { ProjectAssessment } from "../../../types/analysis.types";

function scoreTone(score: number | null): PillTone {
  if (score === null) return "slate";
  return score >= 70 ? "green" : score >= 40 ? "amber" : "red";
}

function Mini({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <p className={`text-xs font-semibold uppercase ${color}`}>{title}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectAssessments({ projects }: { projects: ProjectAssessment[] }) {
  if (projects.length === 0) {
    return (
      <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
        No distinct projects detected to assess.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {projects.map((p, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
            <div className="flex items-center gap-2">
              <StatusPill label={p.category} tone="indigo" />
              <StatusPill label={p.score === null ? "n/a" : `${p.score}`} tone={scoreTone(p.score)} />
              <ConfidenceTag value={p.confidence} />
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Engineering impact: </span>
            {p.engineeringImpact}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Business impact: </span>
            {p.businessImpact ?? "Insufficient Evidence"}
          </p>

          <Mini title="Engineering signals" items={p.engineeringSignals} color="text-green-700 dark:text-green-400" />
          <Mini title="Strengths" items={p.strengths} color="text-green-700 dark:text-green-400" />
          <Mini title="Weaknesses" items={p.weaknesses} color="text-red-700 dark:text-red-400" />
          <Mini title="Missing evidence" items={p.missingEvidence} color="text-amber-700 dark:text-amber-400" />
        </div>
      ))}
    </div>
  );
}
