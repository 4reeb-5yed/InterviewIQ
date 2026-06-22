// Mirrors the backend domain models (docs/DATABASE.md, API_CONTRACTS.md).
// All fields are camelCase to match the backend's aliased JSON output.

export interface Skills {
  technical: string[];
  soft: string[];
}

export interface ExperienceItem {
  title: string;
  company: string;
  years: number | null;
}

export interface EducationItem {
  degree: string;
  institution: string;
}

export interface ProjectItem {
  name: string;
  description: string | null;
}

export interface ResumeData {
  name: string;
  skills: Skills;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

export type SeniorityLevel = "junior" | "mid" | "senior";

export interface JobData {
  title: string;
  company: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniorityLevel: SeniorityLevel;
  domain: string;
}

export type GapStatus = "matched" | "partial" | "missing";
export type Importance = "critical" | "moderate" | "low";

export interface SkillGap {
  skill: string;
  status: GapStatus;
  importance: Importance;
  confidenceScore: number;
}

export type QuestionType = "technical" | "behavioral" | "system-design" | "trap";
export type Difficulty = "easy" | "medium" | "hard";

export interface InterviewQuestion {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  topic: string;
  likelihoodScore: number;
}

// --- Career Intelligence Report (resume-only, evidence-driven) ---------------

export type DimensionStatus = "ok" | "insufficient_data";

export interface ScoredDimension {
  status: DimensionStatus;
  score: number | null;
  reasoning: string;
  evidenceFound: string[];
  evidenceMissing: string[];
  reason?: string | null;
}

export interface CareerLevelAssessment extends ScoredDimension {
  level: string;
}

export type AtsFieldStatus = "pass" | "fail" | "at_risk";

export interface AtsField {
  field: string;
  status: AtsFieldStatus;
  reason: string;
}

export interface AtsSimulation {
  fields: AtsField[];
  parsingRisks: string[];
}

export interface RoleFit {
  role: string;
  fitScore: number;
  tier: "realistic" | "stretch";
  reasoning: string;
  fitDrivers: string[];
  fitBlockers: string[];
}

export interface Gap {
  gap: string;
  whyItMatters: string;
  howToAcquire: string;
}

export interface GapAnalysis {
  currentLevel: string;
  targetLevel: string;
  gaps: Gap[];
}

export type CredibilityIssueType =
  | "Skills Without Evidence"
  | "Unproven Claim"
  | "Weak Project"
  | "Buzzword"
  | "Missing Metric";

export interface CredibilityIssue {
  issueType: CredibilityIssueType;
  flaggedText: string;
  problem: string;
  fix: string;
}

export interface ROIImprovement {
  priority: "high" | "medium" | "low";
  change: string;
  reason: string;
  expectedImpact: string;
  before: string;
  after: string;
}

export interface Strength {
  strength: string;
  evidence: string;
}

export interface CareerReport {
  atsReadiness: ScoredDimension;
  resumeQuality: ScoredDimension;
  employability: ScoredDimension;
  interviewProbability: ScoredDimension;
  careerLevel: CareerLevelAssessment;
  atsSimulation: AtsSimulation;
  marketFit: RoleFit[];
  gapAnalysis: GapAnalysis;
  credibilityIssues: CredibilityIssue[];
  roiImprovements: ROIImprovement[];
  strengths: Strength[];
  overallSummary: string;
}

export interface JobMatch {
  readinessScore: number | null;
  summary: string | null;
  skillGaps: SkillGap[];
  predictedQuestions: InterviewQuestion[];
}

// --- Endpoint payloads -------------------------------------------------------

export interface ResumeUploadResponse {
  resumeId: string;
  parsedData: ResumeData;
}

export interface JobIngestResponse {
  jobId: string;
  jobData: JobData;
}

export interface RunAnalysisResponse {
  taskId: string;
}

export type TaskState = "pending" | "running" | "completed" | "failed";
export type AnalysisMode = "resume_only" | "job_match";

/** Completed-analysis payload carried in a task result and the analysis GET. */
export interface AnalysisResult {
  analysisId: string;
  mode: AnalysisMode;
  careerReport: CareerReport | null;
  jobMatch: JobMatch | null;
}

export interface TaskStatus {
  taskId: string;
  status: TaskState;
  result: AnalysisResult | null;
  error?: string | null;
}

export interface AnalysisResultResponse extends AnalysisResult {
  resumeId: string;
  jobId: string | null;
  createdAt: string;
}
