"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api, apiMessage } from "@/lib/api";
import { AuthShell } from "@/components/marketing/AuthShell";
import { TextField } from "@/components/ui/Field";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";

function VerifyEmail() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string>();
  const autoSent = useRef(false);

  const send = useCallback(async () => {
    if (!email) return;
    setSending(true);
    try {
      await api.post("/auth/send-verify-email", { email });
      setSent(true);
      setSeconds(120);
      toast.success("Verification code sent");
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't send the code"));
    } finally {
      setSending(false);
    }
  }, [email]);

  useEffect(() => {
    if (email && !autoSent.current) {
      autoSent.current = true;
      void send();
    }
  }, [email, send]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const verify = async () => {
    setError(undefined);
    setVerifying(true);
    try {
      await api.post("/auth/verify-email", { email, otp });
      toast.success("Email verified — you can sign in now");
      router.push("/login");
    } catch (e) {
      const msg = apiMessage(e, "Invalid or expired code");
      setError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        sent
          ? `We sent a 6-digit code to ${email}.`
          : "Enter your email to receive a verification code."
      }
    >
      {!sent ? (
        <div className="space-y-4">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@work.com"
          />
          <Button className="w-full" onClick={send} disabled={sending || !email}>
            {sending ? "Sending…" : "Send code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <OtpInput value={otp} onChange={setOtp} error={!!error} />
          {error && <p className="text-[12px] text-error">{error}</p>}
          <Button
            className="w-full"
            onClick={verify}
            disabled={otp.length !== 6 || verifying}
          >
            {verifying ? "Verifying…" : "Verify email"}
          </Button>
          <button
            type="button"
            onClick={send}
            disabled={seconds > 0 || sending}
            className="w-full text-center text-[13px] text-ink-subtle hover:text-ink disabled:opacity-50"
          >
            {seconds > 0 ? `Resend code in ${seconds}s` : "Resend code"}
          </button>
        </div>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
