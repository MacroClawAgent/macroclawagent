"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, ShoppingBag, CheckCircle2, ChevronDown, AlertCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurveyModal } from "@/components/join/SurveyModal";

const sports = ["Running", "Cycling", "Gym / Strength", "Swimming", "Triathlon", "Other"];

const features = [
  { icon: Zap, label: "Strava Sync", color: "text-[#F29A69]" },
  { icon: Bot, label: "AI Macros", color: "text-[#69BDEB]" },
  { icon: ShoppingBag, label: "Smart Cart", color: "text-[#8FD3F4]" },
];

const inputClass =
  "w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all duration-200";

export default function JoinPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", sport: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Survey modal state
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

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
      // Auto-open the survey modal after the full-page celebration animation has settled
      setTimeout(() => setSurveyOpen(true), 2500);
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
    <div className="min-h-screen overflow-x-hidden relative" style={{ backgroundColor: "#FAF4EF" }}>
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px]" style={{ background: "radial-gradient(ellipse at center, rgba(143,211,244,0.25) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute top-0 left-0 w-80 h-80 rounded-full blur-[100px]" style={{ background: "radial-gradient(ellipse at center, rgba(242,154,105,0.20) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-56 h-56 rounded-full blur-[80px]" style={{ background: "radial-gradient(ellipse at center, rgba(239,217,204,0.50) 0%, transparent 70%)" }} />

      {/* ── Top nav ── */}
      <nav className="relative z-20 backdrop-blur-sm" style={{ borderBottom: "1px solid #CFC7C2", backgroundColor: "rgba(250,244,239,0.85)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: "rgba(242,154,105,0.12)", border: "1px solid rgba(242,154,105,0.30)" }}>
              <Image
                src="/logo.png"
                alt="Jonno"
                width={20}
                height={20}
                className="object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <span className="font-black text-base tracking-tight" style={{ color: "#4A454A" }}>Jonno</span>
          </Link>
          <Link href="/" className="text-sm transition-colors" style={{ color: "#7C7472" }}>
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* ── Page-level state swap: form view ↔ full-page success ── */}
      <AnimatePresence mode="wait">

        {!success ? (
          /* ── FORM VIEW: two-column layout ── */
          <motion.div
            key="form-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-0 lg:min-h-[calc(100vh-64px)] flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-20"
          >
            {/* LEFT: Hero */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="flex-1 flex flex-col gap-8 lg:pt-16 lg:pb-16 lg:sticky lg:top-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full w-fit text-white shadow-sm text-xs font-bold uppercase tracking-widest" style={{ background: "linear-gradient(135deg, #F29A69, #E88367)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                Beta Access — Limited Spots
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[0.93]">
                  <span className="gradient-text-light">Fuel your training.</span>
                </h1>
                <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[0.93]" style={{ color: "#4A454A" }}>
                  Automatically.
                </h1>
              </div>
              <p className="text-lg leading-relaxed max-w-lg" style={{ color: "#7C7472" }}>
                Jonno syncs your Strava, calculates your exact macros, and plans your meals with AI.{" "}
                <strong style={{ color: "#4A454A" }}>Join 400+ athletes</strong> on the waitlist.
              </p>
              <div className="flex flex-wrap gap-2">
                {features.map(({ icon: Icon, label, color }) => (
                  <div key={label} className="rounded-full px-3.5 py-2 flex items-center gap-2 text-sm font-semibold" style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 1px 4px rgba(74,69,74,0.06)", color: "#4A454A" }}>
                    <Icon className={`w-4 h-4 ${color}`} />
                    {label}
                  </div>
                ))}
                <div className="rounded-full px-3.5 py-2 flex items-center gap-2 text-sm font-semibold" style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 1px 4px rgba(74,69,74,0.06)", color: "#4A454A" }}>
                  <span>🏅</span>
                  Performance Macros
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 max-w-lg">
                {[
                  { icon: Zap, iconColor: "#F29A69", bg: "rgba(242,154,105,0.10)", border: "rgba(242,154,105,0.30)", title: "Strava-Powered Fueling", desc: "Your macro targets adjust automatically based on your training load — runs, rides, swims." },
                  { icon: Bot, iconColor: "#69BDEB", bg: "rgba(105,189,235,0.10)", border: "rgba(143,211,244,0.35)", title: "AI Nutrition Agent", desc: "Ask the Jonno Agent anything about your diet. It reasons across your training load and goals." },
                  { icon: ShoppingBag, iconColor: "#8FD3F4", bg: "rgba(143,211,244,0.10)", border: "rgba(143,211,244,0.35)", title: "Smart Meal Planning", desc: "Get macro-matched meal plans built around foods you actually eat — and order in one tap." },
                ].map(({ icon: Icon, iconColor, bg, border, title, desc }) => (
                  <div key={title} className="rounded-2xl p-4 flex items-start gap-3.5" style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 2px 8px rgba(74,69,74,0.05)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
                      <Icon className="w-4 h-4" style={{ color: iconColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold mb-0.5" style={{ color: "#4A454A" }}>{title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#7C7472" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {[["#F29A69","A"],["#69BDEB","J"],["#E88367","M"],["#8FD3F4","R"]].map(([bg, letter], i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: bg, borderColor: "#FAF4EF" }}>
                      {letter}
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: "#7C7472" }}><strong style={{ color: "#4A454A" }}>400+ athletes</strong> already waiting</p>
              </div>
            </motion.div>

            {/* RIGHT: Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full lg:w-[440px] lg:flex-shrink-0 lg:pt-16 lg:pb-16"
            >
              <form onSubmit={handleSubmit} className="rounded-2xl p-7 flex flex-col gap-4" style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 8px 40px rgba(74,69,74,0.10)" }}>
                <div>
                  <p className="text-xl font-black mb-1" style={{ color: "#4A454A" }}>Claim your free beta spot</p>
                  <p className="text-sm" style={{ color: "#7C7472" }}>No credit card. No commitment. Cancel any time.</p>
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(232,131,103,0.08)", border: "1px solid rgba(232,131,103,0.30)" }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#E88367" }} />
                      <p className="text-xs" style={{ color: "#C4693A" }}>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7C7472" }}>Full Name</label>
                  <input type="text" name="full_name" placeholder="Alex Johnson" value={form.full_name} onChange={handleChange} required autoComplete="name" className={inputClass} style={{ backgroundColor: "#FFFDFB", border: "1px solid #CFC7C2", color: "#4A454A" }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7C7472" }}>Email Address</label>
                  <input type="email" name="email" placeholder="alex@example.com" value={form.email} onChange={handleChange} required autoComplete="email" className={inputClass} style={{ backgroundColor: "#FFFDFB", border: "1px solid #CFC7C2", color: "#4A454A" }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7C7472" }}>
                    Phone <span className="normal-case font-normal" style={{ color: "#CFC7C2" }}>(optional)</span>
                  </label>
                  <input type="tel" name="phone" placeholder="+1 555 000 0000" value={form.phone} onChange={handleChange} autoComplete="tel" className={inputClass} style={{ backgroundColor: "#FFFDFB", border: "1px solid #CFC7C2", color: "#4A454A" }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7C7472" }}>What do you train for?</label>
                  <div className="relative">
                    <select name="sport" value={form.sport} onChange={handleChange} className={`${inputClass} appearance-none pr-10 cursor-pointer`} style={{ backgroundColor: "#FFFDFB", border: "1px solid #CFC7C2", color: "#4A454A" }}>
                      <option value="" disabled>Select your sport…</option>
                      {sports.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#7C7472" }} />
                  </div>
                </div>
                <Button type="submit" variant="glow" size="lg" disabled={loading} className="w-full h-14 text-base mt-1">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining…
                    </span>
                  ) : "Get Early Access →"}
                </Button>
                <p className="text-center text-xs leading-relaxed" style={{ color: "#7C7472" }}>
                  By signing up you agree to our{" "}
                  <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: "#7C7472" }}>Privacy Policy</Link>
                  . We&apos;ll never spam you.
                </p>
              </form>
            </motion.div>
          </motion.div>

        ) : (

          /* ── SUCCESS VIEW: full-page centered celebration ── */
          <motion.div
            key="success-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16"
          >
            <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center gap-8">

              {/* Animated check */}
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #F29A69, #E88367)", boxShadow: "0 8px 30px rgba(242,154,105,0.35)" }}>
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                {/* Ping ring */}
                <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: "#F29A69" }} />
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="flex flex-col gap-3"
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F29A69" }}>
                  You&apos;re in the building 🎉
                </p>
                <h1 className="text-4xl lg:text-5xl font-black leading-[1.05]" style={{ color: "#4A454A" }}>
                  {submittedName}, you&apos;re<br />
                  <span className="gradient-text-light">one of the first.</span>
                </h1>
                <p className="text-base leading-relaxed max-w-sm mx-auto" style={{ color: "#7C7472" }}>
                  You&apos;ve secured your spot on the Jonno waitlist. We&apos;re building fast — your beta invite lands at{" "}
                  <span className="font-semibold" style={{ color: "#4A454A" }}>{submittedEmail}</span> when we launch.
                </p>
              </motion.div>

              {/* Divider avatars */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex items-center gap-3"
              >
                <div className="flex -space-x-2">
                  {[["#F29A69","A"],["#69BDEB","J"],["#E88367","M"],["#8FD3F4","R"],["#EFD9CC","S"]].map(([bg, letter], i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-black" style={{ backgroundColor: bg, borderColor: "#FAF4EF", color: i === 4 ? "#4A454A" : "white" }}>
                      {letter}
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: "#7C7472" }}>+400 others already waiting</p>
              </motion.div>

              {/* Survey CTA — the main action on this page */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="w-full"
              >
                {surveyCompleted ? (
                  /* Survey done state */
                  <div className="flex flex-col gap-3 items-center">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl w-full justify-center" style={{ backgroundColor: "rgba(143,211,244,0.12)", border: "1px solid rgba(105,189,235,0.30)" }}>
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#69BDEB" }} />
                      <p className="text-sm font-bold" style={{ color: "#3A9EC4" }}>Survey done — you&apos;re entered in the $200 draw!</p>
                    </div>
                    <p className="text-xs" style={{ color: "#7C7472" }}>Thanks for helping shape Jonno. We&apos;ll announce the winner at launch.</p>
                  </div>
                ) : (
                  /* Survey not yet taken */
                  <div className="w-full rounded-2xl overflow-hidden" style={{ border: "1px solid #E8DDD8", boxShadow: "0 8px 32px rgba(242,154,105,0.15)" }}>
                    {/* Card top — warm gradient */}
                    <div className="px-6 pt-6 pb-7 flex flex-col gap-4 text-white" style={{ background: "linear-gradient(135deg, #F29A69 0%, #E88367 60%, #C8E7F5 100%)" }}>
                      <div className="flex items-center gap-2 w-fit">
                        <span className="text-xl">🏆</span>
                        <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,253,251,0.20)" }}>
                          Win $200
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-black leading-snug">
                          While you wait — help us build the right product.
                        </h3>
                        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "rgba(255,253,251,0.85)" }}>
                          Answer 7 quick questions. One respondent wins a $200 gift card, drawn at launch.{" "}
                          <span className="text-white font-semibold">Completely optional.</span>
                        </p>
                      </div>
                    </div>
                    {/* Card bottom — cream */}
                    <div className="px-6 py-5 flex flex-col gap-3" style={{ backgroundColor: "#FFFDFB" }}>
                      <button
                        type="button"
                        onClick={() => setSurveyOpen(true)}
                        className="w-full py-4 rounded-xl text-white font-black text-base tracking-wide transition-opacity duration-150 hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #F29A69, #E88367)", boxShadow: "0 4px 16px rgba(242,154,105,0.30)" }}
                      >
                        Take the survey →
                      </button>
                      <p className="text-center text-xs" style={{ color: "#7C7472" }}>
                        3 minutes · skip any question · no account needed
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Share */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 text-sm transition-colors duration-150" style={{ color: "#7C7472" }}
              >
                <Share2 className="w-4 h-4" />
                {copied ? "Link copied!" : "Share Jonno with a friend"}
              </motion.button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Survey modal — rendered at root so it overlays everything ── */}
      <SurveyModal
        isOpen={surveyOpen}
        onClose={() => setSurveyOpen(false)}
        onComplete={() => {
          setSurveyCompleted(true);
          setSurveyOpen(false);
        }}
        waitlistEmail={submittedEmail}
      />

      {/* ── Footer ── */}
      <div className="relative z-10 py-6" style={{ borderTop: "1px solid #CFC7C2" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "#7C7472" }}>© 2026 Jonno. Built for athletes who eat with intention.</p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "#7C7472" }}>
            <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</Link>
            <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms</Link>
            <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
