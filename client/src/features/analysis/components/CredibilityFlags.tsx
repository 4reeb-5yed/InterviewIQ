import { useState } from "react";

import { StatusPill } from "../../../components/shared/StatusPill";
import type { CredibilityIssue } from "../../../types/analysis.types";

const VISIBLE = 6;

export function CredibilityFlags({ issues }: { issues: CredibilityIssue[] }) {
  const [expanded, setExpanded] = useState(false);

  if (issues.length === 0) {
    return (
      <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
        No credibility issues flagged — claims are backed by evidence.
      </p>
    );
  }

  const shown = expanded ? issues : issues.slice(0, VISIBLE);

  return (
    <div className="space-y-3">
      {shown.map((issue, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <StatusPill label={issue.issueType} tone="amber" />
          <blockquote className="mt-2 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-sm italic text-slate-700 dark:bg-amber-950/30 dark:text-slate-200">
            “{issue.flaggedText}”
          </blockquote>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-red-700 dark:text-red-400">Why flagged: </span>
            {issue.whyFlagged}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Evidence issue: </span>
            {issue.evidenceIssue}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-green-700 dark:text-green-400">Fix: </span>
            {issue.suggestedImprovement}
          </p>
        </div>
      ))}

      {issues.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="rounded-lg text-sm font-semibold text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
        >
          {expanded ? "Show fewer" : `Show ${issues.length - VISIBLE} more`}
        </button>
      )}
    </div>
  );
}
