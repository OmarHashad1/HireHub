"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  ExternalLink,
  Flag,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import {
  usePublicCompany,
  useCompanyJobs,
  type PublicCompany,
} from "@/features/company/api";
import { useSession } from "@/lib/auth";
import { ReportCompanyModal } from "@/features/reports/ReportCompanyModal";
import { JobCard } from "@/components/JobCard";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { titleCase } from "@/lib/utils";
import type { Job } from "@/lib/types";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1 text-[13px] text-ink-muted">
      {children}
    </span>
  );
}

function Header({
  company,
  onReport,
}: {
  company: PublicCompany;
  onReport: () => void;
}) {
  const place = [company.location?.city, company.location?.country]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="grain relative overflow-hidden rounded-xl border border-hairline bg-surface-1 p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 -z-0"
        style={{
          background:
            "radial-gradient(60% 100% at 20% 0%, rgba(86,69,212,0.14), transparent 70%)",
        }}
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <CompanyLogo
            logoKey={company.logo}
            name={company.name}
            seed={company._id}
            size={64}
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {company.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>
                <Briefcase className="size-3.5 text-ink-subtle" />
                {titleCase(company.industry)}
              </Chip>
              <Chip>
                <Users className="size-3.5 text-ink-subtle" />
                {company.size} employees
              </Chip>
              {place && (
                <Chip>
                  <MapPin className="size-3.5 text-ink-subtle" />
                  {place}
                </Chip>
              )}
              {company.foundedAt && (
                <Chip>Founded {new Date(company.foundedAt).getFullYear()}</Chip>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm">
                <Globe className="size-4" />
                Website
              </Button>
            </a>
          )}
          {company.socialMedia?.linkedin && (
            <a href={company.socialMedia.linkedin} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm">
                <ExternalLink className="size-4" />
                LinkedIn
              </Button>
            </a>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="px-3"
            aria-label="Report company"
            onClick={onReport}
          >
            <Flag className="size-4" />
          </Button>
        </div>
      </div>

      {company.description && (
        <p className="relative mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          {company.description}
        </p>
      )}
    </div>
  );
}

export default function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: user } = useSession();

  const company = usePublicCompany(id);
  const jobsQuery = useCompanyJobs(id);
  const [reportOpen, setReportOpen] = useState(false);

  const jobs = useMemo<Job[]>(() => {
    const docs = jobsQuery.data?.docs ?? [];
    if (!company.data) return docs;
    return docs.map((job) => ({
      ...job,
      company: { _id: id, name: company.data.name, logo: company.data.logo },
    }));
  }, [jobsQuery.data, company.data, id]);

  const onReport = () => {
    if (!user) {
      router.push(`/login?from=/companies/${id}`);
      return;
    }
    if (user.role !== "user") {
      toast.info("Only job seekers can report a company");
      return;
    }
    setReportOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        {company.isLoading && (
          <div className="h-48 animate-pulse rounded-xl border border-hairline bg-surface-1" />
        )}

        {company.isError && (
          <div className="py-10">
            <EmptyState
              icon={Building2}
              title="Company not found"
              description="This company may be inactive or the link is incorrect."
            />
          </div>
        )}

        {company.data && (
          <>
            <Header company={company.data} onReport={onReport} />

            <section className="mt-8">
              <h2 className="mb-4 text-headline">
                Open roles
                {jobs.length > 0 && (
                  <span className="ml-2 text-ink-subtle">{jobs.length}</span>
                )}
              </h2>

              {jobsQuery.isLoading && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-44 animate-pulse rounded-lg border border-hairline bg-surface-1"
                    />
                  ))}
                </div>
              )}

              {jobsQuery.isError && <ErrorState onRetry={jobsQuery.refetch} />}

              {!jobsQuery.isLoading && !jobsQuery.isError && jobs.length === 0 && (
                <EmptyState
                  icon={Briefcase}
                  title="No open roles right now"
                  description="This company doesn't have any published jobs at the moment."
                />
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onSelect={() => router.push(`/jobs?selected=${job._id}`)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />

      {company.data && (
        <ReportCompanyModal
          companyId={id}
          companyName={company.data.name}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </>
  );
}
