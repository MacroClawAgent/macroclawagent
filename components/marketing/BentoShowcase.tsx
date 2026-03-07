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
    <div className="flex flex-col h-full overflow-hidden gap-5 p-6 rounded-[20px]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "#6B7280" }}>Dashboard</p>
          <h3 className="text-base font-bold" style={{ color: "#1C1C1E" }}>Today&apos;s Performance</h3>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "#4C7DFF" }}>
          A
        </div>
      </div>

      {/* Activity rings */}
      <div className="flex items-center justify-around flex-1 py-2">
        <Ring pct={0.76} strokeColor="#20C7B7" size={72} strokeWidth={7} label="Calories" value="2140" />
        <Ring pct={0.79} strokeColor="#4C7DFF" size={72} strokeWidth={7} label="Protein" value="142g" />
        <Ring pct={0.64} strokeColor="#22C55E" size={72} strokeWidth={7} label="Carbs" value="220g" />
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "647 kcal burned", color: "#20C7B7" },
          { label: "8.2km", color: "#6B7280" },
          { label: "74 BPM avg", color: "#4C7DFF" },
        ].map((s) => (
          <span
            key={s.label}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ color: s.color, backgroundColor: "#F4F5F7", border: "1px solid #E5E7EB" }}
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
    <div className="flex flex-col h-full overflow-hidden gap-4 p-5 rounded-[20px]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#20C7B7" }}>
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-[11px] font-bold" style={{ color: "#1C1C1E" }}>Jonno Agent</p>
          <p className="text-[10px] flex items-center gap-1" style={{ color: "#20C7B7" }}>
            <span className="w-1 h-1 rounded-full animate-pulse inline-block" style={{ backgroundColor: "#20C7B7" }} />
            Online
          </p>
        </div>
      </div>

      {/* Chat bubbles */}
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        {/* User */}
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] max-w-[85%]" style={{ backgroundColor: "#F4F5F7", border: "1px solid #E5E7EB", color: "#1C1C1E" }}>
            What should I eat before my long run?
          </div>
        </div>
        {/* Agent */}
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] text-white leading-snug max-w-[90%]" style={{ backgroundColor: "#20C7B7" }}>
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
    <div className="flex flex-col h-full overflow-hidden gap-4 p-5 rounded-[20px]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4" style={{ color: "#22C55E" }} />
        <p className="text-sm font-bold" style={{ color: "#1C1C1E" }}>Smart Cart</p>
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: "#22C55E", backgroundColor: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)" }}>
          Macro-matched
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {meals.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: "#F4F5F7", border: "1px solid #E5E7EB" }}
          >
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "#1C1C1E" }}>{m.name}</p>
              <p className="text-[10px] font-medium" style={{ color: "#6B7280" }}>{m.macros}</p>
            </div>
            <span className="text-[11px] font-bold flex-shrink-0" style={{ color: "#1C1C1E" }}>{m.price}</span>
          </div>
        ))}
      </div>

      <button className="w-full py-2 rounded-xl text-white text-[11px] font-bold tracking-wide transition-opacity hover:opacity-90" style={{ backgroundColor: "#22C55E" }}>
        Build Cart →
      </button>
    </div>
  );
}

/* ── Card D: Strava Sync ── */
function StravaCard() {
  return (
    <div className="flex flex-col h-full overflow-hidden gap-4 p-5 rounded-[20px]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/strava.png" alt="Strava" width={16} height={16} className="object-contain" />
          <p className="text-sm font-bold" style={{ color: "#1C1C1E" }}>Strava Sync</p>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: "#22C55E" }}>● Live</span>
      </div>
      <div>
        <p className="text-[11px] mb-0.5" style={{ color: "#6B7280" }}>Last activity synced 2 min ago</p>
        <p className="text-sm font-bold" style={{ color: "#1C1C1E" }}>Morning Ride</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>28.4km · 1h 12m · 924 kcal</p>
      </div>
      <div className="flex items-end gap-0.5 h-8">
        {[45, 60, 40, 75, 65, 85, 55, 70, 80, 50, 65, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{ height: `${h}%`, backgroundColor: "#20C7B7" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Card E: Macro Target ── */
function MacroCard() {
  return (
    <div className="flex flex-col h-full overflow-hidden gap-3 p-5 rounded-[20px] justify-center text-white" style={{ background: "linear-gradient(135deg, #4C7DFF 0%, #3A6FEE 100%)", boxShadow: "0 6px 24px rgba(76,125,255,0.28)" }}>
      <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>Daily Target</p>
      <div>
        <p className="text-4xl font-black text-white leading-none">2,840</p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.70)" }}>kcal today</p>
      </div>
      <div className="flex gap-3 mt-1">
        {[
          { macro: "P", val: "180g" },
          { macro: "C", val: "280g" },
          { macro: "F", val: "95g" },
        ].map((m) => (
          <div key={m.macro} className="flex flex-col">
            <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>{m.macro}</span>
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
    <div className="flex flex-col h-full overflow-hidden gap-3 p-5 rounded-[20px]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4" style={{ color: "#20C7B7" }} />
        <p className="text-sm font-bold" style={{ color: "#1C1C1E" }}>Streak</p>
      </div>
      <div>
        <p className="text-3xl font-black leading-none" style={{ color: "#1C1C1E" }}>14</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>consecutive days</p>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((active, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            style={{ backgroundColor: active ? "#20C7B7" : "#E5E7EB" }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#22C55E" }}>
        <Check className="w-3 h-3" />
        All macros hit yesterday
      </div>
    </div>
  );
}

export function BentoShowcase() {
  return (
    <section className="relative py-28 px-6 overflow-hidden" style={{ backgroundColor: "#F4F5F7" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#20C7B7" }}>
            Product Preview
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: "#1C1C1E" }}>
            Everything you need.{" "}
            <span style={{ color: "#20C7B7" }}>Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto" style={{ color: "#6B7280" }}>
            One platform. Activity intelligence, AI meal planning and smart food delivery. All connected.
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
