"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TextField, TextArea } from "@/components/ui/Field";
import { SkillsInput } from "@/components/ui/SkillsInput";
import { Button } from "@/components/ui/Button";
import { useUpdateProfile } from "@/features/user/api";
import type { FullProfile } from "@/lib/session";

export function EditProfileModal({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile: FullProfile;
}) {
  const update = useUpdateProfile();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [skills, setSkills] = useState<string[]>(profile.skills ?? []);
  const [linkedin, setLinkedin] = useState(profile.socialMedia?.linkedin ?? "");
  const [github, setGithub] = useState(profile.socialMedia?.github ?? "");

  const submit = () => {
    const socialMedia: Record<string, string> = {};
    if (linkedin) socialMedia.linkedin = linkedin;
    if (github) socialMedia.github = github;

    update.mutate(
      {
        firstName,
        lastName,
        headline,
        bio,
        skills,
        ...(Object.keys(socialMedia).length ? { socialMedia } : {}),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit profile" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <TextField
          label="Headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Frontend Engineer"
        />
        <TextArea
          label="Bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short summary about you"
        />
        <SkillsInput value={skills} onChange={setSkills} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="LinkedIn"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/…"
          />
          <TextField
            label="GitHub"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/…"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
