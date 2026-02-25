"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { Brain, Database, Zap, Target, ArrowRight } from "lucide-react";

const values = [
  {
    icon: <Database className="w-6 h-6" />,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    title: "Data-Driven Recovery",
    desc: "Every macro recommendation is grounded in your actual training load. No generic advice. No one-size-fits-all targets. Your numbers, your plan.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    title: "AI-First Coaching",
    desc: "The Claw Agent isn't a calculator with a chat interface. It reasons across your training history, food preferences, and goals to give context-aware recommendations.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Athlete-Obsessed Design",
    desc: "Every screen is built for athletes who are moving fast, not sitting at a desk. Glanceable, dark, fast. No bloat. No wellness-speak.",
  },
];

const stack = [
  {
    name: "Anthropic Claude",
    role: "The AI brain",
    desc: "Claude API powers the Claw Agent — reasoning across your nutrition data, activity history, and food preferences to generate genuinely useful advice.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    icon: "🤖",
  },
  {
    name: "Strava API",
    role: "Activity intelligence",
    desc: "Real-time OAuth sync pulls your workouts, calculates TDEE, and feeds that data directly to the AI. Your nutrition targets move every time you move.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: "🏃",
  },
  {
    name: "Uber Direct API",
    role: "Seamless delivery",
    desc: "The Uber Eats integration means the Claw Agent doesn't just tell you what to eat — it builds the cart, surfaces macro-matched options from restaurants near you, and removes the friction.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "🛵",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative py-24 md:py-36 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-indigo-900/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-900/10 blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
                Our story
              </p>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight gradient-text mb-6">
                We built the nutrition tool<br className="hidden md:block" /> we always wanted.
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                As athletes ourselves, we trained with precision — Strava data, heart rate zones,
                interval splits. But when it came to eating? We were still guessing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="py-16 bg-mesh-section">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                  <span className="text-lg">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">The problem we lived</h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Athletes are the most data-rich humans alive. GPS routes, power outputs, heart rate curves,
                  VO2 estimates. But every nutrition app treats everyone the same — static calorie targets
                  regardless of what you did that day.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  We'd do a 4-hour ride and still see the same 2,000 kcal target. Then someone suggests
                  "grilled chicken and veg" for the third time. And actually ordering the right food? That's
                  a 30-minute research task every evening.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <span className="text-lg">🦀</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">The loop we closed</h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  MacroClawAgent pulls your Strava data, runs the TDEE math in real time, and hands it to
                  an AI that actually understands context. The Claw Agent knows you did a hard interval session
                  this morning and needs fast carbs tonight — and can find them for you on Uber Eats.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Your training data finally tells your kitchen what to do. The guesswork is gone.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                How we work
              </p>
              <h2 className="text-4xl font-black gradient-text">What we believe in.</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass-card p-8 flex flex-col gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl ${v.bg} ${v.color} flex items-center justify-center`}>
                    {v.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{v.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Built on */}
        <section className="py-20 bg-mesh-section">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                Technology
              </p>
              <h2 className="text-4xl font-black gradient-text">Built on the best APIs.</h2>
              <p className="text-lg text-slate-400 mt-4 max-w-xl mx-auto">
                We didn't build a new AI. We orchestrated the world's best tools into one athlete-first workflow.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {stack.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                  className={`glass-card p-8 border ${s.border} flex flex-col gap-4`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{s.icon}</span>
                    <div>
                      <p className={`font-bold ${s.color}`}>{s.name}</p>
                      <p className="text-xs text-slate-500">{s.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission statement */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card glow-border p-12 text-center flex flex-col items-center gap-6"
            >
              <span className="text-5xl">🦀</span>
              <h2 className="text-4xl font-black gradient-text">The mission</h2>
              <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
                "Nutrition should be as data-driven as your training. We're building the infrastructure
                that makes that true — one athlete at a time."
              </p>
              <div className="h-px w-16 bg-indigo-500/40" />
              <p className="text-sm text-slate-500">MacroClawAgent, 2026</p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-slate-400 text-lg mb-6">
                Join the athletes already training smarter.
              </p>
              <Button variant="glow" size="lg" asChild>
                <Link href="/login">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
