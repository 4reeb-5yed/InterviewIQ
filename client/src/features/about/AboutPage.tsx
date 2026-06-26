import { AboutSection } from "./components/AboutSection";

export function AboutPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          About
        </h1>
        <p className="mt-2 text-sm font-normal text-slate-500 dark:text-slate-400">
          InterviewIQ and the developer behind it.
        </p>
      </div>
      <AboutSection />
    </div>
  );
}
