interface Step {
  label: string;
  complete: boolean;
}

export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex items-center gap-3 text-sm">
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              step.complete ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            {index + 1}
          </span>
          <span className={step.complete ? "text-slate-900" : "text-slate-500"}>{step.label}</span>
          {index < steps.length - 1 && <span className="mx-1 h-px w-8 bg-slate-200" />}
        </li>
      ))}
    </ol>
  );
}
