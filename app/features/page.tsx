"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  ShoppingCart,
  BarChart3,
  Target,
  RefreshCcw,
  Heart,
  ArrowRight,
  CheckCircle2,
  Bot,
  ShoppingBag,
  Watch,
  Zap,
  Timer,
  Utensils,
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

/* ── Strava Mockup ── */
function StravaCard() {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-5" style={{ border: "1px solid #E5E7EB" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: "#20C7B7" }} />
          <p className="text-base font-bold" style={{ color: "#1C1C1E" }}>Strava Sync</p>
        </div>
        <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "#4C7DFF" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: "#4C7DFF" }} />
          Live in beta
        </span>
      </div>
      <div>
        <p className="text-[11px] mb-1" style={{ color: "#6B7280" }}>Last synced 2 min ago</p>
        <p className="text-lg font-bold" style={{ color: "#1C1C1E" }}>Morning Run</p>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>12.4km · 58 min · intensity score 7/10</p>
      </div>
      <div className="flex items-end gap-1 h-10">
        {[45, 60, 40, 75, 65, 85, 55, 70, 80, 50, 65, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{ height: `${h}%`, backgroundColor: "rgba(32,199,183,0.45)" }}
          />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "rgba(76,125,255,0.07)", border: "1px solid rgba(76,125,255,0.20)" }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#4C7DFF" }} />
          <p className="text-[11px] font-semibold" style={{ color: "#4C7DFF" }}>Daily target adjusted: 2,840 kcal</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "rgba(32,199,183,0.07)", border: "1px solid rgba(32,199,183,0.20)" }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#20C7B7" }} />
          <p className="text-[11px] font-semibold" style={{ color: "#1BA89A" }}>Protein target: 160g (intensity bump applied)</p>
        </div>
      </div>
    </div>
  );
}

/* ── AI Coach Mockup ── */
function AgentCard() {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-4" style={{ border: "1px solid #E5E7EB" }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(76,125,255,0.10)", border: "1px solid rgba(76,125,255,0.20)" }}>
          <Bot className="w-4 h-4" style={{ color: "#4C7DFF" }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "#1C1C1E" }}>Jonno Agent</p>
          <p className="text-[10px] flex items-center gap-1" style={{ color: "#4C7DFF" }}>
            <span className="w-1 h-1 rounded-full animate-pulse inline-block" style={{ backgroundColor: "#4C7DFF" }} />
            Online
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] max-w-[85%]" style={{ backgroundColor: "#F4F5F7", border: "1px solid #E5E7EB", color: "#1C1C1E" }}>
            I did a hard 12km run. What should I eat for recovery?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] leading-snug max-w-[90%]" style={{ backgroundColor: "rgba(76,125,255,0.08)", border: "1px solid rgba(76,125,255,0.25)", color: "#1C1C1E" }}>
            Based on your 924 kcal burn at intensity 7, aim for 55g protein and 90g carbs within 45 minutes. Your best nearby match:
          </div>
        </div>
        <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: "#F4F5F7", border: "1px solid #E5E7EB" }}>
          <div>
            <p className="text-[11px] font-semibold" style={{ color: "#1C1C1E" }}>Grilled Salmon Bowl</p>
            <p className="text-[10px]" style={{ color: "#6B7280" }}>52P · 82C · 18F</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: "rgba(32,199,183,0.10)", color: "#1BA89A", border: "1px solid rgba(32,199,183,0.20)" }}>
            View
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Meal Plan Mockup ── */
function MealCard() {
  const meals = [
    { name: "Protein Oats", tag: "Breakfast", macros: "38P · 62C · 14F", kcal: "524" },
    { name: "Grilled Chicken Wrap", tag: "Lunch", macros: "42P · 55C · 12F", kcal: "500" },
    { name: "Salmon Rice Bowl", tag: "Dinner", macros: "45P · 72C · 18F", kcal: "638" },
  ];
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-4" style={{ border: "1px solid #E5E7EB" }}>
      <div className="flex items-center justify-between">
        <p className="text-base font-bold" style={{ color: "#1C1C1E" }}>Today&apos;s meal plan</p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(76,125,255,0.08)", color: "#4C7DFF", border: "1px solid rgba(76,125,255,0.20)" }}>
          AI generated
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {meals.map((m) => (
          <div key={m.name} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#F4F5F7", border: "1px solid #E5E7EB" }}>
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "#1C1C1E" }}>{m.name}</p>
              <p className="text-[10px]" style={{ color: "#6B7280" }}>{m.tag} · {m.macros}</p>
            </div>
            <span className="text-[11px] font-bold flex-shrink-0" style={{ color: "#6B7280" }}>{m.kcal} kcal</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: "rgba(32,199,183,0.06)", border: "1px solid rgba(32,199,183,0.20)" }}>
        <p className="text-[11px] font-semibold" style={{ color: "#1BA89A" }}>Total: 1,662 kcal</p>
        <p className="text-[11px]" style={{ color: "#6B7280" }}>178P · 189C · 44F</p>
      </div>
    </div>
  );
}

/* ── Data ── */
const workflowSteps = [
  {
    n: "01",
    icon: <Activity className="w-5 h-5" />,
    title: "Run synced",
    detail: "You finish a 12km run. Strava sends the activity to Jonno automatically via OAuth.",
    iconBg: "rgba(32,199,183,0.12)",
    iconColor: "#20C7B7",
  },
  {
    n: "02",
    icon: <Zap className="w-5 h-5" />,
    title: "Targets updated",
    detail: "Jonno recalculates your daily calories and macros based on session type, distance, and intensity score.",
    iconBg: "rgba(76,125,255,0.12)",
    iconColor: "#4C7DFF",
  },
  {
    n: "03",
    icon: <Utensils className="w-5 h-5" />,
    title: "Meals matched",
    detail: "The AI agent builds a meal plan that hits your adjusted protein, carb, and calorie targets for the day.",
    iconBg: "rgba(32,199,183,0.12)",
    iconColor: "#20C7B7",
  },
  {
    n: "04",
    icon: <ShoppingCart className="w-5 h-5" />,
    title: "Cart built",
    detail: "Nearby Uber Eats options are filtered by your remaining macros. Cart integration rolling out to beta users.",
    iconBg: "rgba(76,125,255,0.12)",
    iconColor: "#4C7DFF",
  },
];

const pillars = [
  {
    tag: "Strava sync",
    tagBg: "rgba(32,199,183,0.10)",
    tagColor: "#1BA89A",
    tagBorder: "rgba(32,199,183,0.25)",
    status: "Live in beta",
    statusColor: "#20C7B7",
    heading: "Your training load, read automatically.",
    desc: "Every run, ride, and workout syncs from Strava via OAuth. Jonno extracts your session type, duration, and intensity to calculate how many calories you actually burned, then updates your daily targets before you open the app.",
    bullets: [
      "One-time Strava connect via OAuth",
      "Intensity-based calorie adjustment per session",
      "Load trend tracking across the week",
      "Targets recalculated before you check the app",
    ],
    checkColor: "#20C7B7",
    mockupRight: true,
    Mockup: StravaCard,
  },
  {
    tag: "AI coaching",
    tagBg: "rgba(76,125,255,0.10)",
    tagColor: "#4C7DFF",
    tagBorder: "rgba(76,125,255,0.25)",
    status: "Live in beta",
    statusColor: "#4C7DFF",
    heading: "An AI coach that explains the why.",
    desc: "The Jonno Agent is powered by Claude (Anthropic). It builds a daily meal plan around your recalculated macros and answers nutrition questions in the context of your actual training load, not generic advice.",
    bullets: [
      "Daily meal plan built around your adjusted targets",
      "Explains recommendations based on your training",
      "Ask about meal swaps, timing, and recovery foods",
      "Adapts suggestions to your diet preferences",
    ],
    checkColor: "#4C7DFF",
    mockupRight: false,
    Mockup: AgentCard,
  },
  {
    tag: "Meal ordering",
    tagBg: "rgba(32,199,183,0.10)",
    tagColor: "#1BA89A",
    tagBorder: "rgba(32,199,183,0.25)",
    status: "Rolling out",
    statusColor: "#F59E0B",
    heading: "Meals matched to your macros. Not just calories.",
    desc: "Instead of searching for high protein options and guessing, Jonno shows you nearby Uber Eats options filtered by your remaining protein, carbs, and fat for the day. Cart integration is rolling out to beta users now.",
    bullets: [
      "Restaurant meals filtered by remaining daily macros",
      "Suggestions ranked by macro match accuracy",
      "Uber Eats cart builder in beta rollout",
      "Grocery list generation for home cooking",
    ],
    checkColor: "#20C7B7",
    mockupRight: true,
    Mockup: MealCard,
  },
];

const features = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    iconBg: "rgba(76,125,255,0.10)",
    iconColor: "#4C7DFF",
    title: "Daily macro targets",
    desc: "Protein, carbs, fat, and calories calculated from your body stats and goal. Adjusts up or down based on what Strava recorded that day.",
  },
  {
    icon: <Activity className="w-5 h-5" />,
    iconBg: "rgba(32,199,183,0.10)",
    iconColor: "#20C7B7",
    title: "Intensity-aware adjustment",
    desc: "A hard tempo run and an easy jog get different targets. Jonno reads session intensity, not just distance, so the calorie bump actually matches your effort.",
  },
  {
    icon: <Bot className="w-5 h-5" />,
    iconBg: "rgba(76,125,255,0.10)",
    iconColor: "#4C7DFF",
    title: "AI meal planning",
    desc: "Claude builds a full day of meals (breakfast, lunch, dinner, snacks) that hits your targets, accounting for your diet preferences and any allergies.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    iconBg: "rgba(32,199,183,0.10)",
    iconColor: "#20C7B7",
    title: "Goal-based macro ratios",
    desc: "Set your goal: performance, lean building, or fat loss. Macro ratios shift accordingly, and the AI explains the reasoning behind each target it sets.",
  },
  {
    icon: <Timer className="w-5 h-5" />,
    iconBg: "rgba(76,125,255,0.10)",
    iconColor: "#4C7DFF",
    title: "Pre and post-workout timing",
    desc: "On training days, Jonno gives you pre-workout carb targets and a post-workout protein window with timing, not just a daily total to hit.",
  },
  {
    icon: <RefreshCcw className="w-5 h-5" />,
    iconBg: "rgba(32,199,183,0.10)",
    iconColor: "#20C7B7",
    title: "Weekly load trend",
    desc: "Tracks whether your training load is increasing, stable, or tapering across the week, and adjusts your nutrition strategy to match.",
  },
];

const integrations = [
  {
    name: "Strava",
    desc: "Full activity sync",
    status: "Live",
    statusColor: "#20C7B7",
    iconBg: "rgba(32,199,183,0.10)",
    iconBorder: "rgba(32,199,183,0.20)",
    icon: <Activity className="w-6 h-6" style={{ color: "#20C7B7" }} />,
  },
  {
    name: "Uber Eats",
    desc: "Meal matching",
    status: "Rolling out",
    statusColor: "#F59E0B",
    iconBg: "rgba(107,114,128,0.08)",
    iconBorder: "rgba(107,114,128,0.15)",
    icon: <ShoppingBag className="w-6 h-6" style={{ color: "#9CA3AF" }} />,
  },
  {
    name: "Apple Health",
    desc: "Health data",
    status: "In development",
    statusColor: "#F59E0B",
    iconBg: "rgba(107,114,128,0.08)",
    iconBorder: "rgba(107,114,128,0.15)",
    icon: <Heart className="w-6 h-6" style={{ color: "#9CA3AF" }} />,
  },
  {
    name: "Whoop / Garmin",
    desc: "Recovery data",
    status: "Planned",
    statusColor: "#9CA3AF",
    iconBg: "rgba(156,163,175,0.08)",
    iconBorder: "rgba(156,163,175,0.15)",
    icon: <Watch className="w-6 h-6" style={{ color: "#9CA3AF" }} />,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />
      <main className="pt-16">

        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(32,199,183,0.08) 0%, transparent 70%)" }} />
          <div className="max-w-4xl mx-auto px-6 relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-7"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border" style={{ backgroundColor: "rgba(76,125,255,0.08)", borderColor: "rgba(76,125,255,0.25)", color: "#4C7DFF" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#4C7DFF" }} />
                Currently in beta
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.92]" style={{ color: "#1C1C1E" }}>
                How Jonno works,{" "}
                <span style={{ color: "#20C7B7" }}>feature by feature.</span>
              </h1>
              <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "#6B7280" }}>
                Strava sync is live. AI coaching is live. Uber Eats cart integration is rolling out. Here is exactly what the app does and how each piece connects.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#4C7DFF", color: "#FFFFFF" }}
              >
                Join the Beta
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { label: "Strava sync live", dot: "#20C7B7" },
                  { label: "AI coaching live", dot: "#4C7DFF" },
                  { label: "Uber Eats rolling out", dot: "#F59E0B" },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.dot }} />
                    <span className="text-xs font-medium" style={{ color: "#6B7280" }}>{p.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Workflow strip */}
        <section className="py-12" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#20C7B7" }}>The flow</p>
              <h2 className="text-2xl md:text-3xl font-black" style={{ color: "#1C1C1E" }}>From run to recovery meal in four steps.</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-5 flex flex-col gap-3"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: step.iconBg, color: step.iconColor }}
                    >
                      {step.icon}
                    </div>
                    <span className="text-xs font-black" style={{ color: "#E5E7EB" }}>{step.n}</span>
                  </div>
                  <p className="font-bold text-sm" style={{ color: "#1C1C1E" }}>{step.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>{step.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Core feature pillars */}
        {pillars.map((pillar, i) => (
          <section key={pillar.tag} className="py-14" style={i % 2 !== 0 ? { backgroundColor: "#F4F5F7" } : {}}>
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: pillar.mockupRight ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col gap-6 ${!pillar.mockupRight ? "lg:order-last" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border self-start"
                      style={{ backgroundColor: pillar.tagBg, color: pillar.tagColor, borderColor: pillar.tagBorder }}
                    >
                      {pillar.tag}
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: pillar.statusColor }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pillar.statusColor }} />
                      {pillar.status}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight" style={{ color: "#1C1C1E" }}>
                    {pillar.heading}
                  </h2>
                  <p className="leading-relaxed" style={{ color: "#6B7280" }}>{pillar.desc}</p>
                  <ul className="space-y-3">
                    {pillar.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: "#6B7280" }}>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: pillar.checkColor }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: pillar.mockupRight ? 24 : -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={!pillar.mockupRight ? "lg:order-first" : ""}
                >
                  <pillar.Mockup />
                </motion.div>
              </div>
            </div>
          </section>
        ))}

        {/* Feature grid */}
        <section className="py-14" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>Under the hood</p>
              <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1C1C1E" }}>
                What makes the targets{" "}
                <span style={{ color: "#20C7B7" }}>accurate.</span>
              </h2>
              <p className="text-base mt-4 max-w-xl mx-auto" style={{ color: "#6B7280" }}>
                Generic macro calculators use the same formula for everyone. Jonno adjusts targets based on what you actually did that day.
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
                  className="bg-white rounded-2xl p-6 flex flex-col gap-4"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: f.iconBg, color: f.iconColor }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1.5" style={{ color: "#1C1C1E" }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="py-14">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>Integrations</p>
              <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1C1C1E" }}>
                What&apos;s connected now,{" "}
                <span style={{ color: "#20C7B7" }}>and what&apos;s next.</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {integrations.map((int, i) => (
                <motion.div
                  key={int.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-4"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: int.iconBg, border: `1px solid ${int.iconBorder}` }}
                  >
                    {int.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#1C1C1E" }}>{int.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{int.desc}</p>
                  </div>
                  <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: int.statusColor }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: int.statusColor }} />
                    {int.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[24px] p-10 lg:p-16 text-center flex flex-col items-center gap-6"
              style={{ background: "linear-gradient(135deg, #4C7DFF 0%, #3A6FEE 100%)", boxShadow: "0 12px 40px rgba(76,125,255,0.25)" }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white">
                Try it while it&apos;s still free.
              </h2>
              <p className="text-base max-w-md" style={{ color: "rgba(255,255,255,0.80)" }}>
                Jonno is in beta. Early access is free. We are adding features based on what athletes ask for.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#FFFFFF", color: "#4C7DFF" }}
              >
                Join the Beta
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>Early access is free. No credit card needed.</p>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
