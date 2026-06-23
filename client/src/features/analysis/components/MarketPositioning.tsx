import { ConfidenceTag } from "../../../components/shared/ConfidenceTag";
import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import { cn } from "../../../lib/cn";
import type { MarketPositioning as Positioning, RoleFit } from "../../../types/analysis.types";

const TIER_ORDER: RoleFit["tier"][] = ["realistic", "stretch", "unlikely"];
const TIER_TONE: Record<RoleFit["tier"], PillTone> = {
  realistic: "green",
  stretch: "amber",
  unlikely: "red",
};

function scoreTone(score: number): PillTone {
  return score >= 70 ? "green" : score >= 40 ? "amber" : "red";
}

function RoleRow({ role }: { role: RoleFit }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        role.tier === "realistic"
          ? "border-slate-200 dark:border-slate-800"
          : "border-dashed border-slate-300 dark:border-slate-700",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{role.role}</span>
          <StatusPill label={role.tier} tone={TIER_TONE[role.tier]} />
        </div>
        <div className="flex items-center gap-2">
          <StatusPill label={`${role.fitScore}`} tone={scoreTone(role.fitScore)} />
          <ConfidenceTag value={role.confidence} />
        </div>
      </div>
      {(role.whyFits.length > 0 || role.whyNot.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {role.whyFits.map((w, i) => (
            <span
              key={`f${i}`}
              className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300"
            >
              + {w}
            </span>
          ))}
          {role.whyNot.map((w, i) => (
            <span
              key={`n${i}`}
              className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300"
            >
              − {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function MarketPositioning({ data }: { data: Positioning }) {
  const sorted = [...data.roles].sort(
    (a, b) =>
      TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || b.fitScore - a.fitScore,
  );
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        <span className="font-semibold">Current level: </span>
        {data.currentLevel} — {data.reasoning}
      </p>
      {sorted.map((role, i) => (
        <RoleRow key={i} role={role} />
      ))}
    </div>
  );
}
