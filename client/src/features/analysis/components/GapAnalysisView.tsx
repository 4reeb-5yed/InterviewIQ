import { StatusPill } from "../../../components/shared/StatusPill";
import { ArrowRight } from "../../../components/ui/icons";
import type { GapAnalysis } from "../../../types/analysis.types";

export function GapAnalysisView({ data }: { data: GapAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill label={data.currentLevel || "current"} tone="slate" />
        <ArrowRight className="h-4 w-4 text-slate-400" />
        <StatusPill label={data.targetLevel || "next"} tone="indigo" />
      </div>

      <div className="space-y-3">
        {data.gaps.map((gap, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{gap.gap}</p>
            <p className="mt-2 text-sm font-normal text-slate-600 dark:text-slate-300">
              <span className="font-semibold">Why it matters: </span>
              {gap.whyItMatters}
            </p>
            <p className="mt-1 text-sm font-normal text-indigo-700 dark:text-indigo-300">
              <span className="font-semibold">How to acquire: </span>
              {gap.howToAcquire}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
