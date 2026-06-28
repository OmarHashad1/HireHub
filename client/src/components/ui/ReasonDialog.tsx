"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

// A confirm dialog that collects a reason/note. Mounted on demand so the
// textarea state initializes fresh each time.
export function ReasonDialog({
  title,
  description,
  label,
  placeholder,
  required = false,
  confirmLabel = "Confirm",
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  const submit = () => {
    const trimmed = reason.trim();
    if (required && trimmed.length === 0) {
      toast.error(`${label} is required`);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Modal open onClose={onClose} title={title} description={description}>
      <div className="space-y-4">
        <TextArea
          label={label}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={loading}
            className={destructive ? "bg-error hover:bg-error/90" : ""}
          >
            {loading ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
