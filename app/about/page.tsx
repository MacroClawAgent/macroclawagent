"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Brain, Database, Target, ArrowRight, Zap } from "lucide-react";

const timeline = [
  {
    date: "Late 2024",
    title: "The frustration.",
    desc: "Two mates who trained together kept running into the same wall. After a long ride or a hard run, every app showed the same static target. We knew Strava had all the data. No one was using it to actually change what you ate.",
    dot: "#20C7B7",
  },
  {
    date: "Early 2025",
    title: "First build.",
    desc: "We connected Strava via OAuth and built a basic macro engine that adjusted targets based on what you actually did that day. Showed it to a handful of runner and cycling friends. They stopped using their old apps.",
    dot: "#4C7DFF",
  },
  {
    date: "Now",
    title: "Beta.",
    desc: "Strava sync and AI coaching are live. A small group of athletes are testing Jonno daily and telling us what to build next. Uber Eats cart integration is rolling out now.",
    dot: "#20C7B7",
  },
  {
    date: "Next",
    title: "What we are building toward.",
    desc: "A complete nutrition loop: your training data feeds your targets, your targets feed meal suggestions, and meal suggestions connect directly to delivery or grocery lists. No manual logging. No guessing.",
    dot: "#4C7DFF",
  },
];

const values = [
  {
    icon: <Database className="w-6 h-6" />,
    iconBg: "rgba(32,199,183,0.10)",
    iconColor: "#20C7B7",
    title: "Data-Driven Recovery",
    desc: "Every macro recommendation is grounded in your actual training load. No generic advice. No one-size-fits-all targets. Your numbers, your plan.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    iconBg: "rgba(76,125,255,0.10)",
    iconColor: "#4C7DFF",
    title: "AI That Explains Itself",
    desc: "The Jonno Agent does not just give you a number. It tells you why, based on what you did that day. A tempo run and a long slow run get different recommendations.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    iconBg: "rgba(32,199,183,0.10)",
    iconColor: "#20C7B7",
    title: "Built for How Athletes Actually Live",
    desc: "You are not sitting at a desk logging meals between meetings. You are mid-week training, tired, and hungry. Jonno gives you the answer fast.",
  },
];

const stack = [
  {
    name: "Anthropic Claude",
    role: "The AI brain",
    desc: "Claude powers the Jonno Agent, reasoning across your nutrition targets, activity history, and food preferences to give advice that is actually relevant to your day.",
    iconBg: "rgba(76,125,255,0.10)",
    iconBorder: "rgba(76,125,255,0.20)",
    iconColor: "#4C7DFF",
    icon: <Brain className="w-8 h-8" />,
  },
  {
    name: "Strava API",
    role: "Activity intelligence",
    desc: "Real-time OAuth sync pulls your workouts, calculates your energy expenditure, and feeds that data directly to the macro engine. Your nutrition targets update every time you train.",
    iconBg: "rgba(32,199,183,0.10)",
    iconBorder: "rgba(32,199,183,0.20)",
    iconColor: "#20C7B7",
    icon: null,
  },
  {
    name: "Uber Eats API",
    role: "Closing the loop",
    desc: "Instead of telling you what to eat and leaving you to figure it out, Jonno surfaces nearby meals filtered by your remaining macros. Cart integration is rolling out in beta.",
    iconBg: "rgba(32,199,183,0.10)",
    iconBorder: "rgba(32,199,183,0.20)",
    iconColor: "#20C7B7",
    icon: <Zap className="w-8 h-8" />,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />
      <main className="pt-16">

        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(32,199,183,0.08) 0%, transparent 70%)" }} />
          <div className="max-w-6xl mx-auto px-6 relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Left */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-6"
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full self-start border text-xs font-semibold uppercase tracking-widest" style={{ backgroundColor: "rgba(76,125,255,0.08)", borderColor: "rgba(76,125,255,0.25)", color: "#4C7DFF" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#4C7DFF" }} />
                  Currently in beta
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]" style={{ color: "#1C1C1E" }}>
                  We built{" "}
                  <span style={{ color: "#20C7B7" }}>what we couldn&apos;t find.</span>
                </h1>
                <p className="text-lg leading-relaxed max-w-xl" style={{ color: "#6B7280" }}>
                  Two friends who trained seriously and could never figure out what to eat after a hard session. Every app showed the same static number. Strava had all the data and nothing used it. So we started building.
                </p>
                <div className="flex flex-wrap gap-3 text-sm" style={{ color: "#9CA3AF" }}>
                  <span>Founded 2024</span>
                  <span>·</span>
                  <span>Two-person team</span>
                  <span>·</span>
                  <span>Beta</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/join"
                    className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#4C7DFF", color: "#FFFFFF" }}
                  >
                    Join the Beta
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#story"
                    className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-full text-sm border transition-colors hover:border-gray-300"
                    style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                  >
                    Our story
                  </a>
                </div>
              </motion.div>

              {/* Right — app preview card */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative flex items-center justify-center"
              >
                <div className="bg-white border rounded-2xl p-6 relative z-10 flex flex-col gap-5 w-full max-w-sm shadow-sm" style={{ borderColor: "#E5E7EB" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>Good morning</p>
                      <p className="text-base font-black" style={{ color: "#1C1C1E" }}>Alex</p>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ backgroundColor: "#4C7DFF" }}>A</div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #20C7B7 0%, #1BA89A 100%)" }}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Today&apos;s target</p>
                    <p className="text-3xl font-black text-white leading-none">2,140 <span className="text-base font-normal opacity-70">/ 2,840 kcal</span></p>
                    <div className="flex gap-4 mt-3">
                      {[["142g", "Protein"], ["220g", "Carbs"], ["62g", "Fat"]].map(([v, l]) => (
                        <div key={l}>
                          <p className="text-sm font-black text-white">{v}</p>
                          <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-3 flex gap-2.5 items-start" style={{ backgroundColor: "rgba(76,125,255,0.08)", border: "1px solid rgba(76,125,255,0.20)" }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-black text-white" style={{ backgroundColor: "#4C7DFF" }}>J</div>
                    <div>
                      <p className="text-xs font-bold mb-0.5" style={{ color: "#4C7DFF" }}>Jonno Agent</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>Based on your 14km run this morning, aim for 55g protein and 90g carbs in the next hour.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Our Story */}
        <section id="story" className="py-14" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-5"
              >
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#20C7B7" }}>
                  Origin
                </p>
                <h2 className="text-4xl md:text-5xl font-black leading-tight" style={{ color: "#1C1C1E" }}>
                  Two mates from uni.<br />
                  <span style={{ color: "#20C7B7" }}>Same frustration.</span>
                </h2>
                <p className="leading-relaxed" style={{ color: "#6B7280" }}>
                  We met at university and both trained seriously outside of lectures. One ran, one cycled. After long sessions we&apos;d check our nutrition apps and see the same thing: a static 2,000 kcal target, no matter what we&apos;d done that day.
                </p>
                <p className="leading-relaxed" style={{ color: "#6B7280" }}>
                  Then came 20 minutes of googling post-ride meals, picking something that looked roughly right, and still wondering if it was enough protein. Strava had GPS routes, power data, heart rate curves. None of it fed back into what we ate.
                </p>
                <p className="leading-relaxed" style={{ color: "#6B7280" }}>
                  We started building Jonno to close that gap. Not as a side project, but as the tool we genuinely needed and couldn&apos;t find anywhere else.
                </p>
              </motion.div>

              {/* Problem visual */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="bg-white border rounded-2xl p-6 flex flex-col gap-4 shadow-sm" style={{ borderColor: "#E5E7EB" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#20C7B7" }}>The problem we lived</p>
                  {[
                    { label: "Before a rest day", value: "2,000 kcal target", bad: false, neutral: true },
                    { label: "After a 4hr ride", value: "Still 2,000 kcal", bad: true, neutral: false },
                    { label: "With Jonno", value: "3,840 kcal, auto-adjusted", bad: false, neutral: false },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #F4F5F7" }}>
                      <span className="text-sm" style={{ color: "#6B7280" }}>{row.label}</span>
                      <span
                        className="text-sm font-bold px-2.5 py-0.5 rounded-full"
                        style={
                          row.bad
                            ? { backgroundColor: "#FEF2F2", color: "#EF4444" }
                            : row.neutral
                            ? { backgroundColor: "#F4F5F7", color: "#6B7280" }
                            : { backgroundColor: "#20C7B7", color: "#FFFFFF" }
                        }
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                  <div className="rounded-xl p-3 text-sm text-center font-semibold" style={{ backgroundColor: "rgba(32,199,183,0.10)", color: "#1BA89A" }}>
                    Jonno adjusts automatically. Every session.
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-14">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                Where we are
              </p>
              <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1C1C1E" }}>
                From idea to{" "}
                <span style={{ color: "#20C7B7" }}>beta.</span>
              </h2>
            </motion.div>

            <div className="flex flex-col gap-6">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.date}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex gap-5 items-start"
                >
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.dot }} />
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 min-h-[40px]" style={{ backgroundColor: "#E5E7EB" }} />
                    )}
                  </div>
                  <div className="bg-white rounded-2xl p-5 flex-1 mb-2" style={{ border: "1px solid #E5E7EB" }}>
                    <span className="inline-block text-xs font-bold mb-2 px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(32,199,183,0.10)", color: "#1BA89A" }}>
                      {item.date}
                    </span>
                    <h3 className="font-bold mb-1.5" style={{ color: "#1C1C1E" }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                What we believe
              </p>
              <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1C1C1E" }}>
                How we think about{" "}
                <span style={{ color: "#20C7B7" }}>nutrition.</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-8 flex flex-col gap-4"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: v.iconBg, color: v.iconColor }}
                  >
                    {v.icon}
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "#1C1C1E" }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                Technology
              </p>
              <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1C1C1E" }}>
                Built on the{" "}
                <span style={{ color: "#20C7B7" }}>right tools.</span>
              </h2>
              <p className="text-base mt-4 max-w-xl mx-auto" style={{ color: "#6B7280" }}>
                We did not try to build our own AI. We connected the best existing APIs into one workflow built specifically for athletes.
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
                  className="bg-white rounded-2xl p-8 flex flex-col gap-4"
                  style={{ border: `1px solid ${s.iconBorder}` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: s.iconBg, color: s.iconColor, border: `1px solid ${s.iconBorder}` }}
                  >
                    {s.name === "Strava API" ? (
                      <Image src="/strava.png" alt="Strava" width={32} height={32} className="object-contain" />
                    ) : (
                      s.icon
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: "#1C1C1E" }}>{s.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{s.role}</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Architecture flow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <p className="text-xs uppercase tracking-widest mb-8 text-center" style={{ color: "#9CA3AF" }}>How it connects</p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                {[
                  { icon: "🏃", label: "Strava", sub: "Activity data", bg: "rgba(32,199,183,0.08)", border: "rgba(32,199,183,0.20)", color: "#1BA89A" },
                  { icon: "✦", label: "Jonno Agent", sub: "AI reasoning", bg: "rgba(76,125,255,0.08)", border: "rgba(76,125,255,0.20)", color: "#4C7DFF" },
                  { icon: "🎯", label: "Macro targets", sub: "Updated daily", bg: "rgba(32,199,183,0.08)", border: "rgba(32,199,183,0.20)", color: "#1BA89A" },
                  { icon: "🛒", label: "Uber Eats", sub: "Rolling out", bg: "rgba(76,125,255,0.08)", border: "rgba(76,125,255,0.20)", color: "#4C7DFF" },
                ].map((node, i, arr) => (
                  <div key={node.label} className="flex items-center gap-3">
                    <div
                      className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl min-w-[110px] text-center"
                      style={{ backgroundColor: node.bg, border: `1px solid ${node.border}` }}
                    >
                      <span className="text-2xl">{node.icon}</span>
                      <p className="text-sm font-bold" style={{ color: node.color }}>{node.label}</p>
                      <p className="text-[10px]" style={{ color: "#9CA3AF" }}>{node.sub}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="hidden md:flex items-center text-xl font-thin" style={{ color: "#D1D5DB" }}>
                        &#x2192;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
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
                Nutrition as data-driven as your training.
              </h2>
              <p className="text-base max-w-md" style={{ color: "rgba(255,255,255,0.80)" }}>
                That is what we are building. If you train seriously and you are tired of guessing, join the beta and help us shape it.
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
