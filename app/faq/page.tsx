"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { ChevronDown } from "lucide-react";

const sections = [
  {
    title: "General",
    color: "text-indigo-400",
    faqs: [
      {
        q: "What is MacroClawAgent?",
        a: "MacroClawAgent is an AI-powered nutrition platform built for athletes. It syncs your workout data from Strava, uses the Claw Agent (powered by Anthropic's Claude AI) to calculate personalised macro targets, and can automatically build Uber Eats carts matched to your nutritional needs. Think of it as a nutrition coach that lives in your phone and updates every time you train.",
      },
      {
        q: "How is MacroClawAgent different from MyFitnessPal or Cronometer?",
        a: "Traditional macro trackers are calculators — you log food and they show totals. MacroClawAgent is an AI reasoning engine. It connects your training data to your nutrition targets in real time, has a conversational AI coach you can actually ask questions, and goes one step further by helping you order the right food. It adapts to what you did today, not just who you are on paper.",
      },
      {
        q: "Is this for weight loss or performance?",
        a: "MacroClawAgent is built for performance — for athletes who want to fuel training, optimise recovery, and hit macro targets precisely. While weight management is a side-effect of controlled nutrition, we don't use weight-loss language or position the product that way. If you're looking for a calorie deficit app, this probably isn't your tool. If you want to eat like your training actually matters, you're in the right place.",
      },
      {
        q: "What devices and platforms are supported?",
        a: "MacroClawAgent is a web application that works on any device with a browser — no app download required. We sync with Strava (any device Strava supports: Garmin, Apple Watch, Wahoo, Polar, etc.), Uber Eats (available markets), and Apple Health. We're working on native iOS and Android apps.",
      },
      {
        q: "Do I need a Strava account to use MacroClawAgent?",
        a: "Strava is not required to use the core features. You can use MacroClawAgent for manual macro tracking and AI coaching without Strava. However, the activity-synced TDEE calculation and workout-aware meal planning require a Strava connection. We strongly recommend connecting it — it's where most of the magic happens.",
      },
    ],
  },
  {
    title: "Integrations",
    color: "text-orange-400",
    faqs: [
      {
        q: "How does the Strava sync work?",
        a: "When you connect your Strava account, MacroClawAgent uses the official Strava OAuth API to read your activity data. We pull activity type, duration, distance, heart rate data, and estimated calorie burn. This data is used to recalculate your TDEE and update your daily macro targets. The sync happens automatically after each activity is logged in Strava.",
      },
      {
        q: "What Uber Eats data does MacroClawAgent access?",
        a: "MacroClawAgent uses the Uber Direct API to search nearby restaurants and build order carts on your behalf. We access restaurant menu data and nutritional information to match meals to your macro targets. We don't access your Uber account history, payment methods, or personal data. You always review and confirm the cart before any order is placed.",
      },
      {
        q: "Does it work with Apple Health / Google Fit?",
        a: "Apple Health sync is currently in beta for biometric data (resting heart rate, weight, sleep). Full bidirectional sync is on the roadmap. Google Fit integration is planned for Q2 2026. For activity data, Strava remains the primary integration as it captures both GPS and sensor data more comprehensively.",
      },
      {
        q: "Will you add Garmin, Whoop, or Oura direct integrations?",
        a: "Yes — all three are on the roadmap. For now, if you use Garmin or Whoop, you can sync those devices to Strava first, and MacroClawAgent will pick up the data via Strava. Oura's sleep data integration for recovery-adjusted nutrition targets is particularly high on our priority list.",
      },
    ],
  },
  {
    title: "AI Features",
    color: "text-violet-400",
    faqs: [
      {
        q: "What AI model powers the Claw Agent?",
        a: "The Claw Agent is built on Anthropic's Claude — one of the most capable and safety-focused large language models available. We chose Claude specifically because of Anthropic's commitment to honest, helpful, and harmless AI behaviour. For nutrition guidance where accuracy matters, we didn't want a model that would hallucinate or overstate confidence.",
      },
      {
        q: "Does the Claw Agent learn my preferences over time?",
        a: "Yes. The Claw Agent is given your profile data, recent meal history, training data, and any stated preferences at the start of each conversation. Over time, as you log meals and interact with the agent, it builds a richer picture of your preferences — foods you like, foods that don't sit well with your training, your usual meal timing, and more. This context makes recommendations progressively more personalised.",
      },
      {
        q: "Is the nutrition advice medically validated?",
        a: "MacroClawAgent is not a medical device and the Claw Agent is not a registered dietitian. Our macro targets and recommendations are based on published sports nutrition research (ISSN, ACSM, IOC guidelines) and applied to your individual training data. For medical conditions, eating disorders, or specific clinical dietary requirements, please consult a qualified healthcare professional. The Claw Agent will tell you the same.",
      },
      {
        q: "How does the AI decide what meals to suggest?",
        a: "The Claw Agent reasons across: (1) your remaining macros for the day, (2) your training context (post-workout? rest day? pre-competition?), (3) your stated food preferences and past meal logs, (4) the time of day, and (5) available options from nearby restaurants if using the Uber Eats integration. It produces meal suggestions with macro breakdowns and explains its reasoning. You can always ask why it made a particular recommendation.",
      },
    ],
  },
  {
    title: "Billing",
    color: "text-emerald-400",
    faqs: [
      {
        q: "Can I cancel my subscription at any time?",
        a: "Yes, absolutely. Cancel from your account settings at any moment. Your Pro or Elite access continues until the end of the current billing period. After that, your account reverts to the Free tier — your data, meal history, and activity records are preserved.",
      },
      {
        q: "Is there a free trial?",
        a: "New Pro accounts get a 14-day free trial with full access to all Pro features — Uber Eats cart builder, unlimited AI chat, and smart meal library. No credit card is required to start the trial. You'll only be billed if you choose to continue after the 14 days.",
      },
      {
        q: "What happens to my data if I cancel?",
        a: "Your data is yours. If you cancel, your account moves to the Free tier but all your historical data — meal logs, activity data, profile, and preferences — is retained. You can export your data at any time from account settings. We don't delete data on cancellation.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-white/[0.06] py-5 cursor-pointer"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-start justify-between gap-4">
        <p className={`text-sm font-semibold text-slate-100 ${open ? "text-indigo-200" : ""} transition-colors`}>
          {q}
        </p>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180 text-indigo-400" : ""}`}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-slate-400 mt-3 leading-relaxed overflow-hidden"
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <main className="pt-16">
        {/* Header */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-indigo-900/10 blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
                Got questions
              </p>
              <h1 className="text-5xl font-black tracking-tight gradient-text mb-4">
                Frequently asked questions.
              </h1>
              <p className="text-lg text-slate-400">
                Everything you need to know about MacroClawAgent.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="pb-24">
          <div className="max-w-3xl mx-auto px-6 flex flex-col gap-14">
            {sections.map((section, si) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: si * 0.05 }}
              >
                <h2 className={`text-xs font-bold uppercase tracking-widest mb-6 ${section.color}`}>
                  {section.title}
                </h2>
                {section.faqs.map((faq) => (
                  <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Still have questions */}
        <section className="py-16 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-2xl font-bold text-slate-100 mb-3">Still have questions?</p>
              <p className="text-slate-400 mb-6">
                We reply to every message. Usually within a few hours.
              </p>
              <a
                href="mailto:hello@macroclawagent.com"
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
              >
                hello@macroclawagent.com
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
