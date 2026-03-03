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
  "w-full px-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.09] text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all duration-200";

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
      await navigator.share({ title: "MacroClaw Beta", text: "Join me on MacroClaw — AI nutrition for athletes!", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] overflow-x-hidden relative">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-900/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/3 left-0 w-56 h-56 rounded-full bg-orange-900/15 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-violet-900/10 blur-[80px]" />

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
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="MacroClaw"
                width={24}
                height={24}
                className="object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <span className="text-slate-100 font-black text-lg tracking-tight">MacroClaw</span>
          </div>

          {/* Beta badge */}
          <div className="glass glow-border rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Beta Access — Limited Spots</span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-4xl font-black tracking-tight leading-none mb-1">
              <span className="gradient-text">Train smarter.</span>
            </h1>
            <h1 className="text-4xl font-black tracking-tight text-slate-100 leading-none">
              Eat with precision.
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            MacroClaw syncs your Strava activities, calculates your exact macro targets, and plans your meals — all with AI.
            Join the beta and be the first to train with it.
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
              className="glass rounded-full px-3.5 py-2 flex items-center gap-2 text-xs font-semibold text-slate-300"
            >
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              {label}
            </div>
          ))}
          <div className="glass rounded-full px-3.5 py-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="text-amber-400 text-xs">🏅</span>
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
                className="glass-card glow-border p-6 flex flex-col gap-4"
              >
                <div>
                  <p className="text-base font-black text-slate-100 mb-0.5">Claim your free beta spot</p>
                  <p className="text-xs text-slate-500">No credit card. No commitment. Cancel any time.</p>
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
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
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
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</label>
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
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
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
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What do you train for?</label>
                  <div className="relative">
                    <select
                      name="sport"
                      value={form.sport}
                      onChange={handleChange}
                      className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                    >
                      <option value="" disabled className="bg-[#0F111A] text-slate-400">Select your sport…</option>
                      {sports.map((s) => (
                        <option key={s} value={s} className="bg-[#0F111A] text-slate-100">{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
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
                <p className="text-center text-xs text-slate-700 leading-relaxed">
                  By signing up you agree to our{" "}
                  <Link href="/privacy" className="text-slate-500 hover:text-slate-400 underline underline-offset-2">
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
              className="glass-card glow-border p-8 flex flex-col items-center text-center gap-5"
            >
              {/* Check icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-black gradient-text mb-2">You&apos;re on the list!</h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  Hey {submittedName}! We&apos;ll send your beta credentials to{" "}
                  <span className="text-slate-300 font-semibold">{submittedEmail}</span> soon.
                  See you at the finish line. 🏅
                </p>
              </div>

              {/* Confirmation pills */}
              <div className="w-full flex flex-col gap-2 text-left">
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-slate-200 font-semibold">{submittedEmail}</p>
                  </div>
                </div>
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <p className="text-xs text-slate-400">Strava sync ready when you log in for the first time</p>
                </div>
              </div>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all duration-200"
              >
                <Share2 className="w-4 h-4" />
                {copied ? "Link copied!" : "Share with a training partner"}
              </button>
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
                desc: "Ask anything about your diet. The Claw analyses your day and gives evidence-based guidance.",
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
              <div key={title} className="glass-card p-4 flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100 mb-0.5">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Zone 5: Minimal footer ── */}
        <div className="flex justify-center gap-4 text-xs text-slate-700">
          <span>© 2026 MacroClaw</span>
          <span>·</span>
          <Link href="/privacy" className="hover:text-slate-500 transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/" className="hover:text-slate-500 transition-colors">Home</Link>
        </div>

      </div>
    </div>
  );
}
