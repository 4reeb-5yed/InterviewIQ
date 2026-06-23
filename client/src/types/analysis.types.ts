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

// --- Career Intelligence Report (recruiter / ATS / hiring-manager audit) -----

export type Confidence = "high" | "medium" | "low";
export type DimensionStatus = "ok" | "insufficient_data";

export interface ScoredDimension {
  status: DimensionStatus;
  score: number | null;
  confidence: Confidence;
  reasoning: string;
  evidenceFound: string[];
  evidenceMissing: string[];
  reason?: string | null;
}

export interface CandidateContext {
  stage: "student" | "early_career" | "mid" | "senior" | "unknown";
  reasoning: string;
  evidence: string[];
}

export type AtsFieldStatus = "pass" | "fail" | "at_risk";

export interface AtsField {
  field: string;
  status: AtsFieldStatus;
  reason: string;
}

export interface AtsAnalysis {
  score: number | null;
  confidence: Confidence;
  reasoning: string;
  evidence: string[];
  fields: AtsField[];
  blockers: string[];
  warnings: string[];
  strengths: string[];
  recommendations: string[];
  interpretation: string;
}

export interface SectionReview {
  section: string;
  status: "present" | "missing";
  score: number | null;
  confidence: Confidence;
  strengths: string[];
  weaknesses: string[];
  missingElements: string[];
  evidence: string[];
  recommendations: string[];
}

export type ProjectCategory =
  | "Learning"
  | "Academic"
  | "Personal"
  | "Portfolio"
  | "Open Source"
  | "Freelance"
  | "Startup"
  | "Commercial"
  | "Enterprise"
  | "Unknown";

export interface ProjectAssessment {
  name: string;
  category: ProjectCategory;
  categoryConfidence: Confidence;
  engineeringImpact: string;
  engineeringSignals: string[];
  businessImpact: string | null;
  strengths: string[];
  weaknesses: string[];
  missingEvidence: string[];
  score: number | null;
  confidence: Confidence;
}

export interface TenSecondScan {
  firstImpression: string;
  mostNoticeableStrength: string;
  mostNoticeableWeakness: string;
  keepsReadingProbability: number;
  confidence: Confidence;
}

export interface ThirtySecondScan {
  whatRecruiterLearns: string[];
  concerns: string[];
  positiveSignals: string[];
}

export interface FullReview {
  overallAssessment: string;
  hireability: string;
  risks: string[];
  strongPoints: string[];
}

export type Verdict = "Strong Shortlist" | "Shortlist" | "Maybe" | "Weak Maybe" | "Reject";

export interface RecruiterSimulation {
  tenSecond: TenSecondScan;
  thirtySecond: ThirtySecondScan;
  fullReview: FullReview;
  verdict: Verdict;
  verdictReasoning: string;
  confidence: Confidence;
}

export interface RoleFit {
  role: string;
  tier: "realistic" | "stretch" | "unlikely";
  fitScore: number;
  confidence: Confidence;
  whyFits: string[];
  whyNot: string[];
}

export interface MarketPositioning {
  currentLevel: string;
  reasoning: string;
  roles: RoleFit[];
}

export interface Gap {
  gap: string;
  whyEmployersCare: string;
  howEvaluated: string;
  howToAcquire: string;
  expectedImpact: string;
}

export interface GapAnalysis {
  currentLevel: string;
  targetLevel: string;
  gaps: Gap[];
}

export interface CredibilityIssue {
  issueType: string;
  flaggedText: string;
  whyFlagged: string;
  evidenceIssue: string;
  suggestedImprovement: string;
}

export interface CareerProjection {
  employability: ScoredDimension;
  internshipProbability: ScoredDimension;
  entryLevelProbability: ScoredDimension;
  interviewProbability: ScoredDimension;
  startupSuitability: ScoredDimension;
  enterpriseSuitability: ScoredDimension;
}

export interface ROIImprovement {
  priority: "high" | "medium" | "low";
  change: string;
  whyItMatters: string;
  expectedBenefit: string;
  before: string;
  after: string;
  estimatedImpact: string;
}

export interface Strength {
  strength: string;
  evidence: string;
  confidence: Confidence;
}

export interface CareerReport {
  candidateContext: CandidateContext;
  ats: AtsAnalysis;
  sectionReviews: SectionReview[];
  projectAssessments: ProjectAssessment[];
  recruiterSimulation: RecruiterSimulation;
  marketPositioning: MarketPositioning;
  gapAnalysis: GapAnalysis;
  credibilityIssues: CredibilityIssue[];
  careerProjection: CareerProjection;
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
