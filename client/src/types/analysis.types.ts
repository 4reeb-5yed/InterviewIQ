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

// --- Career Intelligence Report (resume-only, always present) ----------------

export interface EvidenceScore {
  score: number;
  rating: string;
  reasoning: string;
  evidence: string[];
}

export interface ATSIssue {
  issue: string;
  severity: "high" | "medium" | "low";
  reasoning: string;
  fix: string;
}

export interface ATSReadiness {
  score: number;
  rating: string;
  reasoning: string;
  evidence: string[];
  issues: ATSIssue[];
}

export interface StrengthsWeaknesses {
  strengths: string[];
  weaknesses: string[];
  reasoning: string;
}

export interface CareerLevel {
  level: string;
  reasoning: string;
  evidence: string[];
}

export interface RoleFit {
  role: string;
  fitScore: number;
  reasoning: string;
}

export interface GapItem {
  area: string;
  action: string;
  reasoning: string;
}

export interface GapToNextLevel {
  targetLevel: string;
  reasoning: string;
  gaps: GapItem[];
}

export interface ROIImprovement {
  change: string;
  impact: "high" | "medium" | "low";
  reasoning: string;
  exampleBefore?: string | null;
  exampleAfter?: string | null;
}

export interface RoadmapStep {
  timeframe: string;
  focus: string;
  actions: string[];
}

export interface MissingSection {
  section: string;
  importance: "critical" | "recommended" | "optional";
  reasoning: string;
}

export interface HiddenStrength {
  strength: string;
  evidence: string;
  howToLeverage: string;
}

export interface CareerReport {
  atsReadiness: ATSReadiness;
  resumeQuality: EvidenceScore;
  strengthsWeaknesses: StrengthsWeaknesses;
  careerLevel: CareerLevel;
  roleMatches: RoleFit[];
  employability: EvidenceScore;
  interviewProbability: EvidenceScore;
  gapToNextLevel: GapToNextLevel;
  roiImprovements: ROIImprovement[];
  careerRoadmap: RoadmapStep[];
  missingSections: MissingSection[];
  hiddenStrengths: HiddenStrength[];
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
