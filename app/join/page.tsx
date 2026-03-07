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
  { icon: Zap, label: "Strava Sync", color: "text-[#20C7B7]" },
  { icon: Bot, label: "AI Macros", color: "text-[#4C7DFF]" },
  { icon: ShoppingBag, label: "Smart Cart", color: "text-[#4C7DFF]" },
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
    <div className="min-h-screen overflow-x-hidden relative" style={{ backgroundColor: "#F4F5F7" }}>
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px]" style={{ background: "radial-gradient(ellipse at center, rgba(76,125,255,0.12) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute top-0 left-0 w-80 h-80 rounded-full blur-[100px]" style={{ background: "radial-gradient(ellipse at center, rgba(32,199,183,0.14) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-56 h-56 rounded-full blur-[80px]" style={{ background: "radial-gradient(ellipse at center, rgba(32,199,183,0.10) 0%, transparent 70%)" }} />

      {/* ── Top nav ── */}
      <nav className="relative z-20 backdrop-blur-sm" style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "rgba(255,255,255,0.92)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: "rgba(32,199,183,0.12)", border: "1px solid rgba(32,199,183,0.30)" }}>
              <Image
                src="/logo.png"
                alt="Jonno"
                width={20}
                height={20}
                className="object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <span className="font-black text-base tracking-tight" style={{ color: "#1C1C1E" }}>Jonno</span>
          </Link>
          <Link href="/" className="text-sm transition-colors" style={{ color: "#6B7280" }}>
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
              {/* Urgency badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full w-fit text-white shadow-sm text-xs font-bold uppercase tracking-widest" style={{ background: "linear-gradient(135deg, #20C7B7, #4C7DFF)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                Beta Access · Limited Spots
              </div>

              {/* Headline */}
              <div className="flex flex-col gap-1">
                <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[0.93]">
                  <span style={{ color: "#20C7B7" }}>Fuel your training.</span>
                </h1>
                <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[0.93]" style={{ color: "#1C1C1E" }}>
                  Automatically.
                </h1>
              </div>

              {/* Subheadline */}
              <p className="text-lg leading-relaxed max-w-md" style={{ color: "#6B7280" }}>
                AI nutrition that adapts to your training. Sync Strava, get exact macros, and order the right meals in seconds.
              </p>

              {/* 3 clean bullets */}
              <div className="flex flex-col gap-3 max-w-md">
                {[
                  { icon: Zap, color: "#20C7B7", bg: "rgba(32,199,183,0.10)", text: "Macros that adjust after every run, ride, or swim" },
                  { icon: Bot, color: "#4C7DFF", bg: "rgba(76,125,255,0.10)", text: "AI coach that answers real nutrition questions" },
                  { icon: ShoppingBag, color: "#22C55E", bg: "rgba(34,197,94,0.10)", text: "Order macro-matched meals from Uber Eats in one tap" },
                ].map(({ icon: Icon, color, bg, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#1C1C1E" }}>{text}</p>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex -space-x-2">
                  {[["#20C7B7","A"],["#4C7DFF","J"],["#4C7DFF","M"],["#22C55E","R"]].map(([bg, letter], i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: bg, borderColor: "#F4F5F7" }}>
                      {letter}
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: "#6B7280" }}><strong style={{ color: "#1C1C1E" }}>400+ athletes</strong> already on the list</p>
              </div>
            </motion.div>

            {/* RIGHT: Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full lg:w-[440px] lg:flex-shrink-0 lg:pt-16 lg:pb-16"
            >
              <form onSubmit={handleSubmit} className="rounded-2xl p-7 flex flex-col gap-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                <div>
                  <p className="text-xl font-black mb-1" style={{ color: "#1C1C1E" }}>Claim your free beta spot</p>
                  <p className="text-sm" style={{ color: "#6B7280" }}>No credit card. No commitment. Free during beta.</p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(76,125,255,0.08)", border: "1px solid rgba(76,125,255,0.30)" }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#4C7DFF" }} />
                      <p className="text-xs" style={{ color: "#4C7DFF" }}>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6B7280" }}>First Name</label>
                  <input type="text" name="full_name" placeholder="Alex" value={form.full_name} onChange={handleChange} required autoComplete="given-name" className={inputClass} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#1C1C1E" }} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6B7280" }}>Email Address</label>
                  <input type="email" name="email" placeholder="alex@example.com" value={form.email} onChange={handleChange} required autoComplete="email" className={inputClass} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#1C1C1E" }} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6B7280" }}>
                    What do you train for? <span className="normal-case font-normal" style={{ color: "#9CA3AF" }}>(optional)</span>
                  </label>
                  <div className="relative">
                    <select name="sport" value={form.sport} onChange={handleChange} className={`${inputClass} appearance-none pr-10 cursor-pointer`} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: form.sport ? "#1C1C1E" : "#9CA3AF" }}>
                      <option value="">Select your sport</option>
                      {sports.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#6B7280" }} />
                  </div>
                </div>

                {/* Urgency */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(32,199,183,0.06)", border: "1px solid rgba(32,199,183,0.18)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#22C55E" }} />
                  <p className="text-xs font-medium" style={{ color: "#1BA89A" }}>47 beta spots left this week</p>
                </div>

                <Button type="submit" variant="glow" size="lg" disabled={loading} className="w-full h-14 text-base">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining…
                    </span>
                  ) : "Get Early Access →"}
                </Button>

                <p className="text-center text-xs leading-relaxed" style={{ color: "#9CA3AF" }}>
                  By signing up you agree to our{" "}
                  <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: "#9CA3AF" }}>Privacy Policy</Link>
                  . We will never spam you.
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
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #20C7B7, #4C7DFF)", boxShadow: "0 8px 30px rgba(32,199,183,0.35)" }}>
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                {/* Ping ring */}
                <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: "#20C7B7" }} />
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="flex flex-col gap-3"
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#20C7B7" }}>
                  Spot secured
                </p>
                <h1 className="text-4xl lg:text-5xl font-black leading-[1.05]" style={{ color: "#1C1C1E" }}>
                  {submittedName ? `${submittedName}, you're in.` : "You're in."}<br />
                  <span style={{ color: "#20C7B7" }}>Welcome to Jonno.</span>
                </h1>
                <p className="text-base leading-relaxed max-w-sm mx-auto" style={{ color: "#6B7280" }}>
                  Your beta invite goes to{" "}
                  <span className="font-semibold" style={{ color: "#1C1C1E" }}>{submittedEmail}</span>
                  {" "}when we launch. We will keep you posted.
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
                  {[["#20C7B7","A"],["#4C7DFF","J"],["#4C7DFF","M"],["#22C55E","R"],["#E5E7EB","S"]].map(([bg, letter], i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-black" style={{ backgroundColor: bg, borderColor: "#F4F5F7", color: i === 4 ? "#1C1C1E" : "white" }}>
                      {letter}
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: "#6B7280" }}>+400 others already waiting</p>
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
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#4C7DFF" }} />
                      <p className="text-sm font-bold" style={{ color: "#4C7DFF" }}>Survey submitted. You&apos;re entered in the $200 draw.</p>
                    </div>
                    <p className="text-xs" style={{ color: "#6B7280" }}>Thanks for helping shape Jonno. We&apos;ll announce the winner at launch.</p>
                  </div>
                ) : (
                  /* Survey not yet taken */
                  <div className="w-full rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB", boxShadow: "0 8px 32px rgba(32,199,183,0.15)" }}>
                    {/* Card top — warm gradient */}
                    <div className="px-6 pt-6 pb-7 flex flex-col gap-4 text-white" style={{ background: "linear-gradient(135deg, #20C7B7 0%, #4C7DFF 60%, #C8E7F5 100%)" }}>
                      <div className="flex items-center gap-2 w-fit">
                        <span className="text-xl">🏆</span>
                        <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,253,251,0.20)" }}>
                          Win $200
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-black leading-snug">
                          Help us build the right product for you.
                        </h3>
                        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "rgba(255,253,251,0.85)" }}>
                          Answer 7 quick questions. One respondent wins a $200 gift card, drawn at launch.{" "}
                          <span className="text-white font-semibold">Completely optional.</span>
                        </p>
                      </div>
                    </div>
                    {/* Card bottom — cream */}
                    <div className="px-6 py-5 flex flex-col gap-3" style={{ backgroundColor: "#FFFFFF" }}>
                      <button
                        type="button"
                        onClick={() => setSurveyOpen(true)}
                        className="w-full py-4 rounded-xl text-white font-black text-base tracking-wide transition-opacity duration-150 hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #20C7B7, #4C7DFF)", boxShadow: "0 4px 16px rgba(32,199,183,0.30)" }}
                      >
                        Take the survey →
                      </button>
                      <p className="text-center text-xs" style={{ color: "#6B7280" }}>
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
                className="flex items-center gap-2 text-sm transition-colors duration-150" style={{ color: "#6B7280" }}
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
      <div className="relative z-10 py-6" style={{ borderTop: "1px solid #E5E7EB" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "#6B7280" }}>© 2026 Jonno. Built for athletes who eat with intention.</p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "#6B7280" }}>
            <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</Link>
            <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms</Link>
            <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
