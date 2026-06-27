"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { api, unwrap, apiMessage } from "@/lib/api";
import { getFcmToken, getStoredFcmToken } from "@/lib/fcm";
import {
  type Role,
  type SessionUser,
  homeForRole,
} from "@/lib/session";
import type { LoginValues, SignupValues } from "@/schemas/auth";

export const sessionKey = ["session"] as const;

export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        return await unwrap<SessionUser>(api.get("/user/profile"));
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: LoginValues) => {
      const FCM = await getFcmToken();
      await api.post("/auth/login", { ...values, FCM });
      return unwrap<SessionUser>(api.get("/user/profile"));
    },
    onSuccess: (user) => {
      qc.setQueryData(sessionKey, user);
    },
    onError: (error) => toast.error(apiMessage(error, "Couldn't sign in")),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (values: SignupValues) => {
      const { confirmPassword: _confirm, ...payload } = values;
      void _confirm;
      return unwrap<SessionUser>(api.post("/auth/signup", payload));
    },
    onError: (error) =>
      toast.error(apiMessage(error, "Couldn't create your account")),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (type: "device" | "all" = "device") =>
      api.post("/user/logout", { type, FCM: getStoredFcmToken() ?? undefined }),
    onSuccess: () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("hirehub:fcm");
      }
      qc.setQueryData(sessionKey, null);
      qc.clear();
      router.push("/login");
      toast.success("Signed out");
    },
    onError: (error) => toast.error(apiMessage(error, "Couldn't sign out")),
  });
}

export function AuthGate({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?from=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (user.role !== role) {
      router.replace(homeForRole[user.role]);
    }
  }, [user, isLoading, role, router]);

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-ink-subtle">
        Loading your workspace…
      </div>
    );
  }

  if (isError || !user || user.role !== role) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-ink-subtle">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
