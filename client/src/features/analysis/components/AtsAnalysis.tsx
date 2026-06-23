import { ConfidenceTag } from "../../../components/shared/ConfidenceTag";
import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import { cn } from "../../../lib/cn";
import { AlertTriangle, Check, X } from "../../../components/ui/icons";
import type { AtsAnalysis as Ats, AtsField } from "../../../types/analysis.types";

const FIELD_META: Record<AtsField["status"], { label: string; cls: string; Icon: typeof Check }> = {
  pass: { label: "PASS", cls: "text-green-700 dark:text-green-400", Icon: Check },
  fail: { label: "FAIL", cls: "text-red-700 dark:text-red-400", Icon: X },
  at_risk: { label: "AT RISK", cls: "text-amber-700 dark:text-amber-400", Icon: AlertTriangle },
};

function List({ items, tone }: { items: string[]; tone: PillTone }) {
  if (items.length === 0) return null;
  const color =
    tone === "red"
      ? "text-red-700 dark:text-red-400"
      : tone === "amber"
        ? "text-amber-700 dark:text-amber-400"
        : "text-green-700 dark:text-green-400";
  return (
    <ul className={cn("list-disc space-y-1 pl-5 text-sm", color)}>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function scoreTone(score: number): PillTone {
  return score >= 70 ? "green" : score >= 40 ? "amber" : "red";
}

export function AtsAnalysis({ ats }: { ats: Ats }) {
  const insufficient = ats.score === null;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {insufficient ? (
          <StatusPill label="insufficient evidence" tone="slate" />
        ) : (
          <StatusPill label={`ATS ${ats.score}`} tone={scoreTone(ats.score as number)} />
        )}
        <ConfidenceTag value={ats.confidence} />
      </div>

      <p className="text-sm font-normal text-slate-600 dark:text-slate-300">{ats.reasoning}</p>

      <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <span className="font-semibold">How an ATS likely reads this: </span>
        {ats.interpretation}
      </div>

      <div className="space-y-2">
        {ats.fields.map((f) => {
          const m = FIELD_META[f.status];
          return (
            <div key={f.field} className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {f.field}
                </span>
                <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", m.cls)}>
                  <m.Icon className="h-4 w-4" />
                  {m.label}
                </span>
              </div>
              <p className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-300">{f.reason}</p>
            </div>
          );
        })}
      </div>

      {ats.blockers.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-red-700 dark:text-red-400">Blockers</p>
          <List items={ats.blockers} tone="red" />
        </div>
      )}
      {ats.warnings.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">Warnings</p>
          <List items={ats.warnings} tone="amber" />
        </div>
      )}
      {ats.strengths.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-green-700 dark:text-green-400">Strengths</p>
          <List items={ats.strengths} tone="green" />
        </div>
      )}
      {ats.recommendations.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Recommendations</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
            {ats.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
