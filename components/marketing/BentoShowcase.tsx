"use client";

import { motion } from "framer-motion";
import { Activity, Bot, ShoppingBag, Flame, Check } from "lucide-react";

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
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className="text-[11px] font-bold text-slate-200">{value}</span>
    </div>
  );
}

/* ── Card A: Dashboard ── */
function DashboardCard() {
  return (
    <div className="flex flex-col gap-5 p-6 glass-card glow-border rounded-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Dashboard</p>
          <h3 className="text-base font-bold text-slate-100">Today&apos;s Performance</h3>
        </div>
        <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
          A
        </div>
      </div>

      {/* Activity rings */}
      <div className="flex items-center justify-around py-6">
        <Ring pct={0.76} strokeColor="#f97316" size={72} strokeWidth={7} label="Calories" value="2140" />
        <Ring pct={0.79} strokeColor="#10b981" size={72} strokeWidth={7} label="Protein" value="142g" />
        <Ring pct={0.64} strokeColor="#f59e0b" size={72} strokeWidth={7} label="Carbs" value="220g" />
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "647 kcal burned", color: "text-orange-400" },
          { label: "8.2km", color: "text-slate-300" },
          { label: "74 BPM avg", color: "text-red-400" },
        ].map((s) => (
          <span
            key={s.label}
            className={`text-[11px] font-semibold ${s.color} px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.07]`}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Card B: Claw Agent chat ── */
function AgentCard() {
  return (
    <div className="flex flex-col gap-4 p-5 glass-card rounded-2xl">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-200">Claw Agent</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Online
          </p>
        </div>
      </div>

      {/* Chat bubbles */}
      <div className="flex flex-col gap-2">
        {/* User */}
        <div className="flex justify-end">
          <div className="bg-white/[0.06] border border-white/[0.07] rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] text-slate-300 max-w-[85%]">
            What should I eat before my long run?
          </div>
        </div>
        {/* Agent */}
        <div className="flex justify-start">
          <div className="bg-indigo-600/20 border border-indigo-500/20 rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] text-indigo-200 leading-snug max-w-[90%]">
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
    <div className="flex flex-col gap-4 p-5 glass-card rounded-2xl">
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-emerald-400" />
        <p className="text-sm font-bold text-slate-100">Smart Cart</p>
        <span className="ml-auto text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Macro-matched
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {meals.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl"
          >
            <div>
              <p className="text-[11px] font-semibold text-slate-200">{m.name}</p>
              <p className="text-[10px] text-slate-500 font-medium">{m.macros}</p>
            </div>
            <span className="text-[11px] font-bold text-slate-300 flex-shrink-0">{m.price}</span>
          </div>
        ))}
      </div>

      <button className="w-full py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-wide hover:bg-emerald-600/30 transition-colors">
        Build Cart →
      </button>
    </div>
  );
}

/* ── Card D: Strava Sync ── */
function StravaCard() {
  return (
    <div className="flex flex-col gap-4 p-5 glass-card rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-400" />
          <p className="text-sm font-bold text-slate-100">Strava Sync</p>
        </div>
        <span className="text-[10px] text-emerald-400 font-semibold">● Live</span>
      </div>
      <div>
        <p className="text-[11px] text-slate-500 mb-0.5">Last activity synced 2 min ago</p>
        <p className="text-sm font-bold text-slate-100">Morning Ride</p>
        <p className="text-[11px] text-slate-400 mt-0.5">28.4km · 1h 12m · 924 kcal</p>
      </div>
      <div className="flex items-end gap-0.5 h-8">
        {[45, 60, 40, 75, 65, 85, 55, 70, 80, 50, 65, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-orange-500/50"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Card E: Macro Target ── */
function MacroCard() {
  return (
    <div className="flex flex-col gap-3 p-5 glass-card rounded-2xl justify-center bg-gradient-to-br from-indigo-900/20 to-transparent">
      <p className="text-[11px] text-indigo-400 uppercase tracking-widest font-semibold">Daily Target</p>
      <div>
        <p className="text-4xl font-black text-slate-100 leading-none">2,840</p>
        <p className="text-sm text-slate-500 mt-1">kcal today</p>
      </div>
      <div className="flex gap-3 mt-1">
        {[
          { macro: "P", val: "180g", color: "text-emerald-400" },
          { macro: "C", val: "280g", color: "text-amber-400" },
          { macro: "F", val: "95g", color: "text-orange-400" },
        ].map((m) => (
          <div key={m.macro} className="flex flex-col">
            <span className={`text-[10px] font-bold ${m.color}`}>{m.macro}</span>
            <span className="text-xs font-semibold text-slate-300">{m.val}</span>
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
    <div className="flex flex-col gap-3 p-5 glass-card rounded-2xl">
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-400" />
        <p className="text-sm font-bold text-slate-100">Streak</p>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-100 leading-none">14</p>
        <p className="text-[11px] text-slate-500 mt-0.5">consecutive days</p>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((active, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm ${active ? "bg-indigo-500/60" : "bg-white/[0.05]"}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
        <Check className="w-3 h-3" />
        All macros hit yesterday
      </div>
    </div>
  );
}

export function BentoShowcase() {
  return (
    <section className="relative py-28 px-6 bg-mesh-section overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">
            Product Preview
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tight">
            Everything you need.{" "}
            <span className="gradient-text">Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            One platform. Activity intelligence, AI meal planning, and smart food delivery — all connected.
          </p>
        </motion.div>

        {/* Bento — Top row: Dashboard left, Agent+Cart right */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Dashboard — wider left panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="w-full lg:w-[58%] flex-shrink-0"
          >
            <DashboardCard />
          </motion.div>

          {/* Agent + Cart stacked */}
          <div className="flex-1 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <AgentCard />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              <CartCard />
            </motion.div>
          </div>
        </div>

        {/* Bento — Bottom row: 3 equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <StravaCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <MacroCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24 }}
          >
            <StreakCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
