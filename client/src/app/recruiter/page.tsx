"use client";

import Link from "next/link";
import {
  Briefcase,
  Users,
  CalendarClock,
  Send,
  ArrowRight,
} from "lucide-react";
import {
  useMyCompany,
  useMyJobs,
  useCompanyInterviews,
} from "@/features/recruiter/api";
import { CompanyLogo } from "@/components/CompanyLogo";
import { ErrorState, CardSkeleton } from "@/components/ui/States";
import { ButtonLink } from "@/components/ui/Button";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-4 sm:p-5">
      <span className="grid size-9 place-items-center rounded-md border border-hairline bg-surface-2 text-ink-subtle">
        <Icon className="size-4" />
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      <p className="text-[13px] text-ink-subtle">{label}</p>
    </div>
  );
}

export default function RecruiterOverviewPage() {
  const company = useMyCompany();
  // Larger page so the overview's derived counts aren't capped at the list
  // page size. (No company-stats endpoint exists yet to aggregate server-side.)
  const jobsQuery = useMyJobs(company.data?._id, 1, 200);
  const interviewsQuery = useCompanyInterviews(company.data?._id, 1, 200);

  if (company.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="h-24 animate-pulse rounded-xl border border-hairline bg-surface-1" />
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (company.isError || !company.data) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState onRetry={() => company.refetch()} />
      </div>
    );
  }

  const data = company.data;
  const jobs = jobsQuery.data?.docs ?? [];
  const interviews = interviewsQuery.data?.docs ?? [];

  const publishedCount = jobs.filter((j) => j.status === "published").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantsCount, 0);
  const upcomingInterviews = interviews.filter(
    (i) => i.status === "scheduled" && new Date(i.scheduledAt) > new Date(),
  ).length;

  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <CompanyLogo
            logoKey={data.logo}
            name={data.name}
            seed={data._id}
            size={56}
          />
          <div>
            <p className="text-[13px] text-ink-subtle">Welcome back</p>
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              {data.name}
            </h1>
          </div>
        </div>
        <ButtonLink href="/recruiter/jobs">
          <Send className="size-4" />
          Manage jobs
        </ButtonLink>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Briefcase} label="Total jobs" value={jobs.length} />
        <StatCard icon={Send} label="Published" value={publishedCount} />
        <StatCard icon={Users} label="Applicants" value={totalApplicants} />
        <StatCard
          icon={CalendarClock}
          label="Upcoming interviews"
          value={upcomingInterviews}
        />
      </div>

      <section className="rounded-xl border border-hairline bg-surface-1 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink">Recent jobs</h2>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center gap-1 text-[13px] text-ink-subtle transition-colors hover:text-ink"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {jobsQuery.isLoading ? (
          <CardSkeleton count={2} />
        ) : recentJobs.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-subtle">
            No jobs yet.{" "}
            <Link href="/recruiter/jobs" className="text-primary-hover hover:underline">
              Post your first role
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {recentJobs.map((job) => (
              <li key={job._id}>
                <Link
                  href={`/recruiter/jobs/${job._id}`}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-ink"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {job.title}
                    </span>
                    <span className="text-[12px] text-ink-subtle capitalize">
                      {job.status}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[13px] text-ink-muted">
                    <Users className="size-3.5" />
                    {job.applicantsCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
