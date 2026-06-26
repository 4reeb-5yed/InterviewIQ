import { Link, useLocation } from "react-router-dom";

import { cn } from "../../lib/cn";
import { FileText, Home, Info } from "../ui/icons";

const TABS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/analyze", label: "Analyze", Icon: FileText },
  { to: "/about", label: "About", Icon: Info },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950">
      <ul className="mx-auto flex max-w-5xl">
        {TABS.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500",
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
