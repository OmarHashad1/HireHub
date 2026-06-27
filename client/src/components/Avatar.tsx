"use client";

import { usePresignedUrl } from "@/lib/presigned";
import { cn, initials } from "@/lib/utils";

export function Avatar({
  avatarKey,
  name,
  size = 40,
  className,
}: {
  avatarKey?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const { data: url } = usePresignedUrl(avatarKey);
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-hairline bg-surface-3 font-semibold text-ink-subtle",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {url ? (
        <img src={url} alt={name ?? "Avatar"} className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
