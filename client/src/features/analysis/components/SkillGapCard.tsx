import { SkillBadge } from "../../../components/shared/SkillBadge";
import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import type { Importance, SkillGap } from "../../../types/analysis.types";

const IMPORTANCE_TONE: Record<Importance, PillTone> = {
  critical: "red",
  moderate: "amber",
  low: "slate",
};

export function SkillGapCard({ gap }: { gap: SkillGap }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="font-medium text-slate-800">{gap.skill}</span>
        <SkillBadge status={gap.status} />
      </div>
      <div className="flex items-center gap-3">
        <StatusPill label={gap.importance} tone={IMPORTANCE_TONE[gap.importance]} />
        <span className="text-xs text-slate-400">{Math.round(gap.confidenceScore * 100)}%</span>
      </div>
    </div>
  );
}
