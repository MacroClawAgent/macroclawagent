"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabaseReady = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady) {
      setError("Auth backend not configured — add Supabase keys to your environment variables.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess(
          "Check your email for a confirmation link to activate your account."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabaseReady) {
      setError("Auth backend not configured — add Supabase keys to your environment variables.");
      return;
    }
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col">
      {/* Top nav */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl transition-transform group-hover:scale-110 duration-200">
            🦀
          </span>
          <span className="font-bold text-slate-100 tracking-tight">
            MacroClawAgent
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Back to home
        </Link>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Decorative orbs */}
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-indigo-900/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-violet-900/15 blur-3xl pointer-events-none" />

          {/* Unconfigured banner */}
          <AnimatePresence>
            {!supabaseReady && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-300 mb-0.5">
                    Auth backend not configured
                  </p>
                  <p className="text-xs text-amber-300/70">
                    Add{" "}
                    <code className="font-mono bg-amber-500/10 px-1 rounded">
                      NEXT_PUBLIC_SUPABASE_URL
                    </code>{" "}
                    and{" "}
                    <code className="font-mono bg-amber-500/10 px-1 rounded">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </code>{" "}
                    to your Vercel environment variables.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-slate-100 tracking-tight">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-slate-400 mt-2 text-sm">
                {mode === "login"
                  ? "Sign in to access your AI nutrition dashboard."
                  : "Start optimizing your nutrition with AI."}
              </p>
            </div>

            <Card className="glass-card border-0">
              <CardContent className="p-8 flex flex-col gap-5">
                {/* Mode toggle */}
                <div className="flex rounded-xl bg-white/5 p-1 gap-1">
                  {(["login", "signup"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m);
                        setError(null);
                        setSuccess(null);
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        mode === m
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {m === "login" ? "Sign In" : "Sign Up"}
                    </button>
                  ))}
                </div>

                {/* Google OAuth */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 glass rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-200 text-sm font-medium text-slate-200"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.08]" />
                  <span className="text-xs text-slate-500 font-medium">or</span>
                  <div className="flex-1 h-px bg-white/[0.08]" />
                </div>

                {/* Email/password form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="athlete@example.com"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all duration-200"
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Password
                      </label>
                      {mode === "login" && (
                        <button
                          type="button"
                          className="text-xs text-indigo-400/80 hover:text-indigo-300 transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          mode === "signup"
                            ? "Min. 8 characters"
                            : "Your password"
                        }
                        required
                        minLength={mode === "signup" ? 8 : undefined}
                        className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error / Success messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-start gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-300">{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-start gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-300">{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Terms */}
                {mode === "signup" && (
                  <p className="text-center text-xs text-slate-600 leading-relaxed">
                    By creating an account you agree to our{" "}
                    <a href="#" className="text-indigo-400/80 hover:text-indigo-300 transition-colors">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-indigo-400/80 hover:text-indigo-300 transition-colors">
                      Privacy Policy
                    </a>
                    .
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
