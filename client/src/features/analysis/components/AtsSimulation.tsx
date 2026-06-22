import { cn } from "../../../lib/cn";
import { AlertTriangle, Check, X } from "../../../components/ui/icons";
import type { AtsField, AtsSimulation as AtsSim } from "../../../types/analysis.types";

const META: Record<AtsField["status"], { label: string; cls: string; Icon: typeof Check }> = {
  pass: { label: "PASS", cls: "text-green-700 dark:text-green-400", Icon: Check },
  fail: { label: "FAIL", cls: "text-red-700 dark:text-red-400", Icon: X },
  at_risk: { label: "AT RISK", cls: "text-amber-700 dark:text-amber-400", Icon: AlertTriangle },
};

export function AtsSimulation({ sim }: { sim: AtsSim }) {
  return (
    <div className="space-y-2">
      {sim.fields.map((f) => {
        const m = META[f.status];
        return (
          <div
            key={f.field}
            className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
          >
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

      {sim.parsingRisks.length > 0 && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-950/40">
          <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">
            Parsing risks
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-amber-800 dark:text-amber-300">
            {sim.parsingRisks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
