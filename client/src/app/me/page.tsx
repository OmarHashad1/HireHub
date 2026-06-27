"use client";

import { useRef, useState } from "react";
import {
  Briefcase,
  Camera,
  FileText,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSession } from "@/lib/auth";
import { usePresignedUrl } from "@/lib/presigned";
import {
  useFullProfile,
  useUploadAvatar,
  useDeleteAvatar,
  useUploadCv,
  useDeleteCv,
  useDeleteExperience,
  useDeleteEducation,
} from "@/features/user/api";
import { EDUCATION_LABEL } from "@/schemas/enums";
import type { Experience, Education } from "@/lib/session";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";
import { SkillTag } from "@/components/SkillTag";
import { CardSkeleton } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EditProfileModal } from "@/features/user/EditProfileModal";
import { ExperienceModal } from "@/features/user/ExperienceModal";
import { EducationModal } from "@/features/user/EducationModal";

function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof Briefcase;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-hairline bg-surface-1 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <Icon className="size-4 text-ink-subtle" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function fmt(date: string) {
  try {
    return format(new Date(date), "MMM yyyy");
  } catch {
    return "";
  }
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: profile, isLoading } = useFullProfile(session?._id);
  const avatarInput = useRef<HTMLInputElement>(null);

  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const uploadCv = useUploadCv();
  const deleteCv = useDeleteCv();
  const deleteExperience = useDeleteExperience();
  const deleteEducation = useDeleteEducation();
  const cvInput = useRef<HTMLInputElement>(null);
  const { data: cvUrl } = usePresignedUrl(session?.cv);

  const [editOpen, setEditOpen] = useState(false);
  const [expModal, setExpModal] = useState<{ item?: Experience } | null>(null);
  const [eduModal, setEduModal] = useState<{ item?: Education } | null>(null);
  const [cvConfirm, setCvConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    { kind: "exp" | "edu"; id: string } | null
  >(null);

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-xl border border-hairline bg-surface-1" />
        <CardSkeleton count={2} />
      </div>
    );
  }

  const onPickAvatar = (file?: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Max avatar size is 2MB");
    uploadAvatar.mutate(file);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="grain relative overflow-hidden rounded-xl border border-hairline bg-surface-1 p-5 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 -z-0"
          style={{
            background:
              "radial-gradient(60% 100% at 30% 0%, rgba(86,69,212,0.16), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <Avatar
              avatarKey={profile.avatar}
              name={profile.firstName}
              size={84}
            />
            <button
              onClick={() => avatarInput.current?.click()}
              className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border border-hairline bg-surface-3 text-ink-subtle hover:text-ink"
              aria-label="Change avatar"
            >
              <Camera className="size-3.5" />
            </button>
            <input
              ref={avatarInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => onPickAvatar(e.target.files?.[0])}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-sm text-ink-subtle">
              {profile.headline || "Add a headline to stand out"}
            </p>
            {profile.bio && (
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {profile.bio}
              </p>
            )}
            {profile.skills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <SkillTag key={s} label={s} />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {profile.avatar && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => deleteAvatar.mutate()}
              >
                Remove photo
              </Button>
            )}
            <Button size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        </div>
      </section>

      <Section icon={FileText} title="CV / Résumé">
        {session?.cv ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2/40 p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md border border-hairline bg-surface-3 text-ink-subtle">
                <FileText className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">Your résumé</p>
                <p className="text-[12px] text-ink-subtle">PDF · used in applications</p>
              </div>
            </div>
            <div className="flex gap-2">
              {cvUrl && (
                <a href={cvUrl} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm">
                    Preview
                  </Button>
                </a>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => cvInput.current?.click()}
              >
                Replace
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCvConfirm(true)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-hairline-strong bg-surface-1 p-5">
            <p className="text-sm text-ink-subtle">
              No CV yet — upload a PDF to apply faster.
            </p>
            <Button size="sm" onClick={() => cvInput.current?.click()}>
              Upload CV
            </Button>
          </div>
        )}
        <input
          ref={cvInput}
          type="file"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadCv.mutate(file);
          }}
        />
      </Section>

      <Section
        icon={Briefcase}
        title="Experience"
        action={
          <Button variant="secondary" size="sm" onClick={() => setExpModal({})}>
            <Plus className="size-3.5" />
            Add
          </Button>
        }
      >
        {profile.experience?.length ? (
          <ul className="space-y-3">
            {profile.experience.map((exp) => (
              <li
                key={exp._id}
                className="flex items-start justify-between gap-3 rounded-lg border border-hairline bg-surface-2/30 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{exp.title}</p>
                  <p className="text-[13px] text-ink-subtle">{exp.company}</p>
                  <p className="mt-1 text-[12px] text-ink-tertiary">
                    {fmt(exp.startDate)} –{" "}
                    {exp.current ? "Present" : exp.endDate ? fmt(exp.endDate) : "—"}
                  </p>
                  {exp.description && (
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                      {exp.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setExpModal({ item: exp })}
                    className="grid size-8 place-items-center rounded-md text-ink-subtle hover:bg-surface-3 hover:text-ink"
                    aria-label="Edit experience"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() =>
                      setPendingDelete({ kind: "exp", id: exp._id })
                    }
                    className="grid size-8 place-items-center rounded-md text-ink-subtle hover:bg-surface-3 hover:text-error"
                    aria-label="Delete experience"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-subtle">No experience added yet.</p>
        )}
      </Section>

      <Section
        icon={GraduationCap}
        title="Education"
        action={
          <Button variant="secondary" size="sm" onClick={() => setEduModal({})}>
            <Plus className="size-3.5" />
            Add
          </Button>
        }
      >
        {profile.education?.length ? (
          <ul className="space-y-3">
            {profile.education.map((edu) => (
              <li
                key={edu._id}
                className="flex items-start justify-between gap-3 rounded-lg border border-hairline bg-surface-2/30 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {edu.field} ·{" "}
                    {EDUCATION_LABEL[edu.level as keyof typeof EDUCATION_LABEL] ??
                      edu.level}
                  </p>
                  <p className="text-[13px] text-ink-subtle">{edu.institution}</p>
                  <p className="mt-1 text-[12px] text-ink-tertiary">
                    {fmt(edu.from)} – {fmt(edu.to)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setEduModal({ item: edu })}
                    className="grid size-8 place-items-center rounded-md text-ink-subtle hover:bg-surface-3 hover:text-ink"
                    aria-label="Edit education"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() =>
                      setPendingDelete({ kind: "edu", id: edu._id })
                    }
                    className="grid size-8 place-items-center rounded-md text-ink-subtle hover:bg-surface-3 hover:text-error"
                    aria-label="Delete education"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-subtle">No education added yet.</p>
        )}
      </Section>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
      />
      <ExperienceModal
        open={expModal !== null}
        onClose={() => setExpModal(null)}
        experience={expModal?.item}
      />
      <EducationModal
        open={eduModal !== null}
        onClose={() => setEduModal(null)}
        education={eduModal?.item}
      />
      <ConfirmDialog
        open={cvConfirm}
        onClose={() => setCvConfirm(false)}
        onConfirm={() => {
          deleteCv.mutate();
          setCvConfirm(false);
        }}
        title="Remove your CV?"
        description="Applications that already used it keep their own copy."
        confirmLabel="Remove CV"
        destructive
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.kind === "exp")
            deleteExperience.mutate(pendingDelete.id);
          else if (pendingDelete?.kind === "edu")
            deleteEducation.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
        title={
          pendingDelete?.kind === "edu"
            ? "Remove this education entry?"
            : "Remove this experience entry?"
        }
        description="This permanently removes it from your profile."
        confirmLabel="Remove"
        destructive
      />
    </div>
  );
}
