import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  if (!pw.trim()) return "Please enter a new password.";
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Password must include at least one letter and one number.";
  return null;
}

function ResetPasswordPage() {
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
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

      // Newer email templates send ?token_hash=...&type=recovery
      const tokenHash = url.searchParams.get("token_hash") ?? hash.get("token_hash");
      const type = url.searchParams.get("type") ?? hash.get("type");
      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        if (!cancelled) setStatus(error ? "invalid" : "ready");
        return;
      }

      // PKCE flow
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled) setStatus(error ? "invalid" : "ready");
        return;
      }

      // Implicit flow: tokens in the URL hash
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!cancelled) setStatus(error ? "invalid" : "ready");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) setStatus("ready");
      else if (!cancelled) {
        // Give the client a moment to parse recovery tokens from the URL.
        setTimeout(async () => {
          const again = await supabase.auth.getSession();
          if (!cancelled) setStatus(again.data.session ? "ready" : "invalid");
        }, 1500);
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
    if (!confirm.trim()) return setMessage("Please confirm your new password.");
    if (password !== confirm) return setMessage("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setMessage(error.message);
    setPassword("");
    setConfirm("");
    setStatus("done");
  }

  const fieldClass = "mt-1 w-full border border-border bg-card px-3 py-2 pr-11 text-sm";
  const toggleClass =
    "absolute inset-y-0 right-0 mt-1 flex items-center px-3 text-muted-foreground hover:text-foreground";

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
              This password reset link is invalid or has expired. Please request a new reset link.
            </p>
            <Link
              to="/auth"
              search={{ mode: "forgot" }}
              className="mt-6 inline-block w-full bg-primary px-5 py-3 text-center text-sm font-semibold uppercase tracking-widest text-primary-foreground"
            >
              Request new reset link
            </Link>
          </>
        )}

        {status === "ready" && (
          <>
            <p className="mt-6 text-sm text-muted-foreground">Choose a new password for your shop account.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="relative">
                <label htmlFor="new-password" className="text-xs uppercase tracking-widest text-muted-foreground">New password</label>
                <input
                  id="new-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass}
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((v) => !v)}
                  className={toggleClass}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <div className="relative">
                <label htmlFor="confirm-password" className="text-xs uppercase tracking-widest text-muted-foreground">Confirm new password</label>
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={fieldClass}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((v) => !v)}
                  className={toggleClass}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">At least 8 characters, including a letter and a number.</p>
              {message && <p className="text-sm text-destructive">{message}</p>}
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
              Password updated successfully. You can now sign in with your new password.
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
