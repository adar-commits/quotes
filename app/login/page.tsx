"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in to Quotes
        </h1>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          {loading ? "Signing in…" : "Sign in with Google"}
        </button>
        <p className="text-center text-xs text-zinc-500">
          לאחר ההתחברות תוכל לגשת ל־<a href="/settings" className="underline">הגדרות תבניות</a>.
        </p>
      </main>
    </div>
  );
}
