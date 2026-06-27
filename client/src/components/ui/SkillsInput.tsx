"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SkillTag } from "@/components/SkillTag";

export function SkillsInput({
  value,
  onChange,
  label = "Skills",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft("");
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-ink-muted">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-hairline bg-surface-1 p-2.5">
        {value.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1">
            <SkillTag label={skill} />
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              onClick={() => onChange(value.filter((s) => s !== skill))}
              className="text-ink-subtle hover:text-ink"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={value.length ? "" : "Type a skill, press Enter"}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle"
        />
      </div>
    </div>
  );
}
