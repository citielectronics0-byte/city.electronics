import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Shop Login — City Electronics" },
      { name: "description", content: "Staff login for managing the City Electronics product catalogue and stock." },
      { property: "og:title", content: "Shop Login — City Electronics" },
      { property: "og:description", content: "Staff login for the City Electronics catalogue manager." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "forgot") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setBusy(false);
        setMessage("Please enter a valid email address.");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset-password`,
      });
      setBusy(false);
      setMessage(
        error ? error.message : "If that email has an account, a reset link is on its way. Check your inbox.",
      );
      return;
    }
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/admin" },
      });
      setBusy(false);
      setMessage(error ? error.message : "Account created. Check your email to confirm, then sign in.");
      if (!error) setMode("signin");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    await supabase.rpc("claim_admin");
    navigate({ to: "/admin" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/50 px-5 py-16">
      <div className="card-classic w-full max-w-md p-8">
        <h1 className="rule-gold font-display text-3xl">
          {mode === "forgot" ? "Forgot password" : "Shop login"}
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">
          {mode === "forgot"
            ? "Enter your shop email and we'll send you a link to set a new password."
            : "Sign in to manage products, prices and stock."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
            />
          </div>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(null); }}
          className="mt-5 text-xs uppercase tracking-widest text-accent-foreground underline decoration-accent underline-offset-4"
        >
          {mode === "signin" ? "First time? Create the shop account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
