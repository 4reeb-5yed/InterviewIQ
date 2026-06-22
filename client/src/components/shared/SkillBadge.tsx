import type { GapStatus } from "../../types/analysis.types";

const STYLES: Record<GapStatus, string> = {
  matched: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  missing: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function SkillBadge({ status }: { status: GapStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STYLES[status]}`}>
      {status}
    </span>
  );
}
