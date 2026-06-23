import { ConfidenceTag } from "../../../components/shared/ConfidenceTag";
import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import { Card, CardBody } from "../../../components/ui/card";
import type { RecruiterSimulation as Sim, Verdict } from "../../../types/analysis.types";

const VERDICT_TONE: Record<Verdict, PillTone> = {
  "Strong Shortlist": "green",
  Shortlist: "green",
  Maybe: "amber",
  "Weak Maybe": "amber",
  Reject: "red",
};

function Bullets({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className={`text-xs font-semibold uppercase ${color}`}>{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export function RecruiterSimulation({ sim }: { sim: Sim }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Verdict</span>
            <StatusPill label={sim.verdict} tone={VERDICT_TONE[sim.verdict]} />
            <ConfidenceTag value={sim.confidence} />
          </div>
          <p className="mt-2 text-sm font-normal text-slate-600 dark:text-slate-300">
            {sim.verdictReasoning}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              10-second scan
            </h3>
            <StatusPill
              label={`keeps reading: ${sim.tenSecond.keepsReadingProbability}%`}
              tone={
                sim.tenSecond.keepsReadingProbability >= 60
                  ? "green"
                  : sim.tenSecond.keepsReadingProbability >= 35
                    ? "amber"
                    : "red"
              }
            />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {sim.tenSecond.firstImpression}
          </p>
          <p className="text-sm text-green-700 dark:text-green-400">
            + {sim.tenSecond.mostNoticeableStrength}
          </p>
          <p className="text-sm text-red-700 dark:text-red-400">
            − {sim.tenSecond.mostNoticeableWeakness}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">30-second scan</h3>
          <Bullets title="What they learn" items={sim.thirtySecond.whatRecruiterLearns} color="text-slate-500" />
          <Bullets title="Positive signals" items={sim.thirtySecond.positiveSignals} color="text-green-700 dark:text-green-400" />
          <Bullets title="Concerns" items={sim.thirtySecond.concerns} color="text-red-700 dark:text-red-400" />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Full review</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{sim.fullReview.overallAssessment}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Hireability: </span>
            {sim.fullReview.hireability}
          </p>
          <Bullets title="Strong points" items={sim.fullReview.strongPoints} color="text-green-700 dark:text-green-400" />
          <Bullets title="Risks" items={sim.fullReview.risks} color="text-red-700 dark:text-red-400" />
        </CardBody>
      </Card>
    </div>
  );
}
