import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 60% at 50% -10%, rgba(86,69,212,0.18) 0%, transparent 55%)",
        }}
      />
      <div className="w-full max-w-[400px]">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">
            HireHub
          </span>
        </Link>

        <div className="grain rounded-xl border border-hairline bg-surface-1 p-6 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-ink-subtle">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-ink-subtle">{footer}</p>
        )}
      </div>
    </main>
  );
}
