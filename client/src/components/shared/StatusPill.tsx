export type PillTone = "red" | "amber" | "slate" | "green" | "indigo";

const STYLES: Record<PillTone, string> = {
  red: "bg-red-50 text-red-700 ring-red-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  slate: "bg-slate-50 text-slate-600 ring-slate-200",
  green: "bg-green-50 text-green-700 ring-green-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

interface StatusPillProps {
  label: string;
  tone?: PillTone;
}

export function StatusPill({ label, tone = "slate" }: StatusPillProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STYLES[tone]}`}
    >
      {label}
    </span>
  );
}
