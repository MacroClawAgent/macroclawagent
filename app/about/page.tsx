"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { Brain, Database, Zap, Target, ArrowRight, MapPin, ExternalLink } from "lucide-react";

// ── Count-up hook (same pattern as TrustSignals) ──────────────────────────────
function useCountUp(target: number, duration = 1600, enabled = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, enabled]);
  return count;
}

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const count = useCountUp(value, 1600, isInView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-1"
    >
      <p className="text-4xl font-black text-[#20C7B7]">
        {isInView ? `${count.toLocaleString()}${suffix}` : `0${suffix}`}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </motion.div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { value: 12400, suffix: "+", label: "Athletes Training Smarter" },
  { value: 3, suffix: ".2M", label: "Meals Ordered via Agent" },
  { value: 94, suffix: "%", label: "Hit Weekly Macro Targets" },
  { value: 49, suffix: "★", label: "Average App Rating" },
];

const timeline = [
  {
    date: "2024",
    title: "The frustration becomes a plan",
    desc: "Two cyclists finish a 200km sportive and realise every nutrition app still shows a static 2,000 kcal target. The problem is obvious. The solution isn't built yet.",
    color: "bg-[#20C7B7]",
  },
  {
    date: "Jan 2025",
    title: "Private beta with 50 athletes",
    desc: "First Strava integration goes live. 50 hand-picked cyclists and runners test real-time TDEE calculations. 94% say it's the first app that actually adjusts to their training.",
    color: "bg-indigo-500",
  },
  {
    date: "Jun 2025",
    title: "Smart cart ships",
    desc: "Uber Eats integration completes the loop — the Jonno Agent does not just tell you what to eat, it builds the cart. Recovery meals, ordered in under 60 seconds.",
    color: "bg-emerald-500",
  },
  {
    date: "2026",
    title: "Public launch",
    desc: "12,400+ athletes onboard across 34 countries. The Jonno Agent handles training nutrition so athletes can focus on training.",
    color: "bg-violet-500",
  },
];

const values = [
  {
    icon: <Database className="w-6 h-6" />,
    color: "text-[#20C7B7]",
    bg: "bg-[rgba(32,199,183,0.10)]",
    title: "Data-Driven Recovery",
    desc: "Every macro recommendation is grounded in your actual training load. No generic advice. No one-size-fits-all targets. Your numbers, your plan.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    color: "text-[#4C7DFF]",
    bg: "bg-[rgba(105,189,235,0.10)]",
    title: "AI-First Coaching",
    desc: "The Jonno Agent isn't a calculator with a chat interface. It reasons across your training history, food preferences, and goals to give context-aware recommendations.",
    featured: true,
  },
  {
    icon: <Target className="w-6 h-6" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Athlete-Obsessed Design",
    desc: "Every screen is built for athletes who are moving fast, not sitting at a desk. Glanceable, dark, fast. No bloat. No wellness-speak.",
  },
];

const team = [
  {
    initials: "MR",
    gradient: "from-[#20C7B7] to-[#4C7DFF]",
    name: "Marco R.",
    role: "Co-founder & CEO",
    bio: "10-year amateur cyclist and ex-consultant obsessed with performance analytics.",
    badge: "Cyclist · Milano",
  },
  {
    initials: "LW",
    gradient: "from-indigo-500 to-violet-600",
    name: "Lena W.",
    role: "Co-founder & CTO",
    bio: "Marathon runner who built 3 fintech products and refuses to eat without data.",
    badge: "Runner · Berlin",
  },
  {
    initials: "YT",
    gradient: "from-emerald-500 to-teal-600",
    name: "Yuki T.",
    role: "Head of AI",
    bio: "Triathlete and ex-Anthropic engineer. Designed the Jonno reasoning loop.",
    badge: "Triathlete · Tokyo",
  },
  {
    initials: "SF",
    gradient: "from-violet-500 to-indigo-600",
    name: "Seb F.",
    role: "Head of Design",
    bio: "Gravel rider and ex-Nike Digital. Built the Midnight Athletic design system.",
    badge: "Cyclist · London",
  },
];

const stack = [
  {
    name: "Anthropic Claude",
    role: "The AI brain",
    desc: "Claude API powers the Jonno Agent, reasoning across nutrition data, activity history, and food preferences to generate genuinely useful advice.",
    color: "text-[#4C7DFF]",
    bg: "bg-[rgba(105,189,235,0.10)]",
    border: "border-[rgba(105,189,235,0.25)]",
    icon: <Brain className="w-8 h-8" />,
  },
  {
    name: "Strava API",
    role: "Activity intelligence",
    desc: "Real-time OAuth sync pulls your workouts, calculates TDEE, and feeds that data directly to the AI. Your nutrition targets move every time you move.",
    color: "text-[#20C7B7]",
    bg: "bg-[rgba(32,199,183,0.10)]",
    border: "border-[rgba(32,199,183,0.20)]",
    icon: null, // rendered as Image
  },
  {
    name: "Uber Direct API",
    role: "Seamless delivery",
    desc: "The integration means the Jonno Agent doesn't just tell you what to eat — it builds the cart, surfaces macro-matched options from restaurants near you, and removes the friction.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: <Zap className="w-8 h-8" />,
  },
];

const press = [
  "Runner's World",
  "Cycling Weekly",
  "Strava Labs Blog",
  "Product Hunt",
  "Hacker News",
  "TechCrunch",
];

const openRoles = [
  { title: "AI Product Engineer", team: "Engineering", location: "Remote" },
  { title: "Growth & Athlete Community Lead", team: "Growth", location: "Remote" },
  { title: "Backend / Infra Engineer", team: "Engineering", location: "Remote" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />
      <main className="pt-16">

        {/* ── Hero ── */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          {/* Atmospheric orbs */}
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(32,199,183,0.10) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(32,199,183,0.10) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Left column */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 border" style={{ backgroundColor: "rgba(32,199,183,0.10)", borderColor: "rgba(32,199,183,0.30)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#20C7B7" }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#20C7B7" }}>Our story</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
                  <span className="text-[#20C7B7]">We built the nutrition tool</span>
                  <br />
                  <span style={{ color: "#1C1C1E" }}>we always wanted.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
                  Founded by athletes. Frustrated by static calorie apps that ignore training data.
                  Built to finally close the loop between how you train and what you eat.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="text-sm text-gray-500">Founded 2025</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-sm text-gray-500">Remote-first</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-sm text-gray-500">Athlete-led</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="glow" size="lg" asChild>
                    <Link href="/login">Get Started Free</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="#story">
                      Read our story <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                  </Button>
                </div>
              </motion.div>

              {/* Right column — mascot */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative flex items-center justify-center"
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-80 h-80 rounded-full bg-[rgba(32,199,183,0.08)] blur-3xl" />
                </div>
                <div className="bg-white rounded-2xl p-8 relative z-10 flex flex-col items-center gap-6 max-w-xs w-full">
                  <Image
                    src="/mascot.png"
                    alt="Jonno mascot"
                    width={260}
                    height={260}
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-lg">The Jonno Agent</p>
                    <p className="text-sm text-gray-500">Your AI nutrition coach</p>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="py-14 border-y backdrop-blur-sm" style={{ borderColor: "#E5E7EB", backgroundColor: "rgba(255,253,251,0.60)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 divide-x divide-white/[0.06]">
              {stats.map((s) => (
                <div key={s.label} className="text-center pl-4 first:pl-0">
                  <StatCard value={s.value} suffix={s.suffix} label={s.label} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Our Story ── */}
        <section id="story" className="py-14" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Text column */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#20C7B7" }}>
                  Origin story
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-[#20C7B7] mb-6 leading-tight">
                  The problem we lived.
                </h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  Athletes are the most data-rich humans alive. GPS routes, power outputs, heart rate curves,
                  VO2 estimates. But every nutrition app treats everyone the same. Static calorie targets
                  regardless of what you did that day.
                </p>
                <p className="text-gray-600 leading-relaxed mb-5">
                  We'd do a 4-hour ride and still see the same 2,000 kcal target. Then get "grilled chicken
                  and veg" suggested for the third time. And actually ordering the right food? A 30-minute
                  research task every evening.
                </p>
                <blockquote className="border-l-2 border-indigo-500 pl-5 my-8">
                  <p className="text-lg text-gray-800 font-medium italic leading-relaxed">
                    "Your training data finally tells your kitchen what to do. The guesswork is gone."
                  </p>
                </blockquote>
                <div className="flex flex-wrap gap-2 mt-6">
                  {["2024 — Idea born", "Jan 2025 — First beta", "2026 — Public launch"].map((badge) => (
                    <span key={badge} className="px-3 py-1 text-xs rounded-full border" style={{ backgroundColor: "rgba(32,199,183,0.10)", borderColor: "rgba(32,199,183,0.30)", color: "#1BA89A" }}>
                      {badge}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Mascot column */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative flex items-center justify-center"
              >
                {/* Atmospheric glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 rounded-full bg-[rgba(32,199,183,0.08)] blur-3xl" />
                </div>
                <div className="bg-white rounded-2xl p-6 relative z-10 flex flex-col items-center gap-4 max-w-sm w-full">
                  <Image
                    src="/mascot.png"
                    alt="Jonno mascot"
                    width={280}
                    height={280}
                    className="object-contain drop-shadow-2xl"
                  />
                  <div className="text-center">
                    <p className="font-bold text-gray-900">The Jonno Agent</p>
                    <p className="text-sm text-gray-500">Your AI nutrition coach</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Company Timeline ── */}
        <section className="py-14">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                Company history
              </p>
              <h2 className="text-4xl font-black text-[#20C7B7]">From frustration to product.</h2>
            </motion.div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/20 to-transparent" />

              <div className="flex flex-col gap-12">
                {timeline.map((item, i) => (
                  <motion.div
                    key={item.date}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className={`relative flex gap-8 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    {/* Dot */}
                    <div className="absolute left-4 md:left-1/2 top-1.5 -translate-x-1/2 z-10">
                      <div className={`w-4 h-4 rounded-full ${item.color} ring-4 ring-[#08090D]`} />
                    </div>

                    {/* Card */}
                    <div className={`light-card p-6 ml-14 md:ml-0 ${i % 2 === 0 ? "md:mr-auto md:pr-16" : "md:ml-auto md:pl-16"} md:w-[45%]`}>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 border" style={{ backgroundColor: "rgba(32,199,183,0.10)", color: "#20C7B7", borderColor: "rgba(32,199,183,0.30)" }}>
                        {item.date}
                      </span>
                      <h3 className="font-bold mb-2" style={{ color: "#1C1C1E" }}>{item.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="py-20" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                How we work
              </p>
              <h2 className="text-4xl font-black text-[#20C7B7]">What we believe in.</h2>
            </motion.div>

            {/* Pull quote */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-2xl md:text-3xl font-bold italic max-w-2xl mx-auto mb-14" style={{ color: "#6B7280" }}
            >
              "Train like a pro. Eat like you know why."
            </motion.p>

            <div className="grid md:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`light-card p-8 flex flex-col gap-4 ${v.featured ? "border border-gray-200" : ""}`}
                >
                  <div className={`w-12 h-12 rounded-xl ${v.bg} ${v.color} flex items-center justify-center`}>
                    {v.icon}
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "#1C1C1E" }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="py-14">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                The team
              </p>
              <h2 className="text-4xl font-black text-[#20C7B7]">The athletes behind Jonno.</h2>
              <p className="mt-4 max-w-lg mx-auto" style={{ color: "#6B7280" }}>
                Remote-first. Performance-obsessed. All active athletes who use the product daily.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-4"
                >
                  {/* Avatar */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-2xl font-black text-white shadow-lg`}>
                    {member.initials}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "#1C1C1E" }}>{member.name}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "#20C7B7" }}>{member.role}</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{member.bio}</p>
                  <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border" style={{ color: "#6B7280", backgroundColor: "#F4F5F7", borderColor: "#E5E7EB" }}>
                    <MapPin className="w-3 h-3" />
                    {member.badge}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="py-20" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                Technology
              </p>
              <h2 className="text-4xl font-black text-[#20C7B7]">Built on the best APIs.</h2>
              <p className="text-lg mt-4 max-w-xl mx-auto" style={{ color: "#6B7280" }}>
                We didn't build a new AI. We orchestrated the world's best tools into one athlete-first workflow.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {stack.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                  className={`light-card p-8 border ${s.border} flex flex-col gap-4`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
                    {s.name === "Strava API" ? (
                      <Image src="/strava.png" alt="Strava" width={32} height={32} className="object-contain" />
                    ) : (
                      s.icon
                    )}
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${s.color}`}>{s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.role}</p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* How it works diagram */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 text-center"
            >
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">System architecture</p>
              <Image
                src="/howitworks.png"
                alt="How Jonno works"
                width={900}
                height={400}
                className="w-full object-contain rounded-lg max-h-72"
              />
            </motion.div>
          </div>
        </section>

        {/* ── Press / Featured In ── */}
        <section className="py-16 border-y" style={{ borderColor: "#E5E7EB" }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-8">
                As featured in
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {press.map((name) => (
                  <span
                    key={name}
                    className="px-5 py-2 rounded-lg font-semibold text-sm border" style={{ backgroundColor: "#F4F5F7", borderColor: "#E5E7EB", color: "#6B7280" }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Join Us ── */}
        <section className="py-14">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
                We're hiring
              </p>
              <h2 className="text-4xl font-black text-[#20C7B7]">Join the team.</h2>
              <p className="text-gray-600 mt-4 max-w-lg mx-auto">
                We're a small team building something athletes actually use. If you train and you build, we want to talk.
              </p>
            </motion.div>

            <div className="flex flex-col gap-4">
              {openRoles.map((role, i) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                >
                  <a
                    href="#"
                    className="bg-white rounded-2xl p-5 flex items-center justify-between group hover:border-blue-200 transition-colors duration-200 block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">
                          {role.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{role.team}</span>
                          <span className="text-slate-700">·</span>
                          <span className="text-xs text-gray-500">{role.location}</span>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission / CTA ── */}
        <section className="py-20 border-t" style={{ borderColor: "#E5E7EB" }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: "#E5E7EB" }}
            >
              <div className="grid md:grid-cols-2 items-center">
                {/* Image */}
                <div className="relative h-64 md:h-full min-h-[280px] bg-white">
                  <Image
                    src="/fuelsmarter.png"
                    alt="Fuel smarter"
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0F111A] hidden md:block" />
                </div>

                {/* Text */}
                <div className="p-10 md:p-12 flex flex-col items-start gap-6">
                  <span className="text-4xl">🦀</span>
                  <h2 className="text-3xl md:text-4xl font-black text-[#20C7B7] leading-tight">
                    The mission
                  </h2>
                  <p className="text-lg leading-relaxed" style={{ color: "#1C1C1E" }}>
                    "Nutrition should be as data-driven as your training. We're building the infrastructure
                    that makes that true, one athlete at a time."
                  </p>
                  <p className="text-xs text-gray-500">Jonno, 2026</p>
                  <div className="flex flex-wrap gap-3 pt-2">
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
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
