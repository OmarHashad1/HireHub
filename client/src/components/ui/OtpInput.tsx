"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  error,
}: {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (index: number, digit: string) => {
    const next = value.split("");
    next[index] = digit;
    onChange(next.join("").slice(0, length));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ""}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            if (digit || e.target.value === "") setDigit(i, digit);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, length);
            if (text) {
              onChange(text);
              refs.current[Math.min(text.length, length - 1)]?.focus();
            }
          }}
          className={cn(
            "h-13 w-full rounded-md border bg-surface-1 text-center font-mono text-lg text-ink outline-none transition-colors focus:border-primary",
            error ? "border-error/60" : "border-hairline",
          )}
        />
      ))}
    </div>
  );
}
