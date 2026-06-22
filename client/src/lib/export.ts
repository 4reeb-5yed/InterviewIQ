import type { AnalysisResult, CareerReport } from "../types/analysis.types";

function careerLines(r: CareerReport): string[] {
  const dim = (label: string, d: { score: number | null; status: string }) =>
    `- ${label}: ${d.status === "insufficient_data" || d.score === null ? "N/A" : d.score + "/100"}`;
  return [
    `# InterviewIQ — Career Intelligence Report`,
    ``,
    r.overallSummary,
    ``,
    `## Scores`,
    dim("ATS Readiness", r.atsReadiness),
    dim("Resume Quality", r.resumeQuality),
    dim("Employability", r.employability),
    dim("Interview Probability", r.interviewProbability),
    `- Career Level: ${r.careerLevel.level || "N/A"}`,
    ``,
    `## Top market fit`,
    ...r.marketFit.slice(0, 3).map((m) => `- ${m.role} (${m.fitScore}/100, ${m.tier})`),
    ``,
    `## Top improvements`,
    ...r.roiImprovements.slice(0, 5).map((i) => `- [${i.priority}] ${i.change}`),
    ``,
    `## Credibility flags`,
    ...(r.credibilityIssues.length
      ? r.credibilityIssues.slice(0, 7).map((c) => `- ${c.issueType}: ${c.problem}`)
      : ["- None flagged"]),
  ];
}

export function buildReportText(result: AnalysisResult): string {
  if (!result.careerReport) return "InterviewIQ report";
  const lines = careerLines(result.careerReport);
  if (result.jobMatch) {
    lines.push(
      ``,
      `## Job match`,
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
