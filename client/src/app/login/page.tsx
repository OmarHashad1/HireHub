"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginValues } from "@/schemas/auth";
import { useLogin, useSession } from "@/lib/auth";
import { homeForRole } from "@/lib/session";
import { GOOGLE_OAUTH_URL } from "@/lib/api";
import { AuthShell } from "@/components/marketing/AuthShell";
import { TextField, PasswordField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/marketing/GoogleButton";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from");
  const oauthError = params.get("error");
  const login = useLogin();
  const { data: user } = useSession();

  useEffect(() => {
    if (user) router.replace(from || homeForRole[user.role]);
  }, [user, from, router]);

  useEffect(() => {
    if (oauthError === "oauth") {
      toast.error("Google sign-in didn't complete. Please try again.");
    }
  }, [oauthError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginValues) => {
    login.mutate(values, {
      onSuccess: (session) => {
        toast.success("Welcome back");
        router.replace(from || homeForRole[session.role]);
      },
    });
  };

  return (
    <AuthShell
      title="Sign in to HireHub"
      subtitle="Pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary-hover hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton href={GOOGLE_OAUTH_URL} />

      <div className="my-5 flex items-center gap-3 text-[12px] text-ink-tertiary">
        <span className="h-px flex-1 bg-hairline" />
        or
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@work.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <PasswordField
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-[12px] text-ink-subtle hover:text-ink"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
