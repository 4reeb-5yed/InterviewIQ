import type { CareerProjection as Projection } from "../../../types/analysis.types";
import { ScoreCard } from "./ScoreCard";

export function CareerProjection({ data }: { data: Projection }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ScoreCard title="Employability" dimension={data.employability} />
      <ScoreCard title="Internship Probability" dimension={data.internshipProbability} />
      <ScoreCard title="Entry-Level Probability" dimension={data.entryLevelProbability} />
      <ScoreCard title="Interview Probability" dimension={data.interviewProbability} kind="strict" />
      <ScoreCard title="Startup Suitability" dimension={data.startupSuitability} />
      <ScoreCard title="Enterprise Suitability" dimension={data.enterpriseSuitability} />
    </div>
  );
}
