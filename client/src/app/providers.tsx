"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { sessionKey, CompanyConfinement } from "@/lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    const onSignedOut = () => client.setQueryData(sessionKey, null);
    window.addEventListener("hirehub:signed-out", onSignedOut);
    return () => window.removeEventListener("hirehub:signed-out", onSignedOut);
  }, [client]);

  return (
    <QueryClientProvider client={client}>
      <CompanyConfinement>{children}</CompanyConfinement>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface-3)",
            border: "1px solid var(--hairline-strong)",
            color: "var(--ink)",
            borderRadius: "12px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
