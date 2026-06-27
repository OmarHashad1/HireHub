"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LogOut, MonitorSmartphone } from "lucide-react";
import { api, apiMessage } from "@/lib/api";
import { useLogout, useSession } from "@/lib/auth";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/schemas/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { TextField, PasswordField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { OtpInput } from "@/components/ui/OtpInput";

// Backend OTPs live for 2 minutes and re-requesting before they expire is
// rejected (429), so the resend control is gated by a matching countdown.
const OTP_COOLDOWN = 120;

function useCountdown() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return [seconds, () => setSeconds(OTP_COOLDOWN)] as const;
}

function ResendCode({
  cooldown,
  busy,
  onResend,
}: {
  cooldown: number;
  busy: boolean;
  onResend: () => void;
}) {
  const waiting = cooldown > 0;
  return (
    <button
      type="button"
      onClick={onResend}
      disabled={busy || waiting}
      className="text-sm text-ink-subtle transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-ink-tertiary disabled:hover:text-ink-tertiary"
    >
      {waiting ? `Request a new code in ${cooldown}s` : "Request a new code"}
    </button>
  );
}

function Card({
  title,
  description,
  children,
  danger,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border bg-surface-1 p-5 sm:p-6 ${
        danger ? "border-error/30" : "border-hairline"
      }`}
    >
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-subtle">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ChangeEmailModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"email" | "otp">("email");
  const [busy, setBusy] = useState(false);
  const [cooldown, startCooldown] = useCountdown();

  const close = () => {
    setEmail("");
    setOtp("");
    setStage("email");
    onClose();
  };

  const requestCode = async () => {
    await api.post("/user/change-email/send-otp", { email });
    startCooldown();
  };

  const sendOtp = async () => {
    setBusy(true);
    try {
      await requestCode();
      setStage("otp");
      toast.success("Code sent to the new address");
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't send code"));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    try {
      await requestCode();
      setOtp("");
      toast.success("A new code is on its way");
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't resend code"));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await api.patch("/user/change-email", { email, otp });
      toast.success("Email updated");
      close();
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't change email"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Change email">
      {stage === "email" ? (
        <div className="space-y-4">
          <TextField
            label="New email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="new@work.com"
          />
          <Button className="w-full" onClick={sendOtp} disabled={busy || !email}>
            {busy ? "Sending…" : "Send verification code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink-subtle">
            Enter the code sent to {email}.
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          <Button
            className="w-full"
            onClick={confirm}
            disabled={busy || otp.length !== 6}
          >
            {busy ? "Updating…" : "Confirm new email"}
          </Button>
          <div className="flex justify-center">
            <ResendCode cooldown={cooldown} busy={busy} onResend={resend} />
          </div>
        </div>
      )}
    </Modal>
  );
}

function DeleteAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"start" | "otp">("start");
  const [busy, setBusy] = useState(false);
  const [cooldown, startCooldown] = useCountdown();

  const requestCode = async () => {
    await api.post("/user/delete-account/send-otp");
    startCooldown();
  };

  const sendOtp = async () => {
    setBusy(true);
    try {
      await requestCode();
      setStage("otp");
      toast.success("Confirmation code sent");
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't send code"));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    try {
      await requestCode();
      setOtp("");
      toast.success("A new code is on its way");
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't resend code"));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await api.delete("/user/delete-account", { data: { otp } });
      toast.success("Account deleted");
      router.push("/");
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't delete account"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete account"
      description="This permanently removes your profile, CV, and applications."
    >
      {stage === "start" ? (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={sendOtp}
            disabled={busy}
            className="bg-error hover:bg-error/90"
          >
            {busy ? "Sending…" : "Send confirmation code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <OtpInput value={otp} onChange={setOtp} />
          <Button
            onClick={confirm}
            disabled={busy || otp.length !== 6}
            className="w-full bg-error hover:bg-error/90"
          >
            {busy ? "Deleting…" : "Permanently delete account"}
          </Button>
          <div className="flex justify-center">
            <ResendCode cooldown={cooldown} busy={busy} onResend={resend} />
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function SettingsPage() {
  const { data: user } = useSession();
  const logout = useLogout();
  const [emailOpen, setEmailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const changePassword = (values: ChangePasswordValues) => {
    const { confirmPassword: _c, ...payload } = values;
    void _c;
    api
      .patch("/auth/change-password", payload)
      .then(() => {
        toast.success("Password changed");
        reset();
      })
      .catch((e) => toast.error(apiMessage(e, "Couldn't change password")));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Settings" subtitle="Manage your account and security." />

      <Card title="Email" description="The address used to sign in and receive updates.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-sm text-ink-muted">{user?.email}</p>
          <Button variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>
            Change email
          </Button>
        </div>
      </Card>

      <Card title="Password" description="Use 8+ characters with a mix of types.">
        <form
          onSubmit={handleSubmit(changePassword)}
          className="space-y-4"
        >
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField
              label="New password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <PasswordField
              label="Confirm new"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </Card>

      <Card title="Sessions" description="Sign out of this device or everywhere.">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => logout.mutate("device")}>
            <LogOut className="size-4" />
            This device
          </Button>
          <Button variant="secondary" onClick={() => logout.mutate("all")}>
            <MonitorSmartphone className="size-4" />
            All devices
          </Button>
        </div>
      </Card>

      <Card
        title="Delete account"
        description="Permanently delete your account and all associated data."
        danger
      >
        <Button
          onClick={() => setDeleteOpen(true)}
          className="bg-error hover:bg-error/90"
        >
          Delete account
        </Button>
      </Card>

      <ChangeEmailModal open={emailOpen} onClose={() => setEmailOpen(false)} />
      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}
