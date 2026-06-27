"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FileDropzone({
  accept,
  maxMB,
  mimes,
  onFile,
  label = "Drop a file or click to browse",
  busy,
}: {
  accept: string;
  maxMB: number;
  mimes: readonly string[];
  onFile: (file: File) => void;
  label?: string;
  busy?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handle = (file?: File | null) => {
    if (!file) return;
    if (!mimes.includes(file.type)) {
      toast.error("Unsupported file type");
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`Max file size is ${maxMB}MB`);
      return;
    }
    onFile(file);
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
        over
          ? "border-primary bg-primary/5"
          : "border-hairline-strong bg-surface-1 hover:border-hairline-tertiary",
        busy && "opacity-60",
      )}
    >
      <UploadCloud className="size-6 text-ink-subtle" />
      <span className="text-sm text-ink-muted">{busy ? "Uploading…" : label}</span>
      <span className="text-[12px] text-ink-tertiary">Up to {maxMB}MB</span>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </button>
  );
}
