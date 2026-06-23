import { StatusPill, type PillTone } from "./StatusPill";
import type { Confidence } from "../../types/analysis.types";

const TONE: Record<Confidence, PillTone> = { high: "green", medium: "amber", low: "slate" };

export function ConfidenceTag({ value }: { value: Confidence }) {
  return <StatusPill label={`confidence: ${value}`} tone={TONE[value]} />;
}
