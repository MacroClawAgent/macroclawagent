"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Sparkles, Droplets, TrendingUp, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { NutritionLog, UserGoals, MealItem, WeeklyDay } from "@/types/database";

interface NutritionTodayResponse {
  today: NutritionLog | null;
  goals: UserGoals;
  mealLog: MealItem[];
  weeklyCalories: WeeklyDay[];
}

const MACRO_CONFIG = [
  { key: "calories_consumed" as const, label: "Calories", color: "#F97316", unit: "kcal", goalKey: "calorie_goal" as const },
  { key: "protein_g"         as const, label: "Protein",  color: "#10B981", unit: "g",    goalKey: "protein_goal" as const },
  { key: "carbs_g"           as const, label: "Carbs",    color: "#F59E0B", unit: "g",    goalKey: "carbs_goal"   as const },
  { key: "fat_g"             as const, label: "Fat",      color: "#8B5CF6", unit: "g",    goalKey: "fat_goal"     as const },
];

export default function NutritionPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [data, setData] = useState<NutritionTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydration, setHydration] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setAuthorized(true); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setAuthorized(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    fetch("/api/nutrition/today")
      .then((r) => r.json())
      .then((d: NutritionTodayResponse) => {
        setData(d);
        // Hydration in glasses (250ml each)
        setHydration(Math.round((d.today?.hydration_ml ?? 0) / 250));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authorized]);

  const handleHydration = useCallback(async (newGlasses: number) => {
    setHydration(newGlasses);
    const ml = newGlasses * 250;
    try {
      await fetch("/api/nutrition/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hydration_ml: ml }),
      });
    } catch (e) {
      console.error("Hydration save failed:", e);
    }
  }, []);

  if (!authorized) return null;

  const today = data?.today ?? null;
  const goals = data?.goals ?? { calorie_goal: 2000, protein_goal: 120, carbs_goal: 250, fat_goal: 70 };
  const mealLog = data?.mealLog ?? [];
  const weeklyCalories = data?.weeklyCalories ?? [];
  const maxBar = Math.max(...(weeklyCalories.map((d) => d.target)), 1);
  const todayDay = new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);

  const macroValues = {
    calories_consumed: today?.calories_consumed ?? 0,
    protein_g: Math.round(today?.protein_g ?? 0),
    carbs_g: Math.round(today?.carbs_g ?? 0),
    fat_g: Math.round(today?.fat_g ?? 0),
  };

  const totalConsumed = macroValues.calories_consumed;
  const remaining = Math.max(goals.calorie_goal - totalConsumed, 0);
  const overallPct = goals.calorie_goal > 0 ? Math.min(Math.round((totalConsumed / goals.calorie_goal) * 100), 100) : 0;

  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Nutrition</p>
            <h1 className="text-2xl font-black text-slate-100">Today&apos;s Nutrition</h1>
            <p className="text-sm text-slate-500 mt-0.5">{dateLabel}</p>
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
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <span className="text-xs text-indigo-400 font-semibold">{overallPct}% complete</span>
              )}
            </div>

            {MACRO_CONFIG.map((m, i) => {
              const current = macroValues[m.key];
              const target = goals[m.goalKey];
              const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
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
                    {loading ? (
                      <Skeleton className="h-3 w-24" />
                    ) : (
                      <span className="text-xs font-mono text-slate-500">
                        <span className="text-slate-200 font-bold">{current}</span>/{target}{m.unit}
                      </span>
                    )}
                  </div>
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    {loading ? (
                      <Skeleton className="h-full rounded-full" />
                    ) : (
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: m.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Summary numbers */}
            <div className="mt-2 pt-4 border-t border-white/[0.07] grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/[0.03] rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Consumed</p>
                {loading ? <Skeleton className="h-7 w-16 mx-auto" /> : (
                  <p className="text-xl font-black text-slate-100">{totalConsumed.toLocaleString()}</p>
                )}
                <p className="text-xs text-slate-600">kcal</p>
              </div>
              <div className="text-center p-3 bg-white/[0.03] rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Remaining</p>
                {loading ? <Skeleton className="h-7 w-16 mx-auto" /> : (
                  <p className="text-xl font-black text-orange-400">{remaining.toLocaleString()}</p>
                )}
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

            {loading ? (
              [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : mealLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="w-7 h-7 text-indigo-400 mb-2 opacity-50" />
                <p className="text-sm text-slate-500">No meal plan for today</p>
                <Link href="/agent" className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Generate one with the Agent →
                </Link>
              </div>
            ) : (
              mealLog.map((meal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all cursor-pointer"
                >
                  <div className="w-16 text-center shrink-0">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">{meal.tag}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{meal.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-orange-400 font-medium">{meal.calories} kcal</span>
                      <span className="text-[11px] text-emerald-400">{meal.protein}g P</span>
                      <span className="text-[11px] text-amber-400">{meal.carbs}g C</span>
                      <span className="text-[11px] text-violet-400">{meal.fat}g F</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
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
                <span className="text-emerald-400 font-semibold">Calorie tracker</span>
              </div>
            </div>
            {loading ? (
              <div className="flex items-end gap-2 h-28">
                {[0,1,2,3,4,5,6].map((i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <Skeleton className="w-full rounded-t-lg" style={{ height: `${40 + i * 8}%` }} />
                    <Skeleton className="h-3 w-6" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-2 h-28">
                {weeklyCalories.map((d, i) => {
                  const h = d.kcal ? Math.round((d.kcal / maxBar) * 100) : 0;
                  const isToday = d.day === todayDay;
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
            )}
          </div>

          {/* Hydration tracker */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200">Hydration</h2>
              <span className="text-xs text-blue-400 font-semibold">{hydration}/8 glasses</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 -mt-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>{((hydration * 250) / 1000).toFixed(2)}L of 2.0L target</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {Array.from({ length: 8 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleHydration(i < hydration ? i : i + 1)}
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
