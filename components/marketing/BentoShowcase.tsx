"use client";

import { motion } from "framer-motion";
import { Bot, ShoppingBag, Flame, Check } from "lucide-react";
import Image from "next/image";

/* ── Mini SVG ring ── */
function Ring({
  pct,
  strokeColor,
  size = 64,
  strokeWidth = 6,
  label,
  value,
}: {
  pct: number;
  strokeColor: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  value: string;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-[11px] font-bold text-gray-700">{value}</span>
    </div>
  );
}

/* ── Card A: Dashboard ── */
function DashboardCard() {
  return (
    <div className="flex flex-col h-full overflow-hidden gap-5 p-6 rounded-[20px]" style={{ backgroundColor: "#FFFDFB", border: "2px solid #EFD9CC", boxShadow: "0 4px 20px rgba(74,69,74,0.07)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "#7C7472" }}>Dashboard</p>
          <h3 className="text-base font-bold" style={{ color: "#4A454A" }}>Today&apos;s Performance</h3>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #F29A69, #E88367)" }}>
          A
        </div>
      </div>

      {/* Activity rings */}
      <div className="flex items-center justify-around flex-1 py-2">
        <Ring pct={0.76} strokeColor="#f97316" size={72} strokeWidth={7} label="Calories" value="2140" />
        <Ring pct={0.79} strokeColor="#0066EE" size={72} strokeWidth={7} label="Protein" value="142g" />
        <Ring pct={0.64} strokeColor="#f59e0b" size={72} strokeWidth={7} label="Carbs" value="220g" />
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "647 kcal burned", color: "#E88367" },
          { label: "8.2km", color: "#7C7472" },
          { label: "74 BPM avg", color: "#F29A69" },
        ].map((s) => (
          <span
            key={s.label}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ color: s.color, backgroundColor: "#FAF4EF", border: "1px solid #E8DDD8" }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Card B: Jonno Agent chat ── */
function AgentCard() {
  return (
    <div className="flex flex-col h-full overflow-hidden gap-4 p-5 rounded-[20px]" style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 4px 16px rgba(74,69,74,0.06)" }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8FD3F4, #69BDEB)" }}>
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-[11px] font-bold" style={{ color: "#4A454A" }}>Jonno Agent</p>
          <p className="text-[10px] flex items-center gap-1" style={{ color: "#69BDEB" }}>
            <span className="w-1 h-1 rounded-full bg-[#8FD3F4] animate-pulse inline-block" />
            Online
          </p>
        </div>
      </div>

      {/* Chat bubbles */}
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        {/* User */}
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] max-w-[85%]" style={{ backgroundColor: "#FAF4EF", border: "1px solid #E8DDD8", color: "#4A454A" }}>
            What should I eat before my long run?
          </div>
        </div>
        {/* Agent */}
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] text-white leading-snug max-w-[90%]" style={{ background: "linear-gradient(135deg, #8FD3F4, #69BDEB)" }}>
            Based on your 15km plan, aim for 80g carbs 3hrs before. Oat porridge + banana fits perfectly.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Card C: Smart Cart ── */
function CartCard() {
  const meals = [
    { name: "Grilled Salmon Bowl", macros: "42P · 38C · 18F", price: "$18.50" },
    { name: "Greek Chicken Wrap", macros: "38P · 52C · 14F", price: "$13.90" },
    { name: "Quinoa Power Bowl", macros: "22P · 68C · 12F", price: "$15.20" },
  ];
  return (
    <div className="flex flex-col h-full overflow-hidden gap-4 p-5 rounded-[20px]" style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 4px 16px rgba(74,69,74,0.06)" }}>
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4" style={{ color: "#8FD3F4" }} />
        <p className="text-sm font-bold" style={{ color: "#4A454A" }}>Smart Cart</p>
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: "#69BDEB", backgroundColor: "rgba(143,211,244,0.12)", border: "1px solid rgba(105,189,235,0.30)" }}>
          Macro-matched
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {meals.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: "#FAF4EF", border: "1px solid #E8DDD8" }}
          >
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "#4A454A" }}>{m.name}</p>
              <p className="text-[10px] font-medium" style={{ color: "#7C7472" }}>{m.macros}</p>
            </div>
            <span className="text-[11px] font-bold flex-shrink-0" style={{ color: "#4A454A" }}>{m.price}</span>
          </div>
        ))}
      </div>

      <button className="w-full py-2 rounded-xl text-white text-[11px] font-bold tracking-wide transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg, #8FD3F4, #69BDEB)" }}>
        Build Cart →
      </button>
    </div>
  );
}

/* ── Card D: Strava Sync ── */
function StravaCard() {
  return (
    <div className="flex flex-col h-full overflow-hidden gap-4 p-5 rounded-[20px]" style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 4px 16px rgba(74,69,74,0.06)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/strava.png" alt="Strava" width={16} height={16} className="object-contain" />
          <p className="text-sm font-bold" style={{ color: "#4A454A" }}>Strava Sync</p>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: "#F29A69" }}>● Live</span>
      </div>
      <div>
        <p className="text-[11px] mb-0.5" style={{ color: "#7C7472" }}>Last activity synced 2 min ago</p>
        <p className="text-sm font-bold" style={{ color: "#4A454A" }}>Morning Ride</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#7C7472" }}>28.4km · 1h 12m · 924 kcal</p>
      </div>
      <div className="flex items-end gap-0.5 h-8">
        {[45, 60, 40, 75, 65, 85, 55, 70, 80, 50, 65, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{ height: `${h}%`, backgroundColor: "#F29A69" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Card E: Macro Target ── */
function MacroCard() {
  return (
    <div className="flex flex-col h-full overflow-hidden gap-3 p-5 rounded-[20px] justify-center text-white" style={{ background: "linear-gradient(135deg, #F29A69 0%, #E88367 100%)", boxShadow: "0 6px 24px rgba(242,154,105,0.30)" }}>
      <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,253,251,0.70)" }}>Daily Target</p>
      <div>
        <p className="text-4xl font-black text-white leading-none">2,840</p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,253,251,0.75)" }}>kcal today</p>
      </div>
      <div className="flex gap-3 mt-1">
        {[
          { macro: "P", val: "180g", color: "rgba(255,253,251,0.90)" },
          { macro: "C", val: "280g", color: "rgba(255,253,251,0.90)" },
          { macro: "F", val: "95g", color: "rgba(255,253,251,0.90)" },
        ].map((m) => (
          <div key={m.macro} className="flex flex-col">
            <span className="text-[10px] font-bold" style={{ color: "rgba(255,253,251,0.60)" }}>{m.macro}</span>
            <span className="text-xs font-semibold text-white">{m.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Card F: Streak ── */
function StreakCard() {
  const days = Array.from({ length: 28 }, (_, i) => i < 14 || (i >= 18 && i < 21));
  return (
    <div className="flex flex-col h-full overflow-hidden gap-3 p-5 rounded-[20px]" style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 4px 16px rgba(74,69,74,0.06)" }}>
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4" style={{ color: "#F29A69" }} />
        <p className="text-sm font-bold" style={{ color: "#4A454A" }}>Streak</p>
      </div>
      <div>
        <p className="text-3xl font-black leading-none" style={{ color: "#4A454A" }}>14</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#7C7472" }}>consecutive days</p>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((active, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            style={{ backgroundColor: active ? "#F29A69" : "#EFD9CC" }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#8FD3F4" }}>
        <Check className="w-3 h-3" />
        All macros hit yesterday
      </div>
    </div>
  );
}

export function BentoShowcase() {
  return (
    <section className="relative py-28 px-6 overflow-hidden" style={{ background: "linear-gradient(160deg, #FAF4EF 0%, #F5ECE6 50%, #EEF7FD 100%)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#F29A69" }}>
            Product Preview
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: "#4A454A" }}>
            Everything you need.{" "}
            <span className="gradient-text-light">Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto" style={{ color: "#7C7472" }}>
            One platform. Activity intelligence, AI meal planning, and smart food delivery — all connected.
          </p>
        </motion.div>

        {/* Bento — unified 6-col grid, rows 1-2 are 200px each */}
        <div className="grid grid-cols-1 lg:grid-cols-6 lg:grid-rows-[200px_200px_220px] gap-4">
          {/* Dashboard — 4 cols × 2 rows = 416px tall */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="lg:col-span-4 lg:row-span-2 min-h-[300px]"
          >
            <DashboardCard />
          </motion.div>

          {/* Agent — 2 cols × 1 row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="lg:col-span-2 min-h-[160px]"
          >
            <AgentCard />
          </motion.div>

          {/* Cart — 2 cols × 1 row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="lg:col-span-2 min-h-[160px]"
          >
            <CartCard />
          </motion.div>

          {/* Strava — 2 cols × 1 row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="lg:col-span-2 min-h-[180px]"
          >
            <StravaCard />
          </motion.div>

          {/* Macro — 2 cols × 1 row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="lg:col-span-2 min-h-[180px]"
          >
            <MacroCard />
          </motion.div>

          {/* Streak — 2 cols × 1 row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="lg:col-span-2 min-h-[180px]"
          >
            <StreakCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
