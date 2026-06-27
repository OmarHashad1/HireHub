import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";

const groups = [
  {
    title: "Product",
    links: [
      { href: "/jobs", label: "Browse jobs" },
      { href: "/signup", label: "Create profile" },
      { href: "/company/apply", label: "Post a job" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/#recruiters", label: "For recruiters" },
      { href: "/#ai", label: "AI screening" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/signup", label: "Sign up" },
      { href: "/me", label: "Workspace" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[15px] font-semibold tracking-tight">
              HireHub
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-subtle">
            AI-assisted hiring on a near-black canvas. Sharper matches for
            seekers, a faster pipeline for recruiters.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
              {g.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-subtle transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-6 text-xs text-ink-tertiary sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} HireHub. Built for the work that matters.</p>
          <p className="font-mono">crafted on #010102</p>
        </div>
      </div>
    </footer>
  );
}
