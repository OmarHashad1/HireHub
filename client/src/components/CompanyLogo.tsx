"use client";

import { Building2 } from "lucide-react";
import { usePresignedUrl } from "@/lib/presigned";
import { accentFromString, cn } from "@/lib/utils";

/**
 * Company logo with a building-icon fallback.
 *
 * The fallback tile stays dark (surface-3) to sit in the dark theme; only the
 * icon carries a soft, deterministic per-company tint.
 *
 * Logos are public assets, so the presigned URL is fetched through the
 * unauthenticated `/public/uploads` route — this renders for logged-out
 * visitors browsing the job board too.
 */
export function CompanyLogo({
  logoKey,
  name,
  seed,
  size = 44,
  className,
}: {
  logoKey?: string | null;
  name?: string | null;
  /** Stable color seed; defaults to the company name. */
  seed?: string;
  size?: number;
  className?: string;
}) {
  const { data: url } = usePresignedUrl(logoKey, "public");
  const accent = accentFromString(seed ?? name);

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-hairline",
        className,
      )}
      style={{ width: size, height: size, background: "var(--surface-3)" }}
    >
      {url ? (
        <img
          src={url}
          alt={name ? `${name} logo` : "Company logo"}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <>
          {/* faint tinted glow so the dark tile reads with the icon's accent */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              background: `radial-gradient(120% 120% at 28% 18%, ${accent.bg}, transparent 60%)`,
            }}
          />
          <Building2
            className="relative"
            strokeWidth={1.75}
            style={{ color: accent.bg, width: size * 0.46, height: size * 0.46 }}
          />
        </>
      )}
    </span>
  );
}
