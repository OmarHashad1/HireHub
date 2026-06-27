"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { sessionKey } from "@/lib/auth";
import { homeForRole, type SessionUser } from "@/lib/session";

function GoogleCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const ticket = params.get("ticket");
    if (!ticket) {
      router.replace("/login?error=oauth");
      return;
    }

    (async () => {
      try {
        await api.post("/auth/login/google/exchange", { ticket });
        const user = await unwrap<SessionUser>(api.get("/user/profile"));
        qc.setQueryData(sessionKey, user);
        router.replace(homeForRole[user.role]);
      } catch {
        router.replace("/login?error=oauth");
      }
    })();
  }, [params, qc, router]);

  return (
    <main className="grid min-h-dvh place-items-center text-sm text-ink-subtle">
      Finishing sign in…
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-dvh place-items-center text-sm text-ink-subtle">
          Finishing sign in…
        </main>
      }
    >
      <GoogleCallback />
    </Suspense>
  );
}
