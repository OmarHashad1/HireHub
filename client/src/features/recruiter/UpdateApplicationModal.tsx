"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { SelectField, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useUpdateApplication } from "@/features/recruiter/api";
import type { JobApplicant } from "@/lib/types";

type Decision = "keep" | "offer" | "rejected";

// Mounted only while reviewing an applicant, so state initializes from props.
export function UpdateApplicationModal({
  onClose,
  application,
  jobId,
}: {
  onClose: () => void;
  application: JobApplicant;
  jobId: string;
}) {
  const update = useUpdateApplication(jobId);
  const [decision, setDecision] = useState<Decision>("keep");
  const [rejectionReason, setRejectionReason] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState(
    application.recruiterNotes ?? "",
  );

  const submit = () => {
    const payload: {
      status?: "offer" | "rejected";
      rejectionReason?: string;
      recruiterNotes?: string;
    } = {};

    if (decision === "offer") payload.status = "offer";
    if (decision === "rejected") {
      if (rejectionReason.trim().length < 3) {
        toast.error("Add a short reason for rejecting (3+ characters)");
        return;
      }
      payload.status = "rejected";
      payload.rejectionReason = rejectionReason.trim();
    }

    const notes = recruiterNotes.trim();
    if (notes && notes !== (application.recruiterNotes ?? "")) {
      payload.recruiterNotes = notes;
    }

    if (Object.keys(payload).length === 0) {
      toast.error("Nothing to update");
      return;
    }

    update.mutate(
      { id: application._id, payload },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Review application"
      description="Make an offer, reject, or leave private notes."
    >
      <div className="space-y-4">
        <SelectField
          label="Decision"
          value={decision}
          onChange={(e) => setDecision(e.target.value as Decision)}
        >
          <option value="keep">No change</option>
          <option value="offer">Make an offer</option>
          <option value="rejected">Reject</option>
        </SelectField>

        {decision === "rejected" && (
          <TextArea
            label="Rejection reason"
            rows={3}
            placeholder="Shared context for why this didn't move forward."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        )}

        <TextArea
          label="Private notes"
          rows={3}
          placeholder="Only your team can see these."
          value={recruiterNotes}
          onChange={(e) => setRecruiterNotes(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
