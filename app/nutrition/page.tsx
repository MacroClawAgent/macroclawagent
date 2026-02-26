"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Sparkles, Droplets, TrendingUp, ChevronRight } from "lucide-react";

const macros = [
  { label: "Calories", current: 1640, target: 2240, color: "#F97316", bg: "bg-orange-500/10", text: "text-orange-400", unit: "kcal" },
  { label: "Protein", current: 87, target: 120, color: "#10B981", bg: "bg-emerald-500/10", text: "text-emerald-400", unit: "g" },
  { label: "Carbs", current: 180, target: 250, color: "#F59E0B", bg: "bg-amber-500/10", text: "text-amber-400", unit: "g" },
  { label: "Fat", current: 44, target: 70, color: "#8B5CF6", bg: "bg-violet-500/10", text: "text-violet-400", unit: "g" },
];

const weeklyCalories = [
  { day: "Mon", kcal: 2180, target: 2240 },
  { day: "Tue", kcal: 1920, target: 2240 },
  { day: "Wed", kcal: 2340, target: 2240 },
  { day: "Thu", kcal: 1640, target: 2240 },
  { day: "Fri", kcal: 0, target: 2240 },
  { day: "Sat", kcal: 0, target: 2240 },
  { day: "Sun", kcal: 0, target: 2240 },
];

const mealLog = [
  { time: "7:30 AM", name: "Green Protein Bowl", calories: 520, protein: 34, carbs: 48, fat: 15, tag: "Breakfast" },
  { time: "12:15 PM", name: "Quinoa Power Salad", calories: 480, protein: 28, carbs: 62, fat: 14, tag: "Lunch" },
  { time: "3:00 PM", name: "Greek Yogurt + Almonds", calories: 280, protein: 16, carbs: 18, fat: 11, tag: "Snack" },
  { time: "7:00 PM", name: "Dinner pending", calories: 0, protein: 0, carbs: 0, fat: 0, tag: "Dinner", pending: true },
];

export default function NutritionPage() {
  const router = useRouter();
  const [hydration, setHydration] = useState(5);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setAuthorized(true); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setAuthorized(true);
    });
  }, [router]);

  if (!authorized) return null;

  const todayIndex = 3; // Thursday = index 3 in weekly data
  const maxBar = Math.max(...weeklyCalories.map((d) => d.target));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Nutrition</p>
            <h1 className="text-2xl font-black text-slate-100">Today&apos;s Nutrition</h1>
            <p className="text-sm text-slate-500 mt-0.5">Thursday, February 26</p>
          </div>
          <Link
            href="/agent"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Generate Meal Plan
          </Link>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Left: Macro bars */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200">Daily Macros</h2>
              <span className="text-xs text-indigo-400 font-semibold">73% complete</span>
            </div>

            {macros.map((m, i) => {
              const pct = Math.min(Math.round((m.current / m.target) * 100), 100);
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-sm text-slate-400">{m.label}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      <span className="text-slate-200 font-bold">{m.current}</span>/{m.target}{m.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}

            {/* Summary numbers */}
            <div className="mt-2 pt-4 border-t border-white/[0.07] grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/[0.03] rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Consumed</p>
                <p className="text-xl font-black text-slate-100">1,640</p>
                <p className="text-xs text-slate-600">kcal</p>
              </div>
              <div className="text-center p-3 bg-white/[0.03] rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Remaining</p>
                <p className="text-xl font-black text-orange-400">600</p>
                <p className="text-xs text-slate-600">kcal</p>
              </div>
            </div>
          </div>

          {/* Right: Meal log */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-200">Today&apos;s Meals</h2>
              <Link href="/meal-plans" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                All plans <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {mealLog.map((meal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all cursor-pointer hover:border-white/[0.12] ${
                  meal.pending
                    ? "border-white/[0.04] bg-white/[0.02] opacity-50"
                    : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                <div className="w-16 text-center shrink-0">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">{meal.tag}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{meal.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{meal.name}</p>
                  {!meal.pending && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-orange-400 font-medium">{meal.calories} kcal</span>
                      <span className="text-[11px] text-emerald-400">{meal.protein}g P</span>
                      <span className="text-[11px] text-amber-400">{meal.carbs}g C</span>
                      <span className="text-[11px] text-violet-400">{meal.fat}g F</span>
                    </div>
                  )}
                </div>
                {meal.pending && (
                  <Link href="/agent" className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/20 transition-colors shrink-0">
                    Plan
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom row: weekly chart + hydration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Weekly calorie chart */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-200">This Week</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">+8%</span> vs last week
              </div>
            </div>
            <div className="flex items-end gap-2 h-28">
              {weeklyCalories.map((d, i) => {
                const h = d.kcal ? Math.round((d.kcal / maxBar) * 100) : 0;
                const isToday = i === todayIndex;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                      {d.kcal > 0 ? (
                        <motion.div
                          className={`w-full rounded-t-lg ${isToday ? "bg-indigo-500" : "bg-white/[0.08]"}`}
                          style={{ height: `${h}%` }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                          title={`${d.kcal} kcal`}
                        />
                      ) : (
                        <div className="w-full rounded-t-lg bg-white/[0.03] border border-dashed border-white/[0.06]" style={{ height: "20%" }} />
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold ${isToday ? "text-indigo-300" : "text-slate-600"}`}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hydration tracker */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200">Hydration</h2>
              <span className="text-xs text-blue-400 font-semibold">{hydration}/8 glasses</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 -mt-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>{(hydration * 250 / 1000).toFixed(2)}L of 2.0L target</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {Array.from({ length: 8 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setHydration(i < hydration ? i : i + 1)}
                  className={`h-12 rounded-xl flex items-center justify-center transition-all duration-200 text-lg ${
                    i < hydration
                      ? "bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                      : "bg-white/[0.03] border border-white/[0.06] text-slate-700 hover:text-slate-500 hover:bg-white/[0.06]"
                  }`}
                  title={i < hydration ? "Click to remove" : "Click to add"}
                >
                  💧
                </button>
              ))}
            </div>
            <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                animate={{ width: `${(hydration / 8) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
