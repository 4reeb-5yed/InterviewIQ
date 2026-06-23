import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import type { CareerReport, Verdict } from "../../../types/analysis.types";

const VERDICT_TONE: Record<Verdict, PillTone> = {
  "Strong Shortlist": "green",
  Shortlist: "green",
  Maybe: "amber",
  "Weak Maybe": "amber",
  Reject: "red",
};

export function SummaryBar({ report }: { report: CareerReport }) {
  const verdict = report.recruiterSimulation.verdict;
  const flags = report.recruiterSimulation.thirtySecond.concerns.slice(0, 2);
  const bestRealistic = [...report.marketPositioning.roles]
    .filter((r) => r.tier === "realistic")
    .sort((a, b) => b.fitScore - a.fitScore)[0];

  return (
    <div className="no-print sticky top-16 z-20 -mx-4 mb-6 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-2">
          <span className="text-xs font-normal text-slate-400">Verdict</span>
          <StatusPill label={verdict} tone={VERDICT_TONE[verdict]} />
        </span>

        <span className="hidden items-center gap-2 sm:flex">
          <span className="text-xs font-normal text-slate-400">Level</span>
          <StatusPill label={report.marketPositioning.currentLevel || "Unclassified"} tone="indigo" />
        </span>

        <span className="hidden items-center gap-2 sm:flex">
          <span className="text-xs font-normal text-slate-400">Flags</span>
          {flags.length ? (
            flags.map((f, i) => <StatusPill key={i} label={f} tone="red" />)
          ) : (
            <StatusPill label="none critical" tone="green" />
          )}
        </span>

        {bestRealistic && (
          <span className="hidden items-center gap-2 lg:flex">
            <span className="text-xs font-normal text-slate-400">Best fit</span>
            <StatusPill label={`${bestRealistic.role} ${bestRealistic.fitScore}`} tone="green" />
          </span>
        )}
      </div>
    </div>
  );
}
