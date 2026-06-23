import type { AnalysisResult, CareerReport, ScoredDimension } from "../types/analysis.types";

function dim(label: string, d: ScoredDimension): string {
  const value = d.status === "insufficient_data" || d.score === null ? "Insufficient evidence" : `${d.score}/100`;
  return `- ${label}: ${value} (confidence: ${d.confidence})`;
}

function careerLines(r: CareerReport): string[] {
  const p = r.careerProjection;
  return [
    "# InterviewIQ — Career Intelligence Report",
    "",
    `Stage: ${r.candidateContext.stage} · Recruiter verdict: ${r.recruiterSimulation.verdict}`,
    "",
    r.overallSummary,
    "",
    "## Career projection",
    dim("Employability", p.employability),
    dim("Internship probability", p.internshipProbability),
    dim("Entry-level probability", p.entryLevelProbability),
    dim("Interview probability", p.interviewProbability),
    dim("Startup suitability", p.startupSuitability),
    dim("Enterprise suitability", p.enterpriseSuitability),
    "",
    `## ATS: ${r.ats.score ?? "N/A"}/100 (confidence: ${r.ats.confidence})`,
    r.ats.interpretation,
    "",
    "## Market positioning",
    `Current level: ${r.marketPositioning.currentLevel}`,
    ...r.marketPositioning.roles
      .slice(0, 6)
      .map((m) => `- ${m.role} — ${m.tier} (${m.fitScore}/100)`),
    "",
    "## Top improvements",
    ...r.roiImprovements.slice(0, 5).map((i) => `- [${i.priority}] ${i.change}`),
    "",
    "## Credibility flags",
    ...(r.credibilityIssues.length
      ? r.credibilityIssues.slice(0, 7).map((c) => `- ${c.issueType}: ${c.whyFlagged}`)
      : ["- None flagged"]),
  ];
}

export function buildReportText(result: AnalysisResult): string {
  if (!result.careerReport) return "InterviewIQ report";
  const lines = careerLines(result.careerReport);
  if (result.jobMatch) {
    lines.push(
      "",
      "## Job match",
      `- Readiness: ${result.jobMatch.readinessScore ?? "N/A"}/100`,
      result.jobMatch.summary ?? "",
    );
  }
  return lines.join("\n");
}

export async function copyReport(result: AnalysisResult): Promise<void> {
  await navigator.clipboard.writeText(buildReportText(result));
}

export async function shareReport(result: AnalysisResult): Promise<"shared" | "copied"> {
  const text = buildReportText(result);
  const url = window.location.href;
  if (navigator.share) {
    await navigator.share({ title: "InterviewIQ report", text, url });
    return "shared";
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}

export function printReport(): void {
  window.print();
}
