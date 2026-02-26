"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Sparkles, ChevronDown, ShoppingBag, CheckCircle2, Clock, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MealPlanRow } from "@/types/database";

type PlanStatus = "delivered" | "ordered" | "built" | "pending";

const statusConfig: Record<PlanStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  delivered: { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  ordered:   { label: "Ordered",   color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",       icon: <Clock className="w-3 h-3" /> },
  built:     { label: "Cart Ready",color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20",   icon: <ShoppingBag className="w-3 h-3" /> },
  pending:   { label: "Pending",   color: "text-slate-400",   bg: "bg-white/[0.05] border-white/[0.1]",      icon: <Flame className="w-3 h-3" /> },
};

interface ApiStats {
  total_plans: number;
  delivered_count: number;
  avg_daily_calories: number;
}

export default function MealPlansPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [plans, setPlans] = useState<MealPlanRow[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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
    fetch("/api/meal-plans")
      .then((r) => r.json())
      .then((d) => {
        setPlans(d.plans ?? []);
        setStats(d.stats ?? null);
        if (d.plans?.length > 0) setExpanded(d.plans[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authorized]);

  if (!authorized) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/meal-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const { plan } = await res.json();
      if (plan) {
        setPlans((prev) => [plan, ...prev.filter((p) => p.id !== plan.id)]);
        setExpanded(plan.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">Meal Plans</p>
            <h1 className="text-2xl font-black text-slate-100">Your Meal Plans</h1>
            <p className="text-sm text-slate-500 mt-0.5">AI-generated, activity-matched nutrition</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70"
          >
            <Sparkles className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Generating…" : "Generate New Plan"}
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {loading ? (
            [0,1,2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : (
            [
              { label: "Plans Generated",    value: stats?.total_plans ?? plans.length, color: "text-indigo-400" },
              { label: "Meals Delivered",    value: stats?.delivered_count ?? 0,         color: "text-emerald-400" },
              { label: "Avg Daily Calories", value: stats ? `${stats.avg_daily_calories.toLocaleString()} kcal` : "—", color: "text-orange-400" },
            ].map((s) => (
              <div key={s.label} className="glass-card p-4 rounded-xl text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))
          )}
        </div>

        {/* Plan list */}
        <div className="flex flex-col gap-3">
          {loading ? (
            [0,1,2,3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No meal plans yet —{" "}
              <button onClick={handleGenerate} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                generate your first plan
              </button>
            </div>
          ) : (
            plans.map((plan, i) => {
              const status = (plan.status as PlanStatus) ?? "pending";
              const st = statusConfig[status] ?? statusConfig.pending;
              const isOpen = expanded === plan.id;
              const dateLabel = new Date(plan.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  {/* Card header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : plan.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-100">{plan.label ?? "Meal Plan"}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.bg} ${st.color}`}>
                          {st.icon}
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{dateLabel}{plan.activity_summary ? ` · ${plan.activity_summary}` : ""}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-5 text-sm mr-2">
                      <div className="text-center">
                        <p className="font-black text-orange-400">{(plan.total_calories ?? 0).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-600">kcal</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-emerald-400">{plan.total_protein ?? 0}g</p>
                        <p className="text-[10px] text-slate-600">protein</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-amber-400">{plan.total_carbs ?? 0}g</p>
                        <p className="text-[10px] text-slate-600">carbs</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Expanded meals */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-white/[0.06]">
                          <div className="pt-4 flex flex-col gap-2">
                            {(plan.meals ?? []).map((meal, mi) => (
                              <div key={mi} className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider w-16 shrink-0">{meal.tag}</span>
                                <span className="text-sm text-slate-300 flex-1">{meal.name}</span>
                                <div className="flex items-center gap-3 text-[11px]">
                                  <span className="text-orange-400 font-semibold">{meal.calories} kcal</span>
                                  <span className="text-emerald-400">{meal.protein}g P</span>
                                  <span className="text-amber-400 hidden sm:block">{meal.carbs}g C</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {status === "pending" && (
                            <div className="mt-4 flex gap-3">
                              <Link
                                href="/agent"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Refine with Agent
                              </Link>
                              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Build Uber Eats Cart
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
