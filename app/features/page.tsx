"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Brain,
  ShoppingCart,
  BarChart3,
  Target,
  Zap,
  RefreshCcw,
  Heart,
  Flame,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const pillars = [
  {
    icon: <Activity className="w-7 h-7" />,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    tag: "Strava API",
    tagColor: "text-orange-400 bg-orange-500/10",
    title: "Activity Intelligence",
    desc: "Every run, ride, and lift auto-syncs from Strava. MacroClawAgent reads your training load and recalculates your TDEE in real time — so your calorie targets move with your performance, not against it.",
    bullets: [
      "Auto-sync via Strava OAuth",
      "Real-time TDEE recalculation",
      "Workout history & trends",
      "Training load detection",
    ],
  },
  {
    icon: <Brain className="w-7 h-7" />,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    tag: "Claude AI",
    tagColor: "text-indigo-400 bg-indigo-500/10",
    title: "AI Meal Planner",
    desc: "The Claw Agent — powered by Anthropic's Claude — builds a personalised meal plan around your macros, schedule, and food preferences. Ask it anything: meal swaps, restaurant picks, late-night options.",
    bullets: [
      "Unlimited AI meal planning chats",
      "Macro-optimised meal suggestions",
      "Context-aware food recommendations",
      "Adapts to your eating habits",
    ],
  },
  {
    icon: <ShoppingCart className="w-7 h-7" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    tag: "Uber Eats API",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    title: "Seamless Delivery",
    desc: "Stop manually searching for \"high protein options\". The Claw Agent scans nearby restaurants on Uber Eats, matches meals to your remaining macros, and builds your cart automatically. One click to order.",
    bullets: [
      "Macro-matched restaurant meals",
      "Auto Uber Eats cart builder",
      "One-click order placement",
      "Smart meal library",
    ],
  },
];

const features = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    title: "Macro Tracking",
    desc: "Log calories, protein, carbs, and fat with precision. Visual progress rings update in real time throughout the day.",
  },
  {
    icon: <Activity className="w-5 h-5" />,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    title: "Activity Rings",
    desc: "A glanceable summary of your daily targets: calories burned, protein hit, carbs consumed. Like Apple Watch, but for your plate.",
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Smart Cart",
    desc: "The AI builds an Uber Eats cart that fits your remaining macros. Never order the wrong thing again.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    title: "Goal Adaptation",
    desc: "Training for a marathon? Cutting for summer? Set a goal and watch your macro targets adapt automatically.",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    color: "text-red-400",
    bg: "bg-red-500/10",
    title: "Health Score",
    desc: "A daily composite score based on your hydration, macro accuracy, sleep, and training load.",
  },
  {
    icon: <RefreshCcw className="w-5 h-5" />,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    title: "Daily Coaching",
    desc: "Morning briefing from the Claw Agent: today's targets, recommended meals, and performance insights.",
  },
];

const integrations = [
  {
    name: "Strava",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    desc: "Full activity sync",
    status: "Connected",
    icon: "🏃",
  },
  {
    name: "Uber Eats",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    desc: "Auto cart builder",
    status: "Connected",
    icon: "🛵",
  },
  {
    name: "Apple Health",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    desc: "Health data sync",
    status: "Connected",
    icon: "❤️",
  },
  {
    name: "Whoop / Garmin",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    desc: "Coming soon",
    status: "Soon",
    icon: "⌚",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative py-24 md:py-36 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-900/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-900/10 blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
                Everything in one place
              </p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight gradient-text mb-6">
                Every tool a serious<br className="hidden md:block" /> athlete needs.
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                MacroClawAgent connects your training data, AI intelligence, and food delivery into one
                seamless nutrition engine. No spreadsheets. No guesswork.
              </p>
              <Button variant="glow" size="lg" asChild>
                <Link href="/login">
                  Start Free — no credit card
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* 3 Pillars */}
        <section className="py-20 bg-mesh-section">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                The trilogy
              </p>
              <h2 className="text-4xl font-black gradient-text">Three systems. One workflow.</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`glass-card p-8 border ${pillar.border} flex flex-col gap-5`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-2xl ${pillar.bg} ${pillar.color} flex items-center justify-center`}>
                      {pillar.icon}
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${pillar.tagColor}`}>
                      {pillar.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2">{pillar.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{pillar.desc}</p>
                  </div>
                  <ul className="space-y-2">
                    {pillar.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${pillar.color}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                Built-in tools
              </p>
              <h2 className="text-4xl font-black gradient-text">Everything included.</h2>
              <p className="text-lg text-slate-400 mt-4 max-w-xl mx-auto">
                No add-ons, no plugins. Every feature ships in the core product.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="glass-card p-6 flex gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 mb-1">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="py-20 bg-mesh-section">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                Integrations
              </p>
              <h2 className="text-4xl font-black gradient-text">Fits into your life.</h2>
              <p className="text-lg text-slate-400 mt-4 max-w-xl mx-auto">
                Works with the apps you already use. More integrations launching soon.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {integrations.map((int, i) => (
                <motion.div
                  key={int.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className={`glass-card p-6 flex flex-col items-center text-center gap-3 border ${int.border}`}
                >
                  <span className="text-3xl">{int.icon}</span>
                  <div>
                    <p className={`font-bold ${int.color}`}>{int.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{int.desc}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${int.bg} ${int.color}`}>
                    {int.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card glow-border p-12 flex flex-col items-center gap-6"
            >
              <span className="text-5xl">🦀</span>
              <h2 className="text-4xl font-black gradient-text">Ready to fuel smarter?</h2>
              <p className="text-lg text-slate-400 max-w-md">
                Create your free account and let the Claw Agent take over your nutrition in under 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="glow" size="lg" asChild>
                  <Link href="/login">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/pricing">See Pricing</Link>
                </Button>
              </div>
              <p className="text-xs text-slate-600">No credit card required · Cancel anytime</p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
