import { useEffect, useState } from "react";

const STAGES = [
  "Parsing resume…",
  "Running ATS simulation…",
  "Evaluating market fit…",
  "Building your report…",
];

export function LoadingStages() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i < STAGES.length - 1 ? i + 1 : i));
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p
      aria-live="polite"
      className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
      {STAGES[index]}
    </p>
  );
}
