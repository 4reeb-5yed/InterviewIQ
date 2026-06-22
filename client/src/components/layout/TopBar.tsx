import { Link } from "react-router-dom";

export function TopBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Interview<span className="text-indigo-600">IQ</span>
          </span>
        </Link>
        <span className="text-xs text-slate-400">AI Interview Reverse Engineer</span>
      </div>
    </header>
  );
}
