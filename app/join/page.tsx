"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, ShoppingBag, CheckCircle2, ChevronDown, AlertCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const sports = ["Running", "Cycling", "Gym / Strength", "Swimming", "Triathlon", "Other"];

const features = [
  { icon: Zap, label: "Strava Sync", color: "text-orange-400" },
  { icon: Bot, label: "AI Macros", color: "text-indigo-400" },
  { icon: ShoppingBag, label: "Smart Cart", color: "text-emerald-400" },
];

const inputClass =
  "w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200";

export default function JoinPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", sport: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/beta/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setSubmittedName(form.full_name.split(" ")[0]);
      setSubmittedEmail(form.email);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Jonno Beta", text: "Join me on Jonno — AI nutrition for athletes!", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden relative">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/50 blur-[140px]" />
      <div className="pointer-events-none absolute top-0 left-0 w-80 h-80 rounded-full bg-orange-100/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-blue-50/70 blur-[80px]" />

      {/* ── Top nav ── */}
      <nav className="relative z-20 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Jonno"
                width={20}
                height={20}
                className="object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <span className="text-gray-900 font-black text-base tracking-tight">Jonno</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* ── Main two-col layout ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-0 lg:min-h-[calc(100vh-64px)] flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-20">

        {/* ── LEFT: Hero content ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex-1 flex flex-col gap-8 lg:pt-16 lg:pb-16 lg:sticky lg:top-8"
        >
          {/* Beta badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white shadow-sm w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Beta Access — Limited Spots</span>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[0.93]">
              <span className="gradient-text-light">Fuel your training.</span>
            </h1>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[0.93]">
              Automatically.
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
            Jonno syncs your Strava, calculates your exact macros, and plans your meals with AI.{" "}
            <strong className="text-gray-800">Join 400+ athletes</strong> on the waitlist and be the first to train with it.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {features.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="bg-white border border-gray-200 shadow-sm rounded-full px-3.5 py-2 flex items-center gap-2 text-sm font-semibold text-gray-600"
              >
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </div>
            ))}
            <div className="bg-white border border-gray-200 shadow-sm rounded-full px-3.5 py-2 flex items-center gap-2 text-sm font-semibold text-gray-600">
              <span className="text-amber-500">🏅</span>
              Performance Macros
            </div>
          </div>

          {/* Feature cards */}
          {!success && (
            <div className="grid grid-cols-1 gap-3 max-w-lg">
              {[
                {
                  icon: Zap,
                  color: "text-orange-500",
                  bg: "bg-orange-50",
                  border: "border-orange-200",
                  title: "Strava-Powered Fueling",
                  desc: "Your macro targets adjust automatically based on your training load — runs, rides, swims.",
                },
                {
                  icon: Bot,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  border: "border-blue-200",
                  title: "AI Nutrition Agent",
                  desc: "Ask the Jonno Agent anything about your diet. It reasons across your training load and goals.",
                },
                {
                  icon: ShoppingBag,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  border: "border-emerald-200",
                  title: "Smart Meal Planning",
                  desc: "Get macro-matched meal plans built around foods you actually eat — and order in one tap.",
                },
              ].map(({ icon: Icon, color, bg, border, title, desc }) => (
                <div key={title} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
                  <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-0.5">{title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {["bg-blue-500","bg-orange-400","bg-emerald-500","bg-violet-500"].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-[10px] font-black`}>
                  {["A","J","M","R"][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <strong className="text-gray-800">400+ athletes</strong> already waiting
            </p>
          </div>
        </motion.div>

        {/* ── RIGHT: Form / Success ── */}
        <div className="w-full lg:w-[440px] lg:flex-shrink-0 lg:pt-16 lg:pb-16">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl p-7 flex flex-col gap-4 border border-gray-200 shadow-xl"
                >
                  <div>
                    <p className="text-xl font-black text-gray-900 mb-1">Claim your free beta spot</p>
                    <p className="text-sm text-gray-500">No credit card. No commitment. Cancel any time.</p>
                  </div>

                  {/* Error banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-600">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Full name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Alex Johnson"
                      value={form.full_name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="alex@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Phone <span className="normal-case text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 555 000 0000"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </div>

                  {/* Sport select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">What do you train for?</label>
                    <div className="relative">
                      <select
                        name="sport"
                        value={form.sport}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                      >
                        <option value="" disabled className="bg-white text-gray-400">Select your sport…</option>
                        {sports.map((s) => (
                          <option key={s} value={s} className="bg-white text-gray-900">{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="glow"
                    size="lg"
                    disabled={loading}
                    className="w-full h-14 text-base mt-1"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Joining…
                      </span>
                    ) : (
                      "Get Early Access →"
                    )}
                  </Button>

                  {/* Privacy */}
                  <p className="text-center text-xs text-gray-400 leading-relaxed">
                    By signing up you agree to our{" "}
                    <Link href="/privacy" className="text-gray-500 hover:text-gray-700 underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    . We&apos;ll never spam you.
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="flex flex-col gap-4"
              >
                {/* Success card */}
                <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 flex flex-col items-center text-center gap-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </motion.div>

                  <div>
                    <h2 className="text-2xl font-black gradient-text-light mb-2">You&apos;re on the list!</h2>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                      Hey {submittedName}! We&apos;ll send your beta credentials to{" "}
                      <span className="text-gray-800 font-semibold">{submittedEmail}</span> soon.
                      See you at the finish line. 🏅
                    </p>
                  </div>

                  <div className="w-full flex flex-col gap-2 text-left">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Confirmation sent to</p>
                        <p className="text-sm text-gray-800 font-semibold">{submittedEmail}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <Zap className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <p className="text-xs text-gray-500">Strava sync ready when you log in for the first time</p>
                    </div>
                  </div>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-500 hover:text-gray-800 hover:border-gray-300 shadow-sm transition-all duration-200"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? "Link copied!" : "Share with a training partner"}
                  </button>
                </div>

                {/* Survey CTA card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 flex flex-col gap-3 shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                      Win $200
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-snug">
                      Help us build it right.{" "}
                      <span className="text-amber-600">Win $200 in the process.</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                      Take our 3-minute athlete survey. One respondent wins a $200 gift card — we draw at launch.{" "}
                      <span className="font-semibold text-gray-700">Completely optional.</span>
                    </p>
                  </div>

                  <a
                    href="https://tally.so/r/SURVEY_ID_HERE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm tracking-wide text-center transition-colors duration-200 shadow-sm"
                  >
                    Take the 3-min survey →
                  </a>

                  <p className="text-center text-xs text-gray-400">
                    No account needed · Takes 3 minutes · Skip anytime
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 border-t border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2026 Jonno. Built for athletes who eat with intention.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
