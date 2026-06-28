"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Flag,
  ArrowRight,
  FileCheck2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminStats, type AdminStats } from "@/features/admin/api";
import { titleCase } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/States";

const CARDS = [
  { key: "users", label: "Users", icon: Users, href: "/admin/users" },
  { key: "companies", label: "Companies", icon: Building2, href: "/admin/companies" },
  { key: "jobs", label: "Jobs", icon: Briefcase, href: "/admin/jobs" },
  {
    key: "applications",
    label: "Applications",
    icon: FileText,
    href: "/admin/applications",
  },
  { key: "reports", label: "Reports", icon: Flag, href: "/admin/reports" },
] as const;

const CHART_COLORS = [
  "#6f5ce8",
  "#5cc8e8",
  "#5ce89a",
  "#e8cf5c",
  "#e8945c",
  "#e85c8a",
];

function toSeries(record?: Record<string, number>) {
  if (!record) return [];
  return Object.entries(record)
    .map(([name, value]) => ({ name: titleCase(name), value }))
    .sort((a, b) => b.value - a.value);
}

const tooltipStyle = {
  background: "var(--surface-3)",
  border: "1px solid var(--hairline-strong)",
  borderRadius: 10,
  color: "var(--ink)",
  fontSize: 12,
};

function ChartCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactElement;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-5">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      <div className="mt-4 h-56">
        {empty ? (
          <div className="grid h-full place-items-center text-sm text-ink-subtle">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Summary({ data }: { data: AdminStats }) {
  const live = data.jobsByStatus?.published ?? 0;
  const actionable = [
    {
      label: "companies awaiting approval",
      count: data.pendingCompanyApplications,
      href: "/admin/company-applications",
    },
    {
      label: "reports need attention",
      count: data.pendingReports,
      href: "/admin/reports",
    },
  ].filter((a) => a.count > 0);

  return (
    <section className="rounded-xl border border-hairline bg-surface-1 p-5 sm:p-6">
      <p className="text-[15px] leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">{data.users}</span> job seekers
        and <span className="font-semibold text-ink">{data.companies}</span>{" "}
        companies on HireHub —{" "}
        <span className="font-semibold text-ink">{live}</span> live jobs and{" "}
        <span className="font-semibold text-ink">{data.applications}</span>{" "}
        applications to date.
      </p>
      {actionable.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actionable.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary-hover transition-colors hover:bg-primary/15"
            >
              <FileCheck2 className="size-3.5" />
              {a.count} {a.label}
              <ArrowRight className="size-3.5" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-ink-subtle">
          Nothing needs your attention right now.
        </p>
      )}
    </section>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading, isError, refetch } = useAdminStats();

  const jobSeries = toSeries(data?.jobsByStatus);
  const appSeries = toSeries(data?.applicationsByStatus);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader title="Platform overview" subtitle="Health and totals across HireHub." />

      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && <Summary data={data} />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="group rounded-xl border border-hairline bg-surface-1 p-4 transition-colors hover:border-hairline-strong hover:bg-surface-2 sm:p-5"
          >
            <span className="grid size-9 place-items-center rounded-md border border-hairline bg-surface-2 text-ink-subtle">
              <card.icon className="size-4" />
            </span>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">
              {isLoading ? "—" : (data?.[card.key] ?? 0)}
            </p>
            <p className="flex items-center gap-1 text-[13px] text-ink-subtle">
              {card.label}
              <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Jobs by status" empty={jobSeries.length === 0}>
          <PieChart>
            <Pie
              data={jobSeries}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              stroke="var(--surface-1)"
            >
              {jobSeries.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ChartCard>

        <ChartCard
          title="Applications by status"
          empty={appSeries.length === 0}
        >
          <BarChart data={appSeries}>
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--ink-subtle)", fontSize: 11 }}
              axisLine={{ stroke: "var(--hairline)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "var(--surface-2)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {appSeries.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
