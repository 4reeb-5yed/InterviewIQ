import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import type { ROIImprovement } from "../../../types/analysis.types";

const PRIORITY_TONE: Record<ROIImprovement["priority"], PillTone> = {
  high: "red",
  medium: "amber",
  low: "slate",
};

export function RoiImprovements({ items }: { items: ROIImprovement[] }) {
  const ranked = [...items].sort(
    (a, b) =>
      ["high", "medium", "low"].indexOf(a.priority) - ["high", "medium", "low"].indexOf(b.priority),
  );
  return (
    <div className="space-y-3">
      {ranked.map((item, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <StatusPill label={`${item.priority} ROI`} tone={PRIORITY_TONE[item.priority]} />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {item.change}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Why it matters: </span>
            {item.whyItMatters}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Expected benefit: </span>
            {item.expectedBenefit}
            <span className="text-slate-400"> — {item.estimatedImpact}</span>
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
              <p className="text-xs font-semibold uppercase text-red-700 dark:text-red-400">Before</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{item.before}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
              <p className="text-xs font-semibold uppercase text-green-700 dark:text-green-400">After</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{item.after}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
