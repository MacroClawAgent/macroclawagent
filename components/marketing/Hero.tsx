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
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
              A
            </div>
          </div>

          {/* Calorie card */}
          <div className="mx-4 rounded-[22px] p-4" style={{ background: "linear-gradient(135deg, #0066EE 0%, #0052CC 100%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] text-blue-200 uppercase tracking-widest font-semibold mb-0.5">Today's Goal</p>
                <p className="text-[26px] font-black text-white leading-none">2,140</p>
                <p className="text-[8.5px] text-blue-200 mt-0.5">of 2,840 kcal</p>
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
                { label: "Protein", val: "142g", color: "text-orange-300" },
                { label: "Carbs", val: "220g", color: "text-blue-200" },
                { label: "Fat", val: "62g", color: "text-amber-300" },
              ].map((m) => (
                <div key={m.label}>
                  <p className={`text-[10px] font-black ${m.color}`}>{m.val}</p>
                  <p className="text-[7px] text-blue-300 font-medium">{m.label}</p>
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
          <div className="mx-4 mt-2 bg-blue-50 border border-blue-100 rounded-[18px] p-3 flex gap-2 items-start">
            <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[9px] text-white font-black">✦</span>
            </div>
            <div>
              <p className="text-[8px] font-bold text-blue-800 mb-0.5">Jonno Agent</p>
              <p className="text-[8.5px] text-blue-700 leading-relaxed">Protein 34g short today. Add grilled chicken to hit your target. 🎯</p>
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
                <div className={`w-1 h-1 rounded-full ${active ? "bg-blue-600" : "bg-transparent"}`} />
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

export function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-16"
      style={{ background: "linear-gradient(150deg, #F5ECE6 0%, #EFD9CC 40%, #C8E7F5 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(143,211,244,0.35) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(242,154,105,0.18) 0%, transparent 70%)" }} />
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(239,217,204,0.40) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">

          {/* ── LEFT: Content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8 items-center lg:items-start text-center lg:text-left pb-16 lg:pb-24"
          >
            {/* Beta badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide" style={{ backgroundColor: "rgba(242,154,105,0.15)", border: "1px solid rgba(242,154,105,0.35)", color: "#C4693A" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F29A69] animate-pulse" />
                Beta Access — Limited Spots
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-[68px] font-black tracking-tight leading-[0.92]"
              style={{ color: "#4A454A" }}
            >
              Fitness tracking
              <br />
              <span className="gradient-text-light">for your best days.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={itemVariants}
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: "#7C7472" }}
            >
              Sync Strava. Get AI macro targets. Order macro-matched meals from Uber Eats — all in one app.
              Nutrition that finally keeps up with your active lifestyle.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 items-center lg:items-start"
            >
              <Link
                href="/join"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-base font-bold transition-all hover:opacity-90 shadow-lg"
                style={{ background: "linear-gradient(135deg, #F29A69 0%, #E88367 100%)", boxShadow: "0 6px 24px rgba(242,154,105,0.35)" }}
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-colors shadow-sm"
                style={{ backgroundColor: "rgba(255,253,251,0.80)", border: "1px solid #CFC7C2", color: "#4A454A", backdropFilter: "blur(8px)" }}
              >
                See how it works
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="flex gap-8 justify-center lg:justify-start">
              {[
                { value: "12,400+", label: "Athletes" },
                { value: "94%", label: "Macro accuracy" },
                { value: "4.9★", label: "User rating" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center lg:items-start">
                  <span className="text-xl font-black" style={{ color: "#4A454A" }}>{s.value}</span>
                  <span className="text-xs font-medium" style={{ color: "#7C7472" }}>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Phone mockup ── */}
          <div className="flex justify-center lg:justify-end items-end pb-0">
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
          <path d="M0,60 L0,35 Q360,0 720,30 Q1080,55 1440,25 L1440,60 Z" fill="#FFFDFB" />
        </svg>
      </div>
    </section>
  );
}
