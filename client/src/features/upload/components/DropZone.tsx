import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { cn } from "../../../lib/cn";
import { Check, Upload } from "../../../components/ui/icons";

const MAX_MB = 5;

interface DropZoneProps {
  onSelect: (file: File) => void;
  isUploading: boolean;
  isDone: boolean;
  fileName?: string;
  parsedName?: string;
}

function validate(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "That file isn’t a PDF. Export your resume as PDF and try again.";
  if (file.size > MAX_MB * 1024 * 1024) {
    return `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please upload a PDF under ${MAX_MB} MB.`;
  }
  if (file.size === 0) return "That file is empty. Please choose a valid PDF.";
  return null;
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DropZone({ onSelect, isUploading, isDone, fileName, parsedName }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(null);

  const handleFile = (file: File) => {
    const problem = validate(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setPicked({ name: file.name, size: file.size });
    onSelect(file);
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a PDF resume"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          dragOver
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
            : "border-slate-300 hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-500",
        )}
      >
        {isDone ? (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
              <Check className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {picked?.name ?? fileName ?? "Resume"} {picked && `· ${formatSize(picked.size)}`}
            </p>
            <p className="mt-1 text-sm font-normal text-green-700 dark:text-green-400">
              Parsed{parsedName ? `: ${parsedName}` : " successfully"} — click to replace
            </p>
          </>
        ) : (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Upload className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {isUploading ? "Uploading…" : "Drag & drop your PDF resume"}
            </p>
            <p className="mt-1 text-sm font-normal text-slate-500 dark:text-slate-400">
              or click to browse · PDF up to {MAX_MB} MB
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={onInput}
      />

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
