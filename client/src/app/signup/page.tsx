"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupValues } from "@/schemas/auth";
import { useSignup } from "@/lib/auth";
import { GOOGLE_OAUTH_URL } from "@/lib/api";
import { AuthShell } from "@/components/marketing/AuthShell";
import { TextField, PasswordField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/marketing/GoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const signup = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const onSubmit = (values: SignupValues) => {
    signup.mutate(values, {
      onSuccess: () => {
        toast.success("Account created — verify your email");
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      },
    });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Find sharper matches and apply in one step."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-hover hover:underline">
            Sign in
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
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="First name"
            placeholder="Jane"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <TextField
            label="Last name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@work.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Phone"
          placeholder="+201234567890"
          error={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />
        <TextField
          label="Headline"
          hint="Optional — e.g. Frontend Engineer"
          placeholder="What do you do?"
          error={errors.headline?.message}
          {...register("headline")}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="8+ chars, an uppercase, a number, and a symbol"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" className="w-full" disabled={signup.isPending}>
          {signup.isPending ? "Creating…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
