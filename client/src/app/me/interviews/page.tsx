"use client";

import { useMemo } from "react";
import { CalendarClock, MapPin, Video } from "lucide-react";
import { format } from "date-fns";
import { useMyInterviews, type Interview } from "@/features/interviews/api";
import { countdown } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/States";

function when(date: string) {
  try {
    return format(new Date(date), "EEE, MMM d · h:mm a");
  } catch {
    return "";
  }
}

function InterviewCard({ interview }: { interview: Interview }) {
  const online = interview.type === "online";
  const upcoming =
    interview.status === "scheduled" &&
    new Date(interview.scheduledAt).getTime() > Date.now();
  const left = upcoming ? countdown(interview.scheduledAt) : null;

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-hairline bg-surface-3 text-ink-subtle">
          {online ? <Video className="size-4" /> : <MapPin className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-ink">
              {online ? "Online interview" : "In-person interview"}
            </h3>
            <StatusPill status={interview.status} />
            {left && (
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary-hover">
                {left}
              </span>
            )}
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted">
            <CalendarClock className="size-3.5 text-ink-subtle" />
            {when(interview.scheduledAt)}
          </p>
          {interview.cancellationReason && (
            <p className="mt-2 rounded-md border border-hairline bg-surface-2/40 px-3 py-2 text-[13px] text-ink-muted">
              Cancelled: {interview.cancellationReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InterviewsPage() {
  const { data, isLoading, isError, refetch } = useMyInterviews();

  const { upcoming, past } = useMemo(() => {
    const docs = data?.docs ?? [];
    const now = Date.now();
    const up: Interview[] = [];
    const pa: Interview[] = [];
    for (const i of docs) {
      if (i.status === "scheduled" && new Date(i.scheduledAt).getTime() > now)
        up.push(i);
      else pa.push(i);
    }
    up.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    pa.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
    return { upcoming: up, past: pa };
  }, [data]);

  const total = upcoming.length + past.length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Interviews"
        subtitle="Every interview scheduled with you, in one place."
      />

      {isLoading && <CardSkeleton count={3} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && total === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="No interviews yet"
          description="When a company schedules an interview with you, it'll show up here — you'll also get a notification."
        />
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-eyebrow text-ink-tertiary">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((i) => (
              <InterviewCard key={i._id} interview={i} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-eyebrow text-ink-tertiary">Past</h2>
          <div className="space-y-3">
            {past.map((i) => (
              <InterviewCard key={i._id} interview={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
