// Mirrors the backend domain models (docs/DATABASE.md section 4, API_CONTRACTS.md).
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

/** The completed-analysis payload carried in a task result and the analysis GET. */
export interface AnalysisResult {
  analysisId: string;
  readinessScore: number | null;
  skillGaps: SkillGap[];
  predictedQuestions: InterviewQuestion[];
  summary: string | null;
}

export interface TaskStatus {
  taskId: string;
  status: TaskState;
  result: AnalysisResult | null;
  error?: string | null;
}

export interface AnalysisResultResponse extends AnalysisResult {
  resumeId: string;
  jobId: string;
  createdAt: string;
}
