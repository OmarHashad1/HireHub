"use client";

import {
  LayoutDashboard,
  Users,
  Building2,
  FileCheck2,
  Briefcase,
  FileText,
  Flag,
  ScrollText,
} from "lucide-react";
import { AuthGate } from "@/lib/auth";
import {
  WorkspaceShell,
  type NavItem,
} from "@/components/workspace/WorkspaceShell";

const nav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  {
    href: "/admin/company-applications",
    label: "Onboarding",
    icon: FileCheck2,
  },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/logs", label: "Activity log", icon: ScrollText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate role="admin">
      <WorkspaceShell nav={nav} eyebrow="Admin">
        {children}
      </WorkspaceShell>
    </AuthGate>
  );
}
