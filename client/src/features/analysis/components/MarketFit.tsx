import { cn } from "../../../lib/cn";
import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import type { RoleFit } from "../../../types/analysis.types";

function tone(score: number): PillTone {
  return score >= 70 ? "green" : score >= 40 ? "amber" : "red";
}

export function MarketFit({ roles }: { roles: RoleFit[] }) {
  const ranked = [...roles].sort((a, b) => b.fitScore - a.fitScore);
  return (
    <div className="space-y-3">
      {ranked.map((role, i) => (
        <div
          key={i}
          className={cn(
            "rounded-lg border p-4",
            role.tier === "stretch"
              ? "border-dashed border-slate-300 dark:border-slate-700"
              : "border-slate-200 dark:border-slate-800",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {role.role}
              </span>
              <StatusPill label={role.tier} tone={role.tier === "realistic" ? "indigo" : "slate"} />
            </div>
            <StatusPill label={`${role.fitScore}`} tone={tone(role.fitScore)} />
          </div>
          <p className="mt-2 text-sm font-normal text-slate-600 dark:text-slate-300">
            {role.reasoning}
          </p>
          {(role.fitDrivers.length > 0 || role.fitBlockers.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {role.fitDrivers.map((d, j) => (
                <span
                  key={`d${j}`}
                  className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300"
                >
                  + {d}
                </span>
              ))}
              {role.fitBlockers.map((b, j) => (
                <span
                  key={`b${j}`}
                  className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300"
                >
                  − {b}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
