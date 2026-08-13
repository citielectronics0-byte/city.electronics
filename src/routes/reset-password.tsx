import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — City Electronics" },
      { name: "description", content: "Set a new password for your City Electronics shop account." },
      { property: "og:title", content: "Reset Password — City Electronics" },
      { property: "og:description", content: "Set a new password for your City Electronics shop account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Password must include at least one letter and one number.";
  return null;
}

function ResetPasswordPage() {
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (!cancelled) setStatus("ready");
      }
    });

    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errDesc = url.searchParams.get("error_description") ?? hash.get("error_description");
      if (errDesc) {
        if (!cancelled) setStatus("invalid");
        return;
      }
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled) setStatus(error ? "invalid" : "ready");
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) setStatus("ready");
      else if (!cancelled) {
        // Give the client a moment to parse recovery tokens from the URL hash.
        setTimeout(async () => {
          const again = await supabase.auth.getSession();
          if (!cancelled) setStatus(again.data.session ? "ready" : "invalid");
        }, 1200);
      }
    })();

    return () => {
      cancelled = true;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const problem = passwordProblem(password);
    if (problem) return setMessage(problem);
    if (password !== confirm) return setMessage("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setMessage(error.message);
    setStatus("done");
  }

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    setResendMsg(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendEmail)) {
      setResendMsg("Please enter a valid email address.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resendEmail, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset-password`,
    });
    setResendMsg(error ? error.message : "If that email has an account, a new reset link is on its way.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/50 px-5 py-16">
      <div className="card-classic w-full max-w-md p-8">
        <h1 className="rule-gold font-display text-3xl">Reset password</h1>

        {status === "checking" && (
          <p className="mt-6 text-sm text-muted-foreground">Checking your reset link…</p>
        )}

        {status === "invalid" && (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              This reset link is invalid or has expired. Request a new one below.
            </p>
            <form onSubmit={resend} className="mt-6 space-y-4">
              <div>
                <label htmlFor="resend-email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
                <input
                  id="resend-email"
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
                />
              </div>
              {resendMsg && <p className="text-sm text-muted-foreground">{resendMsg}</p>}
              <button
                type="submit"
                className="w-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground"
              >
                Send reset link
              </button>
            </form>
          </>
        )}

        {status === "ready" && (
          <>
            <p className="mt-6 text-sm text-muted-foreground">Choose a new password for your shop account.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="new-password" className="text-xs uppercase tracking-widest text-muted-foreground">New password</label>
                <input
                  id="new-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="text-xs uppercase tracking-widest text-muted-foreground">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">At least 8 characters, including a letter and a number.</p>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
              >
                {busy ? "Please wait…" : "Update password"}
              </button>
            </form>
          </>
        )}

        {status === "done" && (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-block w-full bg-primary px-5 py-3 text-center text-sm font-semibold uppercase tracking-widest text-primary-foreground"
            >
              Back to shop login
            </Link>
          </>
        )}

        {status !== "done" && (
          <Link
            to="/auth"
            className="mt-5 inline-block text-xs uppercase tracking-widest text-accent-foreground underline decoration-accent underline-offset-4"
          >
            Back to login
          </Link>
        )}
      </div>
    </div>
  );
}
