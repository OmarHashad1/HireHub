"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api, apiMessage } from "@/lib/api";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/auth";
import { AuthShell } from "@/components/marketing/AuthShell";
import { TextField, PasswordField } from "@/components/ui/Field";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";

type Step = "email" | "otp" | "reset";

const stepCopy: Record<Step, { title: string; subtitle: string }> = {
  email: {
    title: "Reset your password",
    subtitle: "We'll send a code to your email.",
  },
  otp: { title: "Enter the code", subtitle: "Check your inbox for a 6-digit code." },
  reset: { title: "Set a new password", subtitle: "Choose something strong." },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [otpError, setOtpError] = useState<string>();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const sendOtp = async () => {
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep("otp");
      setSeconds(120);
      setValue("email", email);
      toast.success("Code sent");
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't send the code"));
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError(undefined);
    setBusy(true);
    try {
      await api.post("/auth/forgot-password/verify-otp", { email, otp });
      setStep("reset");
      toast.success("Verified — set a new password");
    } catch (e) {
      const msg = apiMessage(e, "Invalid or expired code");
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = (values: ResetPasswordValues) => {
    const { confirmPassword: _c, ...payload } = values;
    void _c;
    setBusy(true);
    api
      .patch("/auth/reset-password", payload)
      .then(() => {
        toast.success("Password updated — sign in");
        router.push("/login");
      })
      .catch((e) => toast.error(apiMessage(e, "Couldn't reset password")))
      .finally(() => setBusy(false));
  };

  const copy = stepCopy[step];

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <Link href="/login" className="font-medium text-primary-hover hover:underline">
          Back to sign in
        </Link>
      }
    >
      {step === "email" && (
        <div className="space-y-4">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@work.com"
          />
          <Button className="w-full" onClick={sendOtp} disabled={busy || !email}>
            {busy ? "Sending…" : "Send code"}
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-5">
          <OtpInput value={otp} onChange={setOtp} error={!!otpError} />
          {otpError && <p className="text-[12px] text-error">{otpError}</p>}
          <Button
            className="w-full"
            onClick={verifyOtp}
            disabled={otp.length !== 6 || busy}
          >
            {busy ? "Verifying…" : "Verify code"}
          </Button>
          <button
            type="button"
            onClick={sendOtp}
            disabled={seconds > 0 || busy}
            className="w-full text-center text-[13px] text-ink-subtle hover:text-ink disabled:opacity-50"
          >
            {seconds > 0 ? `Resend code in ${seconds}s` : "Resend code"}
          </button>
        </div>
      )}

      {step === "reset" && (
        <form onSubmit={handleSubmit(resetPassword)} className="space-y-4">
          <PasswordField
            label="New password"
            autoComplete="new-password"
            placeholder="••••••••"
            hint="8+ chars, an uppercase, a number, and a symbol"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
