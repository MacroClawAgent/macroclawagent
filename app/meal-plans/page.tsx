"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Sparkles, ChevronDown, ShoppingBag, CheckCircle2, Clock, Flame } from "lucide-react";

type PlanStatus = "delivered" | "ordered" | "built" | "pending";

interface MealPlan {
  id: number;
  date: string;
  label: string;
  status: PlanStatus;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  activity: string;
  meals: { name: string; calories: number; protein: number; carbs: number; tag: string }[];
}

const plans: MealPlan[] = [
  {
    id: 1, date: "Today — Feb 26", label: "Morning Run Recovery", status: "pending",
    totalCalories: 1640, totalProtein: 87, totalCarbs: 180, totalFat: 44,
    activity: "5.2km Morning Run · 312 kcal",
    meals: [
      { name: "Green Protein Bowl", calories: 520, protein: 34, carbs: 48, tag: "Breakfast" },
      { name: "Quinoa Power Salad", calories: 480, protein: 28, carbs: 62, tag: "Lunch" },
      { name: "Greek Yogurt + Almonds", calories: 280, protein: 16, carbs: 18, tag: "Snack" },
      { name: "Salmon & Sweet Potato", calories: 640, protein: 45, carbs: 52, tag: "Dinner" },
    ],
  },
  {
    id: 2, date: "Feb 25", label: "Threshold Ride Day", status: "delivered",
    totalCalories: 2340, totalProtein: 142, totalCarbs: 280, totalFat: 68,
    activity: "32.1km Evening Ride · 780 kcal",
    meals: [
      { name: "Overnight Oats + Berries", calories: 520, protein: 24, carbs: 78, tag: "Breakfast" },
      { name: "Chicken & Rice Bowl", calories: 680, protein: 52, carbs: 72, tag: "Lunch" },
      { name: "Protein Shake", calories: 220, protein: 32, carbs: 18, tag: "Snack" },
      { name: "Beef Stir Fry & Noodles", calories: 720, protein: 48, carbs: 68, tag: "Dinner" },
    ],
  },
  {
    id: 3, date: "Feb 24", label: "Trail Run Refuel", status: "ordered",
    totalCalories: 2680, totalProtein: 168, totalCarbs: 310, totalFat: 78,
    activity: "12.4km Trail Run · 920 kcal",
    meals: [
      { name: "Banana + Nut Butter Toast", calories: 420, protein: 16, carbs: 62, tag: "Breakfast" },
      { name: "Tuna Power Bowl", calories: 580, protein: 48, carbs: 58, tag: "Lunch" },
      { name: "Greek Yogurt Parfait", calories: 340, protein: 24, carbs: 42, tag: "Snack" },
      { name: "Baked Salmon & Quinoa", calories: 760, protein: 58, carbs: 62, tag: "Dinner" },
    ],
  },
  {
    id: 4, date: "Feb 23", label: "Tempo Day Performance", status: "delivered",
    totalCalories: 2180, totalProtein: 128, totalCarbs: 256, totalFat: 58,
    activity: "8.0km Tempo Run · 468 kcal",
    meals: [
      { name: "Egg & Avocado Toast", calories: 480, protein: 24, carbs: 44, tag: "Breakfast" },
      { name: "Turkey & Farro Bowl", calories: 620, protein: 46, carbs: 68, tag: "Lunch" },
      { name: "Protein Bar", calories: 280, protein: 20, carbs: 28, tag: "Snack" },
      { name: "Chicken Pasta Pesto", calories: 680, protein: 44, carbs: 72, tag: "Dinner" },
    ],
  },
];

const statusConfig: Record<PlanStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  delivered: { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  ordered: { label: "Ordered", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: <Clock className="w-3 h-3" /> },
  built: { label: "Cart Ready", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", icon: <ShoppingBag className="w-3 h-3" /> },
  pending: { label: "Pending", color: "text-slate-400", bg: "bg-white/[0.05] border-white/[0.1]", icon: <Flame className="w-3 h-3" /> },
};

export default function MealPlansPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setAuthorized(true); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setAuthorized(true);
    });
  }, [router]);

  if (!authorized) return null;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      router.push("/agent");
    }, 800);
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
          {[
            { label: "Plans Generated", value: plans.length, color: "text-indigo-400" },
            { label: "Meals Delivered", value: plans.filter((p) => p.status === "delivered").reduce((a, p) => a + p.meals.length, 0), color: "text-emerald-400" },
            { label: "Avg Daily Calories", value: "2,310 kcal", color: "text-orange-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 rounded-xl text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Plan list */}
        <div className="flex flex-col gap-3">
          {plans.map((plan, i) => {
            const st = statusConfig[plan.status];
            const isOpen = expanded === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                {/* Card header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : plan.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-100">{plan.label}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.bg} ${st.color}`}>
                        {st.icon}
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{plan.date} · {plan.activity}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 text-sm mr-2">
                    <div className="text-center">
                      <p className="font-black text-orange-400">{plan.totalCalories.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-600">kcal</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-emerald-400">{plan.totalProtein}g</p>
                      <p className="text-[10px] text-slate-600">protein</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-amber-400">{plan.totalCarbs}g</p>
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
                          {plan.meals.map((meal, mi) => (
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

                        {plan.status === "pending" && (
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
          })}
        </div>
      </div>
    </AppShell>
  );
}
