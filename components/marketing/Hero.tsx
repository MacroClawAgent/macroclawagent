"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Realistic phone mockup with mini app UI ── */
function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto select-none"
      style={{ width: 264, height: 556 }}
    >
      {/* Phone shell */}
      <div
        className="absolute inset-0 rounded-[48px] p-[10px]"
        style={{
          background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset",
        }}
      >
        {/* Screen */}
        <div className="w-full h-full rounded-[40px] bg-[#F5F7FA] overflow-hidden relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[88px] h-[26px] bg-[#1a1a2e] rounded-b-[20px] z-20" />

          {/* Status bar */}
          <div className="pt-8 px-5 flex justify-between items-center">
            <span className="text-[9px] font-black text-gray-900">9:41</span>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <rect x="0" y="2" width="2" height="6" rx="0.5" fill="#111" opacity="0.3"/>
                <rect x="3" y="1" width="2" height="7" rx="0.5" fill="#111" opacity="0.5"/>
                <rect x="6" y="0" width="2" height="8" rx="0.5" fill="#111" opacity="0.8"/>
                <rect x="9" y="0" width="2" height="8" rx="0.5" fill="#111"/>
              </svg>
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                <rect x="0.5" y="0.5" width="11" height="7" rx="2" stroke="#111" strokeOpacity="0.4"/>
                <rect x="1.5" y="1.5" width="8" height="5" rx="1" fill="#111"/>
                <path d="M12.5 2.5v3a1.5 1.5 0 0 0 0-3z" fill="#111" fillOpacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* App header */}
          <div className="px-5 pt-1.5 pb-2 flex justify-between items-center">
            <div>
              <p className="text-[8.5px] text-gray-400 font-medium">Good morning</p>
              <p className="text-[13px] font-black text-gray-900">Alex 👋</p>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: "#4C7DFF" }}>
              A
            </div>
          </div>

          {/* Calorie card */}
          <div className="mx-4 rounded-[22px] p-4" style={{ background: "linear-gradient(135deg, #20C7B7 0%, #1BA89A 100%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>Today&apos;s Goal</p>
                <p className="text-[26px] font-black text-white leading-none">2,140</p>
                <p className="text-[8.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>of 2,840 kcal</p>
              </div>
              {/* Progress ring */}
              <svg width="54" height="54" className="-rotate-90">
                <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                <circle cx="27" cy="27" r="22" fill="none" stroke="white" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="138.2"
                  strokeDashoffset={138.2 * (1 - 0.75)}
                />
              </svg>
            </div>
            {/* Macro row */}
            <div className="flex gap-3 mt-3">
              {[
                { label: "Protein", val: "142g" },
                { label: "Carbs", val: "220g" },
                { label: "Fat", val: "62g" },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] font-black text-white">{m.val}</p>
                  <p className="text-[7px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strava card */}
          <div className="mx-4 mt-2.5 bg-white border border-gray-100 rounded-[18px] p-3 flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-orange-50">
              <Image src="/strava.png" alt="Strava" width={18} height={18} className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9.5px] font-bold text-gray-900 truncate">Morning Run · 10.2km</p>
              <p className="text-[8px] text-gray-400">847 kcal burned · 54 min</p>
            </div>
            <div className="flex items-end gap-[2px] h-4 flex-shrink-0">
              {[4, 6, 3, 7, 5, 8, 6].map((h, i) => (
                <div key={i} className="w-[2px] rounded-full bg-orange-400" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>

          {/* AI suggestion */}
          <div className="mx-4 mt-2 rounded-[18px] p-3 flex gap-2 items-start" style={{ backgroundColor: "rgba(32,199,183,0.10)", border: "1px solid rgba(32,199,183,0.25)" }}>
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#20C7B7" }}>
              <span className="text-[9px] text-white font-black">✦</span>
            </div>
            <div>
              <p className="text-[8px] font-bold mb-0.5" style={{ color: "#1BA89A" }}>Jonno Agent</p>
              <p className="text-[8.5px] leading-relaxed" style={{ color: "#1C1C1E" }}>Protein 34g short today. Add grilled chicken to hit your target. 🎯</p>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center pb-3 pt-2">
            {[
              { icon: "🏠", active: true },
              { icon: "📊", active: false },
              { icon: "🤖", active: false },
              { icon: "🛒", active: false },
            ].map(({ icon, active }, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-[14px]">{icon}</span>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: active ? "#4C7DFF" : "transparent" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side buttons */}
      <div className="absolute top-[100px] -right-[3px] w-[3px] h-10 bg-gray-600 rounded-r-full" />
      <div className="absolute top-[160px] -left-[3px] w-[3px] h-7 bg-gray-600 rounded-l-full" />
      <div className="absolute top-[196px] -left-[3px] w-[3px] h-7 bg-gray-600 rounded-l-full" />
    </motion.div>
  );
}

/* ── Background scene: fitness props ── */
function HeroBackgroundScene() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-16 min-h-[92vh] flex flex-col justify-center"
      style={{ backgroundColor: "#F4F5F7" }}
    >
      {/* Layer 2: Photographic fitness scene — right 62% */}
      <HeroBackgroundScene />

      {/* Bottom fade into the next section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: 120,
          background: "linear-gradient(to bottom, transparent, #F4F5F7)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-end gap-6 lg:gap-8">

          {/* ── LEFT: Content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-7 items-center lg:items-start text-center lg:text-left pb-6 lg:pb-10"
          >
            {/* Beta badge */}
            <motion.div variants={itemVariants}>
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                style={{
                  backgroundColor: "rgba(32,199,183,0.10)",
                  border: "1px solid rgba(32,199,183,0.30)",
                  color: "#1BA89A",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#22C55E" }} />
                Beta Access · Limited Spots
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-[68px] font-black tracking-tight leading-[0.92]"
              style={{ color: "#1C1C1E" }}
            >
              AI nutrition
              <br />
              <span style={{ color: "#20C7B7" }}>for athletes.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={itemVariants}
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: "#6B7280" }}
            >
              Jonno reads your training load from Strava, adjusts your calorie and macro targets, and helps you order meals that match your goals.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 items-center lg:items-start"
            >
              <Link
                href="/join"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-base font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: "#4C7DFF", boxShadow: "0 6px 24px rgba(76,125,255,0.30)" }}
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-colors"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#1C1C1E" }}
              >
                See how it works
              </a>
            </motion.div>

            {/* Trust pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {[
                "Built for runners, cyclists & triathletes",
                "Syncs with Strava & Apple Health",
                "Meal planning linked to delivery",
              ].map((s) => (
                <span
                  key={s}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", color: "#6B7280" }}
                >
                  {s}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Phone mockup ── */}
          <div className="relative z-10 flex justify-end items-end pr-4">
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* Soft wave bottom */}
      <div className="relative z-10 w-full overflow-hidden" style={{ height: 60 }}>
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-full"
        >
          <path d="M0,60 L0,35 Q360,0 720,30 Q1080,55 1440,25 L1440,60 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </section>
  );
}
