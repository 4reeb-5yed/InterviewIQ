import { ConfidenceTag } from "../../../components/shared/ConfidenceTag";
import { StatusPill, type PillTone } from "../../../components/shared/StatusPill";
import { Card, CardBody } from "../../../components/ui/card";
import { Check, Flag } from "../../../components/ui/icons";
import type { ScoredDimension } from "../../../types/analysis.types";

interface ScoreCardProps {
  title: string;
  dimension: ScoredDimension;
  /** "strict" applies tighter thresholds (e.g. interview probability). */
  kind?: "standard" | "strict";
}

function tone(score: number, strict: boolean): PillTone {
  if (strict) return score >= 80 ? "green" : score >= 60 ? "amber" : "red";
  return score >= 70 ? "green" : score >= 40 ? "amber" : "red";
}

function label(score: number, strict: boolean): string {
  const t = tone(score, strict);
  return t === "green" ? "strong" : t === "amber" ? "at risk" : "weak";
}

export function ScoreCard({ title, dimension, kind = "standard" }: ScoreCardProps) {
  const strict = kind === "strict";
  const insufficient = dimension.status === "insufficient_data" || dimension.score === null;
  const score = dimension.score as number;

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {insufficient ? (
            <StatusPill label="insufficient evidence" tone="slate" />
          ) : (
            <div className="flex items-center gap-2">
              <StatusPill label={label(score, strict)} tone={tone(score, strict)} />
              <span className="text-3xl font-semibold leading-none text-slate-900 dark:text-slate-100">
                {dimension.score}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2">
          <ConfidenceTag value={dimension.confidence} />
        </div>

        <p className="mt-3 text-sm font-normal text-slate-600 dark:text-slate-300">
          {insufficient ? dimension.reason ?? dimension.reasoning : dimension.reasoning}
        </p>

        {dimension.evidenceFound.length > 0 && (
          <ul className="mt-3 space-y-1">
            {dimension.evidenceFound.map((e, i) => (
              <li key={i} className="flex gap-2 text-xs text-green-700 dark:text-green-400">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        )}

        {dimension.evidenceMissing.length > 0 && (
          <ul className="mt-2 space-y-1">
            {dimension.evidenceMissing.map((e, i) => (
              <li key={i} className="flex gap-2 text-xs text-amber-700 dark:text-amber-400">
                <Flag className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
