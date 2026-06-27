import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";

type Scope = "protected" | "public";

/**
 * Resolves an S3 object key to a short-lived presigned URL.
 *
 * - `protected` (default) hits `/uploads/*` and requires an authenticated
 *   session — use for avatars, CVs, and other owner-scoped files.
 * - `public` hits `/public/uploads/*` (no auth) — use for company logos and
 *   anything renderable to logged-out visitors.
 */
export function usePresignedUrl(
  key?: string | null,
  scope: Scope = "protected",
) {
  const base = scope === "public" ? "/public/uploads" : "/uploads";
  return useQuery({
    queryKey: ["presigned", scope, key],
    enabled: !!key,
    staleTime: 100_000,
    gcTime: 110_000,
    queryFn: () =>
      unwrap<{ requestedFile: string }>(api.get(`${base}/${key}`)).then(
        (d) => d.requestedFile,
      ),
  });
}
