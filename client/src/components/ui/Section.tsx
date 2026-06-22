import { useState, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { ChevronDown } from "./icons";

interface SectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Collapsible report section. Children stay mounted (hidden via CSS when
 * collapsed) so the content is always present for print/PDF export.
 */
export function Section({ title, subtitle, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 rounded-xl p-6 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800/50"
      >
        <span>
          <span className="block text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </span>
          {subtitle && (
            <span className="mt-1 block text-sm font-normal text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <div className={cn("px-6 pb-6", !open && "hidden print:block")}>{children}</div>
    </section>
  );
}
