import { Card, CardBody } from "../../../components/ui/card";
import { Circle, ExternalLink, Github, Linkedin, Mail } from "../../../components/ui/icons";

const VERSION_INFO = [
  { label: "Version", value: "v1.0.0" },
  { label: "Status", value: "Active Development" },
  { label: "Deployment", value: "Production" },
  { label: "License", value: "MIT" },
];

const FEATURES = [
  "Resume Upload",
  "Career Intelligence",
  "ATS Analysis",
  "Recruiter Evaluation",
  "Job Matching",
  "Skill Gap Analysis",
  "Interview Questions",
  "AI-Powered Reports",
];

const ROADMAP = [
  "Advanced prompt engineering",
  "Better reasoning quality",
  "Personalized interview preparation",
  "Resume version comparison",
  "Company-specific insights",
  "Mock interview workflow",
  "Improved report visualizations",
  "Continuous UI/UX improvements",
];

const CONNECT = [
  { Icon: Github, label: "GitHub", value: "@4reeb-5yed", href: "https://github.com/4reeb-5yed", external: true },
  {
    Icon: Linkedin,
    label: "LinkedIn",
    value: "areeb-syed",
    href: "https://www.linkedin.com/in/areeb-syed-b19491245/",
    external: true,
  },
  { Icon: Mail, label: "Primary email", value: "areeb.syed1@outlook.com", href: "mailto:areeb.syed1@outlook.com", external: false },
  { Icon: Mail, label: "Secondary email", value: "4reeb.5yed@gmail.com", href: "mailto:4reeb.5yed@gmail.com", external: false },
];

const SectionTitle = ({ children }: { children: string }) => (
  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</p>
);

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}

export function AboutSection() {
  return (
    <section className="animate-fade-in py-12" aria-labelledby="about-heading">
      <h2 id="about-heading" className="sr-only">
        About InterviewIQ
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 1 — About InterviewIQ */}
        <Card>
          <CardBody className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                About InterviewIQ
              </h3>
              <div className="mt-3 space-y-3 text-sm font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  InterviewIQ is an AI-powered career intelligence platform designed to help
                  candidates better understand their résumés through structured, evidence-based
                  analysis.
                </p>
                <p>
                  The current version combines résumé parsing, recruiter-style evaluation, ATS
                  insights, optional job matching, skill gap analysis, and interview question
                  generation into a unified workflow.
                </p>
                <p>
                  The primary goal of this project is to explore how modern AI can assist candidates
                  by providing transparent reasoning and actionable insights rather than simple
                  keyword matching.
                </p>
                <p>
                  InterviewIQ is actively being improved, with ongoing work focused on better AI
                  reasoning, richer analyses, and a more polished user experience.
                </p>
              </div>
            </div>

            <div>
              <SectionTitle>Current version</SectionTitle>
              <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {VERSION_INFO.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <dt className="text-xs text-slate-400">{item.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <SectionTitle>Current features</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {FEATURES.map((f) => (
                  <Chip key={f}>{f}</Chip>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle>Future roadmap</SectionTitle>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {ROADMAP.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm font-normal text-slate-600 dark:text-slate-300"
                  >
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionTitle>Open source</SectionTitle>
              <a
                href="https://github.com/4reeb-5yed/InterviewIQ"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              >
                <Github className="h-4 w-4" />
                Repository
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            </div>
          </CardBody>
        </Card>

        {/* Card 2 — Developer */}
        <Card>
          <CardBody className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Developer</h3>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Areeb Syed
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Applied AI • Cybersecurity • Full-Stack Development
              </p>
              <p className="mt-3 text-sm font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                I&apos;m passionate about building practical AI applications that combine modern
                language models, backend engineering, and intuitive user experiences. InterviewIQ is
                one of my ongoing projects where I explore how AI can assist candidates with résumé
                analysis, career guidance, and interview preparation.
              </p>
            </div>

            <div>
              <SectionTitle>Connect</SectionTitle>
              <ul className="mt-2 space-y-2">
                {CONNECT.map(({ Icon, label, value, href, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      aria-label={`${label}: ${value}`}
                      className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:hover:border-indigo-500"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {label}
                        </span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {value}
                        </span>
                      </span>
                      {external && (
                        <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500 dark:text-slate-600" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
