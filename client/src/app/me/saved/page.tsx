"use client";

import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useSavedJobs, useUnsave } from "@/features/saved/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { JobCard } from "@/components/JobCard";
import { ButtonLink } from "@/components/ui/Button";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/States";

export default function SavedJobsPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useSavedJobs();
  const unsave = useUnsave();
  const saved = (data?.docs ?? []).filter((s) => s.job);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Saved jobs" subtitle="Roles you've bookmarked to revisit." />

      {isLoading && <CardSkeleton count={4} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && saved.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the bookmark on any role to keep it here for later."
          action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {saved.map((s) => (
          <JobCard
            key={s._id}
            job={s.job}
            saved
            onToggleSave={() => unsave.mutate(s.job._id)}
            onSelect={() => router.push(`/jobs?selected=${s.job._id}`)}
          />
        ))}
      </div>
    </div>
  );
}
