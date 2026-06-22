import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export type PillTone = "green" | "amber" | "red" | "slate" | "indigo";

const STYLES: Record<PillTone, string> = {
  green:
    "bg-green-50 text-green-700 ring-green-200 dark:bg-green-950 dark:text-green-300 dark:ring-green-900",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  red: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900",
  slate:
    "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  indigo:
    "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900",
};

interface StatusPillProps {
  label: string;
  tone?: PillTone;
  icon?: ReactNode;
}

export function StatusPill({ label, tone = "slate", icon }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset",
        STYLES[tone],
      )}
    >
      {icon}
      {label}
    </span>
  );
}
