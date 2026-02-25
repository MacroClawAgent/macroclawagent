"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Zap, Target, TrendingUp } from "lucide-react";

const statPills = [
  { icon: <Zap className="w-3.5 h-3.5" />, text: "2,340 kcal tracked", color: "text-orange-400" },
  { icon: <Target className="w-3.5 h-3.5" />, text: "87g protein hit", color: "text-emerald-400" },
  { icon: <TrendingUp className="w-3.5 h-3.5" />, text: "5.2km logged", color: "text-indigo-400" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-mesh-hero pt-16">
      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-900/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-900/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8"
        >
          {/* Pill badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass glow-border text-xs font-medium text-indigo-300 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Powered by Claude AI · Strava · Uber Eats
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-balance"
          >
            <span className="gradient-text">Your AI Nutrition Coach.</span>
            <br />
            <span className="text-slate-100">Built for Athletes.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed"
          >
            MacroClawAgent syncs your Strava runs and orders the exact fuel you
            need. No more guessing what to eat after a hard session — the Claw
            handles it.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Button size="xl" variant="glow" asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button size="xl" variant="outline">
              <Play className="w-4 h-4 fill-current" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Floating stat pills */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-3 mt-2"
          >
            {statPills.map((pill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium"
              >
                <span className={pill.color}>{pill.icon}</span>
                <span className="text-slate-300">{pill.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard preview card */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-4xl mt-8 glass-card p-1 glow-border"
          >
            <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden bg-gradient-to-br from-[#0F111A] to-[#161925] flex items-center justify-center">
              {/* Fake dashboard preview */}
              <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4 opacity-60">
                <div className="glass-card col-span-1 flex flex-col items-center justify-center gap-2 p-4">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/40 border-t-indigo-400 animate-spin" style={{ animationDuration: "3s" }} />
                  <div className="h-2 w-16 rounded bg-white/10" />
                  <div className="h-2 w-10 rounded bg-white/5" />
                </div>
                <div className="glass-card col-span-2 p-4 flex flex-col gap-3">
                  {[0.7, 0.45, 0.85, 0.55].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full bg-white/10" style={{ width: `${w * 100}%` }} />
                  ))}
                </div>
              </div>
              <div className="relative z-10 text-center">
                <p className="text-slate-400 text-sm font-medium">Dashboard Preview</p>
                <p className="text-slate-600 text-xs mt-1">Sign in to see your data</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#08090D] to-transparent pointer-events-none" />
    </section>
  );
}
