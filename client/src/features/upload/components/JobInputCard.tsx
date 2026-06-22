import { useState, type FormEvent } from "react";

import { Button } from "../../../components/ui/button";
import { Card, CardBody, CardHeader } from "../../../components/ui/card";
import type { JobIngestPayload } from "../../../services/scraper.service";
import type { JobInputMode } from "../types";

interface JobInputCardProps {
  onSubmit: (payload: JobIngestPayload) => void;
  isSubmitting: boolean;
  isDone: boolean;
  jobTitle?: string;
}

const INPUT_CLS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-medium">2 · Target job</h2>
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`rounded px-2 py-1 ${mode === "url" ? "bg-indigo-100 text-indigo-700" : "text-slate-500"}`}
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`rounded px-2 py-1 ${mode === "paste" ? "bg-indigo-100 text-indigo-700" : "text-slate-500"}`}
            >
              Paste
            </button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={submit} className="space-y-3">
          {mode === "url" ? (
            <input
              className={INPUT_CLS}
              type="url"
              placeholder="https://company.com/jobs/123"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={INPUT_CLS}
                  placeholder="Company (optional)"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
                <input
                  className={INPUT_CLS}
                  placeholder="Role (optional)"
                  value={roleTitle}
                  onChange={(event) => setRoleTitle(event.target.value)}
                />
              </div>
              <textarea
                className={`${INPUT_CLS} h-28 resize-none`}
                placeholder="Paste the job description…"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </>
          )}
          <Button type="submit" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? "Analyzing…" : isDone ? "Re-submit job" : "Submit job"}
          </Button>
          {isDone && (
            <p className="text-xs text-green-600">Job parsed{jobTitle ? `: ${jobTitle}` : ""}.</p>
          )}
        </form>
      </CardBody>
    </Card>
  );
}
