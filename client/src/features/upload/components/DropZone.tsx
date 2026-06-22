import { useRef, type ChangeEvent } from "react";

import { Card, CardBody, CardHeader } from "../../../components/ui/card";

interface DropZoneProps {
  onSelect: (file: File) => void;
  isUploading: boolean;
  isDone: boolean;
  fileName?: string;
}

export function DropZone({ onSelect, isUploading, isDone, fileName }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
  };

  const label = isUploading
    ? "Uploading…"
    : isDone
      ? `Parsed: ${fileName ?? "resume"}`
      : "Click to select a PDF resume";

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium">1 · Resume (PDF)</h2>
      </CardHeader>
      <CardBody>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500 transition-colors hover:border-indigo-400 hover:text-indigo-600"
        >
          {label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleChange}
        />
        {isDone && <p className="mt-2 text-xs text-green-600">Resume parsed successfully.</p>}
      </CardBody>
    </Card>
  );
}
