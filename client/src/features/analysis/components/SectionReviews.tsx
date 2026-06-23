import { ConfidenceTag } from "../../../components/shared/ConfidenceTag";
import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import type { SectionReview } from "../../../types/analysis.types";

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

export function SectionReviews({ reviews }: { reviews: SectionReview[] }) {
  return (
    <div className="space-y-3">
      {reviews.map((r, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {r.section}
            </span>
            <div className="flex items-center gap-2">
              {r.status === "missing" ? (
                <StatusPill label="missing" tone="red" />
              ) : (
                <StatusPill label={r.score === null ? "n/a" : `${r.score}`} tone={scoreTone(r.score)} />
              )}
              <ConfidenceTag value={r.confidence} />
            </div>
          </div>
          <Mini title="Strengths" items={r.strengths} color="text-green-700 dark:text-green-400" />
          <Mini title="Weaknesses" items={r.weaknesses} color="text-red-700 dark:text-red-400" />
          <Mini title="Missing" items={r.missingElements} color="text-amber-700 dark:text-amber-400" />
          <Mini title="Recommendations" items={r.recommendations} color="text-slate-500" />
        </div>
      ))}
    </div>
  );
}
