"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CheckCircle2 } from "lucide-react";

const releases = [
  {
    version: "v0.3.0",
    date: "Feb 18, 2026",
    tag: "Latest",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    title: "Profile wizard & dashboard personalisation",
    changes: [
      "Multi-step onboarding wizard — name, date of birth, gender, body metrics, profile photo",
      "Metric and imperial unit support (kg/cm and lbs/ft)",
      "Avatar upload to Supabase Storage with cropping",
      "Profile edit page accessible from dashboard",
      "Dashboard now shows personalised greeting with your first name",
      "Avatar display in dashboard header",
      "Auth flow: onboarding shown exactly once on first login, not on every sign-in",
    ],
  },
  {
    version: "v0.2.0",
    date: "Jan 15, 2026",
    tag: "Major",
    tagColor: "text-indigo-400 bg-indigo-500/10",
    title: "Claw Agent AI + Uber Eats smart cart",
    changes: [
      "Claw Agent chat interface — ask any nutrition question and get context-aware answers",
      "Uber Eats smart cart builder — AI selects meals matched to your remaining macros",
      "One-click cart creation from AI recommendations",
      "Macro-matched restaurant search via Uber Direct API",
      "Smart meal library — save and re-order favourite macro-matched meals",
      "Real-time macro tracking updates in dashboard activity rings",
      "Hydration tracking (3L daily target)",
      "Meal card interface with macros per meal displayed",
    ],
  },
  {
    version: "v0.1.0",
    date: "Dec 20, 2025",
    tag: "Launch",
    tagColor: "text-orange-400 bg-orange-500/10",
    title: "Initial launch — Strava sync & dashboard",
    changes: [
      "Strava OAuth integration — sync all activities automatically",
      "TDEE calculation from Strava activity data",
      "Daily calorie and macro dashboard",
      "Activity rings (calories, protein, carbs)",
      "Strava activity feed in dashboard",
      "Quick stats: calories burned, protein target, hydration",
      "Supabase auth — email/password and Google OAuth",
      "Dark Midnight Athletic design system launched",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <main className="pt-16">
        {/* Header */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-900/10 blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
                Changelog
              </p>
              <h1 className="text-5xl font-black tracking-tight gradient-text mb-4">
                What&apos;s new.
              </h1>
              <p className="text-lg text-slate-400">
                We ship fast. Here&apos;s the proof.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section className="pb-24">
          <div className="max-w-3xl mx-auto px-6">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[88px] top-0 bottom-0 w-px bg-white/[0.06] hidden md:block" />

              <div className="flex flex-col gap-0">
                {releases.map((release, i) => (
                  <motion.div
                    key={release.version}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex flex-col md:flex-row gap-6 pb-12"
                  >
                    {/* Left: version + date */}
                    <div className="md:w-[180px] flex-shrink-0 flex md:flex-col items-start md:items-end gap-3 md:gap-1 pt-0.5">
                      <span className="font-mono text-sm font-bold text-slate-300">{release.version}</span>
                      <span className="text-xs text-slate-600">{release.date}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${release.tagColor}`}>
                        {release.tag}
                      </span>
                    </div>

                    {/* Dot on timeline */}
                    <div className="hidden md:flex items-start justify-center w-8 flex-shrink-0 pt-1">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-[#08090D]" />
                    </div>

                    {/* Right: content */}
                    <div className="flex-1 glass-card p-6">
                      <h3 className="text-lg font-bold text-slate-100 mb-4">{release.title}</h3>
                      <ul className="space-y-2.5">
                        {release.changes.map((change) => (
                          <li key={change} className="flex items-start gap-2.5 text-sm text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
