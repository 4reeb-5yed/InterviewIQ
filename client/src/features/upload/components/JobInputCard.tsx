import { useState, type FormEvent } from "react";

import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/cn";
import type { JobIngestPayload } from "../../../services/scraper.service";
import type { JobInputMode } from "../types";

interface JobInputCardProps {
  onSubmit: (payload: JobIngestPayload) => void;
  isSubmitting: boolean;
  isDone: boolean;
  jobTitle?: string;
}

const INPUT_CLS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

export function JobInputCard({ onSubmit, isSubmitting, isDone, jobTitle }: JobInputCardProps) {
  const [mode, setMode] = useState<JobInputMode>("url");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "url") {
      onSubmit({ url: url.trim() });
    } else {
      onSubmit({
        description: description.trim(),
        companyName: companyName.trim() || undefined,
        roleTitle: roleTitle.trim() || undefined,
      });
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Target job <span className="font-normal text-slate-400">· optional</span>
          </h2>
          <p className="mt-1 text-sm font-normal text-slate-500 dark:text-slate-400">
            Add one to also get a job-match analysis.
          </p>
        </div>
        <div className="flex gap-1 text-xs">
          {(["url", "paste"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md px-2 py-1 font-semibold capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                mode === m
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3">
        {mode === "url" ? (
          <input
            className={INPUT_CLS}
            type="url"
            placeholder="https://company.com/jobs/123"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <input
                className={INPUT_CLS}
                placeholder="Company (optional)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <input
                className={INPUT_CLS}
                placeholder="Role (optional)"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>
            <textarea
              className={cn(INPUT_CLS, "h-28 resize-none")}
              placeholder="Paste the job description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </>
        )}
        <Button type="submit" variant="secondary" disabled={isSubmitting}>
          {isSubmitting ? "Analyzing…" : isDone ? "Re-submit job" : "Add job"}
        </Button>
        {isDone && (
          <p className="text-sm font-normal text-green-700 dark:text-green-400">
            Job added{jobTitle ? `: ${jobTitle}` : ""}.
          </p>
        )}
      </form>
    </div>
  );
}
