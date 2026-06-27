"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout, useSession } from "@/lib/auth";
import { Logo } from "@/components/marketing/Logo";
import { Avatar } from "@/components/Avatar";

export type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function WorkspaceShell({
  nav,
  eyebrow,
  children,
}: {
  nav: NavItem[];
  eyebrow: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: user } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  const SideNav = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-surface-2 text-ink"
                : "text-ink-subtle hover:bg-surface-2/60 hover:text-ink",
            )}
          >
            <item.icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-hairline bg-canvas p-4 lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">HireHub</span>
        </Link>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
          {eyebrow}
        </p>
        {SideNav}
        <div className="mt-auto border-t border-hairline pt-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <Avatar avatarKey={user?.avatar} name={user?.firstName} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">
                {user ? `${user.firstName} ${user.lastName}` : "—"}
              </p>
              <p className="truncate text-[12px] text-ink-subtle">{user?.email}</p>
            </div>
            <button
              aria-label="Sign out"
              onClick={() => logout.mutate("device")}
              className="grid size-8 place-items-center rounded-md text-ink-subtle hover:bg-surface-3 hover:text-ink"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-hairline bg-canvas/85 px-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              aria-label="Menu"
              onClick={() => setOpen(true)}
              className="grid size-9 place-items-center rounded-md text-ink"
            >
              <Menu className="size-5" />
            </button>
            <Logo />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1.5">
            <button
              aria-label="Notifications"
              className="relative grid size-9 place-items-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
            >
              <Bell className="size-[18px]" />
            </button>
            <Avatar avatarKey={user?.avatar} name={user?.firstName} size={32} />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-hairline bg-canvas p-4">
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                <Logo />
                <span className="text-[15px] font-semibold tracking-tight">
                  HireHub
                </span>
              </Link>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-md text-ink-subtle"
              >
                <X className="size-5" />
              </button>
            </div>
            {SideNav}
            <button
              onClick={() => logout.mutate("device")}
              className="mt-auto flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ink-subtle hover:text-ink"
            >
              <LogOut className="size-[18px]" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
