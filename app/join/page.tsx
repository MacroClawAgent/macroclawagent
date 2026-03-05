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
      <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/60 blur-[120px]" />
      <div className="pointer-events-none absolute top-0 left-0 w-72 h-72 rounded-full bg-orange-100/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/3 right-0 w-56 h-56 rounded-full bg-blue-50/80 blur-[80px]" />

      <div className="relative z-10 max-w-[440px] mx-auto px-5 pt-10 pb-16 flex flex-col gap-8">

        {/* ── Zone 1: Brand header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center gap-4"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Jonno"
                width={24}
                height={24}
                className="object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <span className="text-gray-900 font-black text-lg tracking-tight">Jonno</span>
          </div>

          {/* Beta badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Beta Access — Limited Spots</span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-4xl font-black tracking-tight leading-none mb-2">
              <span className="gradient-text-light">Fuel your training.</span>
            </h1>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-none">
              Automatically.
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Jonno syncs your Strava, calculates your exact macros, and plans your meals with AI.
            <strong className="text-gray-700"> Join 400+ athletes</strong> on the waitlist — be first in.
          </p>
        </motion.div>

        {/* ── Zone 2: Feature chips ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {features.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="bg-white border border-gray-200 shadow-sm rounded-full px-3.5 py-2 flex items-center gap-2 text-xs font-semibold text-gray-600"
            >
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              {label}
            </div>
          ))}
          <div className="bg-white border border-gray-200 shadow-sm rounded-full px-3.5 py-2 flex items-center gap-2 text-xs font-semibold text-gray-600">
            <span className="text-amber-500 text-xs">🏅</span>
            Performance Macros
          </div>
        </motion.div>

        {/* ── Zone 3: Form / Success ── */}
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <form
                onSubmit={handleSubmit}
                className="light-card p-6 flex flex-col gap-4 border border-gray-200 shadow-lg"
              >
                <div>
                  <p className="text-base font-black text-gray-900 mb-0.5">Claim your free beta spot</p>
                  <p className="text-xs text-gray-500">No credit card. No commitment. Cancel any time.</p>
                </div>

                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-300">{error}</p>
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
                    Phone <span className="normal-case text-slate-600">(optional)</span>
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
              <div className="light-card border border-gray-200 shadow-lg p-8 flex flex-col items-center text-center gap-5">
                {/* Check icon */}
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

                {/* Confirmation pills */}
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

                {/* Share */}
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
                {/* Prize badge */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                    Win $200
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-gray-900 leading-snug">
                    Help us build it right.
                    <br />
                    <span className="text-amber-600">Win $200 in the process.</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                    Take our 3-minute athlete survey. One respondent wins a $200 gift card — we draw at launch.
                    <span className="font-semibold text-gray-700"> Completely optional.</span>
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

        {/* ── Zone 4: 3 mini feature cards ── */}
        {!success && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="grid grid-cols-1 gap-3"
          >
            {[
              {
                icon: Zap,
                color: "text-orange-400",
                bg: "bg-orange-500/10",
                border: "border-orange-500/15",
                title: "Strava-Powered Fueling",
                desc: "Your macro targets adjust automatically based on your training load — runs, rides, swims.",
              },
              {
                icon: Bot,
                color: "text-indigo-400",
                bg: "bg-indigo-500/10",
                border: "border-indigo-500/15",
                title: "AI Nutrition Agent",
                desc: "Ask the Jonno Agent anything about your diet. It analyses your training load and gives evidence-based guidance.",
              },
              {
                icon: ShoppingBag,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/15",
                title: "Smart Meal Planning",
                desc: "Get personalised meal plans that match your macro goals — built around foods you actually eat.",
              },
            ].map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div key={title} className="light-card border border-gray-200 shadow-sm p-4 flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-0.5">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Zone 5: Minimal footer ── */}
        <div className="flex justify-center gap-4 text-xs text-gray-400">
          <span>© 2026 Jonno</span>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
        </div>

      </div>
    </div>
  );
}
