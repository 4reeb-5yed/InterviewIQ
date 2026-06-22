import { StatusPill } from "../../../components/shared/StatusPill";
import type { CareerReport } from "../../../types/analysis.types";

function criticalFlags(report: CareerReport): string[] {
  const dims = [
    { name: "ATS", d: report.atsReadiness },
    { name: "Quality", d: report.resumeQuality },
    { name: "Employability", d: report.employability },
    { name: "Interview", d: report.interviewProbability },
  ];
  return dims
    .filter((x) => x.d.status === "ok" && x.d.score !== null && (x.d.score as number) < 60)
    .sort((a, b) => (a.d.score as number) - (b.d.score as number))
    .slice(0, 2)
    .map((x) => `${x.name} ${x.d.score}`);
}

export function SummaryBar({ report }: { report: CareerReport }) {
  const flags = criticalFlags(report);
  const strongest = [...report.marketFit].sort((a, b) => b.fitScore - a.fitScore)[0];

  return (
    <div className="no-print sticky top-16 z-20 -mx-4 mb-6 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Always visible — career level verdict */}
        <span className="flex items-center gap-2">
          <span className="text-xs font-normal text-slate-400">Level</span>
          <StatusPill label={report.careerLevel.level || "Unclassified"} tone="indigo" />
        </span>

        {/* Hidden on mobile — flags + strongest role */}
        <span className="hidden items-center gap-2 sm:flex">
          <span className="text-xs font-normal text-slate-400">Flags</span>
          {flags.length ? (
            flags.map((f) => <StatusPill key={f} label={f} tone="red" />)
          ) : (
            <StatusPill label="none critical" tone="green" />
          )}
        </span>

        {strongest && (
          <span className="hidden items-center gap-2 sm:flex">
            <span className="text-xs font-normal text-slate-400">Best fit</span>
            <StatusPill label={`${strongest.role} ${strongest.fitScore}`} tone="green" />
          </span>
        )}
      </div>
    </div>
  );
}
