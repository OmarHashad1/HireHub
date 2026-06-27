"use client";

import {
  Bookmark,
  CalendarClock,
  FileText,
  Flag,
  Settings,
  UserRound,
} from "lucide-react";
import { AuthGate } from "@/lib/auth";
import { WorkspaceShell, type NavItem } from "@/components/workspace/WorkspaceShell";

const nav: NavItem[] = [
  { href: "/me", label: "Profile", icon: UserRound, exact: true },
  { href: "/me/applications", label: "Applications", icon: FileText },
  { href: "/me/interviews", label: "Interviews", icon: CalendarClock },
  { href: "/me/saved", label: "Saved jobs", icon: Bookmark },
  { href: "/me/reports", label: "Reports", icon: Flag },
  { href: "/me/settings", label: "Settings", icon: Settings },
];

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate role="user">
      <WorkspaceShell nav={nav} eyebrow="Workspace">
        {children}
      </WorkspaceShell>
    </AuthGate>
  );
}
