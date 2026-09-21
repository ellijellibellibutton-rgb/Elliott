"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Field, TextInput, Button, ErrorBanner } from "./ui";

export default function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Login failed.");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-4 py-16">
      <div
        className="blob-1 absolute -left-24 top-10 h-80 w-80 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #6d5ce7, transparent 70%)" }}
      />
      <div
        className="blob-2 absolute -right-16 bottom-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #3987e5, transparent 70%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
      >
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{ background: "var(--accent-gradient)" }}
        >
          <Lock size={22} strokeWidth={2.25} />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-navy-900">Admin Access</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter the admin password to manage the Corporate Giving Hub.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4 text-left">
          <ErrorBanner message={error} />
          <Field label="Password">
            <TextInput
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
