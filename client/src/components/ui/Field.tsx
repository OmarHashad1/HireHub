"use client";

import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const inputBase =
  "h-11 w-full rounded-md border border-hairline bg-surface-1 px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-primary disabled:opacity-50";

function Wrapper({
  label,
  error,
  hint,
  htmlFor,
  children,
}: {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[13px] font-medium text-ink-muted"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[12px] text-error">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generated = useId();
    const fieldId = id ?? generated;
    return (
      <Wrapper label={label} error={error} hint={hint} htmlFor={fieldId}>
        <input
          ref={ref}
          id={fieldId}
          className={cn(inputBase, error && "border-error/60", className)}
          {...props}
        />
      </Wrapper>
    );
  },
);
TextField.displayName = "TextField";

export const PasswordField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generated = useId();
    const fieldId = id ?? generated;
    const [show, setShow] = useState(false);
    return (
      <Wrapper label={label} error={error} hint={hint} htmlFor={fieldId}>
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={show ? "text" : "password"}
            className={cn(inputBase, "pr-11", error && "border-error/60", className)}
            {...props}
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((v) => !v)}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-ink-subtle hover:text-ink"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Wrapper>
    );
  },
);
PasswordField.displayName = "PasswordField";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generated = useId();
    const fieldId = id ?? generated;
    return (
      <Wrapper label={label} error={error} hint={hint} htmlFor={fieldId}>
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            "w-full rounded-md border border-hairline bg-surface-1 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-primary",
            error && "border-error/60",
            className,
          )}
          {...props}
        />
      </Wrapper>
    );
  },
);
TextArea.displayName = "TextArea";

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, hint, className, id, children, ...props }, ref) => {
    const generated = useId();
    const fieldId = id ?? generated;
    return (
      <Wrapper label={label} error={error} hint={hint} htmlFor={fieldId}>
        <select
          ref={ref}
          id={fieldId}
          className={cn(inputBase, "appearance-none", error && "border-error/60", className)}
          {...props}
        >
          {children}
        </select>
      </Wrapper>
    );
  },
);
SelectField.displayName = "SelectField";
