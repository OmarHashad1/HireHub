"use client";

import {
  LayoutDashboard,
  Briefcase,
  CalendarClock,
  Building2,
} from "lucide-react";
import { AuthGate } from "@/lib/auth";
import {
  WorkspaceShell,
  type NavItem,
} from "@/components/workspace/WorkspaceShell";

const nav: NavItem[] = [
  { href: "/recruiter", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
  { href: "/recruiter/interviews", label: "Interviews", icon: CalendarClock },
  { href: "/recruiter/profile", label: "Company", icon: Building2 },
];

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate role="company">
      <WorkspaceShell nav={nav} eyebrow="Recruiter">
        {children}
      </WorkspaceShell>
    </AuthGate>
  );
}
