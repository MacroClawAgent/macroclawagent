"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Bot, ShoppingBag } from "lucide-react";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const floatVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* Mini SVG ring for the macro widget */
function MiniRing({ pct, color, r = 18 }: { pct: number; color: string; r?: number }) {
  const circ = 2 * Math.PI * r;
  return (
    <svg width={r * 2 + 8} height={r * 2 + 8} className="-rotate-90">
      <circle cx={r + 4} cy={r + 4} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle
        cx={r + 4}
        cy={r + 4}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
      />
    </svg>
  );
}

export function Hero() {
  const [mascotError, setMascotError] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-mesh-hero pt-20 pb-16">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-900/12 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-900/10 blur-3xl pointer-events-none" />
      {/* Right-side glow behind mascot */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-indigo-600/6 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-0 items-center min-h-[70vh] lg:min-h-[80vh]">

          {/* ── LEFT: Content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8 items-center lg:items-start text-center lg:text-left"
          >
            {/* Pill badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass glow-border text-xs font-semibold text-indigo-300 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Powered by Claude AI · Strava · Uber Eats
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95]"
            >
              <span className="gradient-text">Fuel your training.</span>
              <br />
              <span className="text-slate-100">Eat like your goals are real.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-slate-400 leading-relaxed max-w-xl"
            >
              MacroClawAgent syncs your Strava data, calculates your exact macros, then
              builds your Uber Eats cart. Nutrition that actually moves with your training.
            </motion.p>


            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
            >
              <Button size="xl" variant="glow" asChild>
                <Link href="/login">
                  Start Free
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <a href="#how-it-works">
                  See how it works
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </Button>
            </motion.div>

            {/* Stat pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { value: "12,400+", label: "Athletes" },
                { value: "94%", label: "Macro accuracy" },
                { value: "3.2M", label: "Meals logged" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-full"
                >
                  <span className="text-sm font-black text-slate-100">{s.value}</span>
                  <span className="text-xs text-slate-500">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Mascot + floating widgets ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Mascot container */}
            <div className="relative w-full max-w-[420px] h-[280px] sm:h-[420px] md:h-[480px] flex items-center justify-center">
              {/* Glowing backdrop */}
              <div className="absolute inset-0 rounded-3xl bg-indigo-500/[0.04] border border-indigo-500/10" />
              <div className="absolute inset-8 rounded-3xl bg-gradient-to-b from-indigo-600/6 to-transparent blur-xl" />

              {/* Mascot image — graceful fallback when /public/mascot.png doesn't exist */}
              {!mascotError && (
                <Image
                  src="/mascot.png"
                  alt="MacroClawAgent mascot"
                  width={340}
                  height={400}
                  className="relative z-10 drop-shadow-2xl object-contain select-none"
                  onError={() => setMascotError(true)}
                  priority
                />
              )}

              {/* Mascot placeholder shown when image missing */}
              {mascotError && (
                <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center px-8">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                    <Bot className="w-12 h-12 text-indigo-400" />
                  </div>
                  <p className="text-slate-600 text-sm">Mascot coming soon</p>
                </div>
              )}

              {/* ── Floating widget: Macros ring (top-left) ── */}
              <motion.div
                variants={floatVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.9 }}
                className="hidden sm:block absolute -left-12 top-8 z-20 glass-card p-3.5 rounded-2xl shadow-2xl min-w-[170px]"
              >
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2.5">Today&apos;s Macros</p>
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <MiniRing pct={0.79} color="#f97316" r={14} />
                    <MiniRing pct={0.65} color="#10b981" r={14} />
                    <MiniRing pct={0.55} color="#f59e0b" r={14} />
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <p className="text-orange-400 font-medium">142g P</p>
                    <p className="text-emerald-400 font-medium">220g C</p>
                    <p className="text-amber-400 font-medium">62g F</p>
                  </div>
                </div>
              </motion.div>

              {/* ── Floating widget: AI chat (top-right) ── */}
              <motion.div
                variants={floatVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 1.05 }}
                className="hidden sm:block absolute -right-10 top-12 z-20 glass-card p-3.5 rounded-2xl shadow-2xl max-w-[200px]"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] font-semibold text-slate-400">Claw Agent</p>
                </div>
                <div className="bg-indigo-600/20 border border-indigo-500/20 rounded-xl p-2.5 text-[11px] text-indigo-200 leading-snug">
                  Protein is 34g short. Add grilled chicken to hit your target.
                </div>
              </motion.div>

              {/* ── Floating widget: Strava activity (bottom-right) ── */}
              <motion.div
                variants={floatVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 1.2 }}
                className="hidden sm:block absolute -right-8 bottom-16 z-20 glass-card p-3.5 rounded-2xl shadow-2xl min-w-[180px]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Image src="/strava.png" alt="Strava" width={14} height={14} className="object-contain" />
                  <p className="text-[10px] font-semibold text-slate-400">Last Activity</p>
                </div>
                <p className="text-xs font-bold text-slate-100">10.2km Morning Run</p>
                <p className="text-[11px] text-slate-500 mt-0.5">847 kcal · 54 min</p>
                <div className="flex gap-0.5 mt-2">
                  {[40, 55, 35, 70, 60, 80, 65, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-orange-500/60"
                      style={{ height: `${h * 0.28}px` }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* ── Floating widget: Cart ready (bottom-left) ── */}
              <motion.div
                variants={floatVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 1.35 }}
                className="hidden sm:block absolute -left-10 bottom-20 z-20 glass-card p-3.5 rounded-2xl shadow-2xl min-w-[160px]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <p className="text-[10px] font-semibold text-slate-400">Smart Cart</p>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">Macro-matched meal ready</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-emerald-400">42P · 38C · 18F</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#08090D] to-transparent pointer-events-none" />
    </section>
  );
}
