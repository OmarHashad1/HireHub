"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth";
import { homeForRole } from "@/lib/session";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/marketing/Logo";
import { Avatar } from "@/components/Avatar";

const links = [
  { href: "/jobs", label: "Find jobs" },
  { href: "/#recruiters", label: "For recruiters" },
  { href: "/#how", label: "How it works" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: user } = useSession();
  const workspace = user ? homeForRole[user.role] : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || open
          ? "border-hairline bg-canvas/85 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">
            HireHub
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-ink-subtle transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {workspace ? (
            <Link
              href={workspace}
              className="flex items-center gap-2.5 rounded-md border border-hairline bg-surface-1 py-1 pl-2.5 pr-1 text-sm text-ink transition-colors hover:border-hairline-strong"
            >
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="size-4 text-ink-subtle" />
                Workspace
              </span>
              <Avatar avatarKey={user?.avatar} name={user?.firstName} size={28} />
            </Link>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/signup" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-md text-ink md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-hairline bg-canvas px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-base text-ink-muted"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {workspace ? (
              <ButtonLink
                href={workspace}
                size="lg"
                onClick={() => setOpen(false)}
              >
                <LayoutDashboard className="size-4" />
                Go to workspace
              </ButtonLink>
            ) : (
              <>
                <ButtonLink
                  href="/login"
                  variant="secondary"
                  size="lg"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </ButtonLink>
                <ButtonLink href="/signup" size="lg" onClick={() => setOpen(false)}>
                  Get started
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
