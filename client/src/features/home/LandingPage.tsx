import { Link } from "react-router-dom";

import { ArrowRight, FileText, Flag, Upload } from "../../components/ui/icons";

const STEPS = [
  { Icon: Upload, title: "Upload your resume", body: "Drop in a PDF. No job description required." },
  { Icon: FileText, title: "We analyze the text", body: "ATS parsing, market fit, and credibility — all evidence-based." },
  { Icon: Flag, title: "Get an honest report", body: "Scores tied to real resume content, with specific fixes." },
];

export function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero — one headline, one subline, one CTA */}
      <section className="mx-auto max-w-3xl py-12 text-center md:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Know exactly why recruiters pass — before they do.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base font-normal text-slate-600 dark:text-slate-400">
          InterviewIQ reads your resume like a skeptical recruiter and an ATS, then tells you what
          to fix — every score backed by your actual resume text.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            to="/analyze"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 text-base font-semibold text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            Analyze my resume
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* How it works — visual, not a bullet list */}
      <section className="mx-auto max-w-3xl pb-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ Icon, title, body }, i) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {i + 1}. {title}
              </p>
              <p className="mt-2 text-sm font-normal text-slate-500 dark:text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
