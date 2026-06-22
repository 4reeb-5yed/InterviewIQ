import type { GapStatus } from "../../types/analysis.types";

const STYLES: Record<GapStatus, string> = {
  matched: "bg-green-100 text-green-700",
  partial: "bg-amber-100 text-amber-700",
  missing: "bg-red-100 text-red-700",
};

export function SkillBadge({ status }: { status: GapStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STYLES[status]}`}>
      {status}
    </span>
  );
}
