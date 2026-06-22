interface ReadinessGaugeProps {
  score: number | null;
}

export function ReadinessGauge({ score }: ReadinessGaugeProps) {
  const value = Math.max(0, Math.min(100, score ?? 0));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  const color = value >= 70 ? "#16a34a" : value >= 40 ? "#d97706" : "#dc2626";

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-semibold">{score ?? "—"}</div>
        <div className="text-xs text-slate-500">readiness</div>
      </div>
    </div>
  );
}
