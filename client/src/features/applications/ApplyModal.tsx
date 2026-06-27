"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { apiMessage } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { useApply } from "@/features/applications/api";
import { DOC_MIME } from "@/schemas/_shared";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { cn } from "@/lib/utils";

export function ApplyModal({
  jobId,
  jobTitle,
  open,
  onClose,
  onApplied,
}: {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
}) {
  const { data: user } = useSession();
  const apply = useApply(jobId);
  const hasProfileCv = !!user?.cv;

  const [coverLetter, setCoverLetter] = useState("");
  const [source, setSource] = useState<"profile" | "upload">(
    hasProfileCv ? "profile" : "upload",
  );
  const [file, setFile] = useState<File | null>(null);

  const submit = () => {
    if (source === "upload" && !file) {
      toast.error("Add a CV to apply");
      return;
    }
    apply.mutate(
      {
        coverLetter: coverLetter.trim() || undefined,
        cv: source === "upload" ? file ?? undefined : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Application sent");
          onApplied();
          onClose();
        },
        onError: (error) => {
          const status =
            error instanceof AxiosError ? error.response?.status : undefined;
          if (status === 409) {
            toast.info("You already applied to this role");
            onApplied();
            onClose();
            return;
          }
          toast.error(apiMessage(error, "Couldn't submit your application"));
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply"
      description={jobTitle}
      size="lg"
    >
      <div className="space-y-5">
        <TextArea
          label="Cover letter"
          hint="Optional — up to 1000 characters"
          rows={5}
          maxLength={1000}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Tell them why you're a great fit…"
        />

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-muted">Résumé</p>
          <div className="space-y-2">
            {hasProfileCv && (
              <button
                type="button"
                onClick={() => setSource("profile")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  source === "profile"
                    ? "border-primary/70 bg-surface-2"
                    : "border-hairline hover:border-hairline-strong",
                )}
              >
                <span className="grid size-9 place-items-center rounded-md border border-hairline bg-surface-3 text-ink-subtle">
                  <FileText className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-ink">
                    Use my profile CV
                  </span>
                  <span className="block text-[12px] text-ink-subtle">
                    The résumé saved to your profile
                  </span>
                </span>
                <span
                  className={cn(
                    "size-4 rounded-full border",
                    source === "profile"
                      ? "border-primary bg-primary"
                      : "border-hairline-strong",
                  )}
                />
              </button>
            )}

            <button
              type="button"
              onClick={() => setSource("upload")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                source === "upload"
                  ? "border-primary/70 bg-surface-2"
                  : "border-hairline hover:border-hairline-strong",
              )}
            >
              <span className="grid size-9 place-items-center rounded-md border border-hairline bg-surface-3 text-ink-subtle">
                <FileText className="size-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink">
                  Upload a new CV
                </span>
                <span className="block text-[12px] text-ink-subtle">
                  PDF or DOC, up to 2MB
                </span>
              </span>
              <span
                className={cn(
                  "size-4 rounded-full border",
                  source === "upload"
                    ? "border-primary bg-primary"
                    : "border-hairline-strong",
                )}
              />
            </button>

            {source === "upload" && (
              <div className="pt-1">
                {file ? (
                  <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface-2/40 p-3">
                    <span className="truncate text-sm text-ink-muted">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-[13px] text-ink-subtle hover:text-ink"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <FileDropzone
                    accept=".pdf,.doc,.docx"
                    maxMB={2}
                    mimes={DOC_MIME}
                    onFile={setFile}
                    label="Drop your CV or click to browse"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={apply.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={apply.isPending}>
            {apply.isPending ? "Sending…" : "Submit application"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
