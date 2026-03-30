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

/* ── Realistic phone mockup with mini app UI — dark earthy theme ── */
function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto select-none scale-[0.78] md:scale-[0.88] lg:scale-100 origin-bottom"
      style={{ width: 264, height: 556 }}
    >
      {/* Phone shell */}
      <div
        className="absolute inset-0 rounded-[48px] p-[10px]"
        style={{
          background: "linear-gradient(145deg, #2A1F14 0%, #1C1410 100%)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(245,200,66,0.12) inset",
        }}
      >
        {/* Screen */}
        <div className="w-full h-full rounded-[40px] overflow-hidden relative" style={{ backgroundColor: "#0D0A07" }}>
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[88px] h-[26px] rounded-b-[20px] z-20" style={{ backgroundColor: "#1C1410" }} />

          {/* Status bar */}
          <div className="pt-8 px-5 flex justify-between items-center">
            <span className="text-[9px] font-black" style={{ color: "#E8E0D0" }}>9:41</span>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <rect x="0" y="2" width="2" height="6" rx="0.5" fill="#E8E0D0" opacity="0.3"/>
                <rect x="3" y="1" width="2" height="7" rx="0.5" fill="#E8E0D0" opacity="0.5"/>
                <rect x="6" y="0" width="2" height="8" rx="0.5" fill="#E8E0D0" opacity="0.8"/>
                <rect x="9" y="0" width="2" height="8" rx="0.5" fill="#E8E0D0"/>
              </svg>
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                <rect x="0.5" y="0.5" width="11" height="7" rx="2" stroke="#E8E0D0" strokeOpacity="0.4"/>
                <rect x="1.5" y="1.5" width="8" height="5" rx="1" fill="#E8E0D0"/>
                <path d="M12.5 2.5v3a1.5 1.5 0 0 0 0-3z" fill="#E8E0D0" fillOpacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* App header */}
          <div className="px-5 pt-1.5 pb-2 flex justify-between items-center">
            <div>
              <p className="text-[8.5px] font-medium" style={{ color: "rgba(232,224,208,0.45)" }}>Good morning</p>
              <p className="text-[13px] font-black" style={{ color: "#E8E0D0" }}>Alex 👋</p>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm" style={{ backgroundColor: "#E07B54", color: "#1C1410" }}>
              A
            </div>
          </div>

          {/* Calorie card */}
          <div className="mx-4 rounded-[22px] p-4" style={{ background: "linear-gradient(135deg, #E07B54 0%, #3D2218 100%)", border: "1px solid rgba(224,123,84,0.35)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>Today&apos;s Goal</p>
                <p className="text-[26px] font-black text-white leading-none">2,140</p>
                <p className="text-[8.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>of 2,840 kcal</p>
              </div>
              {/* Progress ring */}
              <svg width="54" height="54" className="-rotate-90">
                <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
                <circle cx="27" cy="27" r="22" fill="none" stroke="#F5C842" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="138.2"
                  strokeDashoffset={138.2 * (1 - 0.75)}
                />
              </svg>
            </div>
            {/* Macro row */}
            <div className="flex gap-3 mt-3">
              {[
                { label: "Protein", val: "142g", color: "#E07B54" },
                { label: "Carbs", val: "220g", color: "#F5C842" },
                { label: "Fat", val: "62g", color: "#8B9E6E" },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] font-black" style={{ color: m.color }}>{m.val}</p>
                  <p className="text-[7px] font-medium" style={{ color: "rgba(232,224,208,0.55)" }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strava card */}
          <div className="mx-4 mt-2.5 rounded-[18px] p-3 flex items-center gap-2.5" style={{ backgroundColor: "#1C1410", border: "1px solid rgba(255,220,150,0.12)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: "rgba(224,123,84,0.15)" }}>
              <Image src="/strava.png" alt="Strava" width={18} height={18} className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9.5px] font-bold truncate" style={{ color: "#E8E0D0" }}>Morning Run · 10.2km</p>
              <p className="text-[8px]" style={{ color: "rgba(232,224,208,0.45)" }}>847 kcal burned · 54 min</p>
            </div>
            <div className="flex items-end gap-[2px] h-4 flex-shrink-0">
              {[4, 6, 3, 7, 5, 8, 6].map((h, i) => (
                <div key={i} className="w-[2px] rounded-full" style={{ height: `${h}px`, backgroundColor: "#E07B54" }} />
              ))}
            </div>
          </div>

          {/* AI suggestion */}
          <div className="mx-4 mt-2 rounded-[18px] p-3 flex gap-2 items-start" style={{ backgroundColor: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.20)" }}>
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#F5C842" }}>
              <span className="text-[9px] font-black" style={{ color: "#1C1410" }}>✦</span>
            </div>
            <div>
              <p className="text-[8px] font-bold mb-0.5" style={{ color: "#F5C842" }}>Jonno Agent</p>
              <p className="text-[8.5px] leading-relaxed" style={{ color: "rgba(232,224,208,0.80)" }}>Protein 34g short today. Add grilled chicken to hit your target. 🎯</p>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-around items-center pb-3 pt-2" style={{ backgroundColor: "#1C1410", borderTop: "1px solid rgba(255,220,150,0.10)" }}>
            {[
              { icon: "🏠", active: true },
              { icon: "📊", active: false },
              { icon: "🤖", active: false },
              { icon: "🛒", active: false },
            ].map(({ icon, active }, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-[14px]">{icon}</span>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: active ? "#F5C842" : "transparent" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side buttons */}
      <div className="absolute top-[100px] -right-[3px] w-[3px] h-10 rounded-r-full" style={{ backgroundColor: "#3D2A1A" }} />
      <div className="absolute top-[160px] -left-[3px] w-[3px] h-7 rounded-l-full" style={{ backgroundColor: "#3D2A1A" }} />
      <div className="absolute top-[196px] -left-[3px] w-[3px] h-7 rounded-l-full" style={{ backgroundColor: "#3D2A1A" }} />
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
      className="relative overflow-hidden pt-16 min-h-[80vh] lg:min-h-[92vh] flex flex-col justify-center"
      style={{ backgroundColor: "#0D0A07" }}
    >
      {/* Layer 2: Photographic fitness scene — right 62% */}
      <HeroBackgroundScene />

      {/* Bottom fade into the next section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: 120,
          background: "linear-gradient(to bottom, transparent, #0D0A07)",
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
                  backgroundColor: "rgba(245,200,66,0.10)",
                  border: "1px solid rgba(245,200,66,0.30)",
                  color: "#F5C842",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#8B9E6E" }} />
                Beta Access · Limited Spots
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-[68px] font-bebas tracking-wide leading-[0.95]"
              style={{ color: "#E8E0D0" }}
            >
              AI nutrition
              <br />
              <span style={{ color: "#F5C842" }}>for athletes.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={itemVariants}
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: "rgba(232,224,208,0.60)" }}
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
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: "#F5C842", color: "#1C1410", boxShadow: "0 6px 24px rgba(245,200,66,0.28)" }}
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-colors"
                style={{ backgroundColor: "rgba(255,220,150,0.06)", border: "1px solid rgba(255,220,150,0.20)", color: "#E8E0D0" }}
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
                  style={{ backgroundColor: "rgba(255,220,150,0.05)", borderColor: "rgba(255,220,150,0.15)", color: "rgba(232,224,208,0.55)" }}
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
          <path d="M0,60 L0,35 Q360,0 720,30 Q1080,55 1440,25 L1440,60 Z" fill="#1C1410" />
        </svg>
      </div>
    </section>
  );
}
