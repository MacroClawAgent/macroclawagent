import { ActivityRings } from "@/components/dashboard/ActivityRings";
import { MealCards } from "@/components/dashboard/MealCards";
import { StravaActivity } from "@/components/dashboard/StravaActivity";
import { AgentChat } from "@/components/dashboard/AgentChat";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Droplets, Scale } from "lucide-react";
import { redirect } from "next/navigation";
import type { ActivityRow, MealItem } from "@/types/database";

async function getDashboardData() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("users")
      .select("full_name, avatar_url, profile_complete, calorie_goal, protein_goal, carbs_goal, fat_goal")
      .eq("id", user.id)
      .single();
    if (!profile?.profile_complete) redirect("/onboarding");

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    const [nutritionRes, mealPlanRes, activitiesRes] = await Promise.all([
      supabase
        .from("nutrition_logs")
        .select("calories_consumed,protein_g,carbs_g,fat_g,hydration_ml")
        .eq("user_id", user.id)
        .eq("date", today)
        .single(),
      supabase
        .from("meal_plans")
        .select("id,meals,label,cart_status,activity_summary")
        .eq("user_id", user.id)
        .eq("date", today)
        .single(),
      supabase
        .from("activities")
        .select("id,type,name,started_at,distance_meters,duration_seconds,calories,pace_seconds_per_km,speed_kmh,elevation_meters,avg_heart_rate")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(4),
    ]);

    const nutrition = nutritionRes.data;
    const mealPlan = mealPlanRes.data;
    const activities: ActivityRow[] = (activitiesRes.data ?? []) as ActivityRow[];
    const goals = {
      calorie_goal: profile.calorie_goal ?? 2000,
      protein_goal: profile.protein_goal ?? 120,
      carbs_goal: profile.carbs_goal ?? 250,
    };

    return {
      full_name: profile.full_name ?? null,
      avatar_url: profile.avatar_url ?? null,
      nutrition,
      mealPlan,
      activities,
      goals,
    };
  } catch {
    return null;
  }
}

function getGreeting(name: string | null) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const firstName = name ? name.split(" ")[0] : "Athlete";
  return `Good ${time}, ${firstName}`;
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const nutrition = data?.nutrition;
  const goals = data?.goals ?? { calorie_goal: 2000, protein_goal: 120, carbs_goal: 250 };
  const mealItems: MealItem[] = Array.isArray(data?.mealPlan?.meals) ? (data.mealPlan.meals as MealItem[]) : [];

  const caloriesPct = nutrition
    ? Math.round((nutrition.calories_consumed / goals.calorie_goal) * 100)
    : 0;
  const proteinPct = nutrition
    ? Math.round((nutrition.protein_g / goals.protein_goal) * 100)
    : 0;
  const hydrationL = nutrition ? (nutrition.hydration_ml / 1000).toFixed(1) : "0.0";

  const quickStats = [
    {
      label: "Calories Today",
      value: nutrition ? nutrition.calories_consumed.toLocaleString() : "—",
      unit: `/ ${goals.calorie_goal.toLocaleString()} kcal`,
      icon: <Zap className="w-5 h-5" />,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      change: nutrition ? `${caloriesPct}% of goal` : "No data yet",
      changeColor: "text-orange-400",
    },
    {
      label: "Protein Target",
      value: nutrition ? `${nutrition.protein_g}` : "—",
      unit: `/ ${goals.protein_goal}g`,
      icon: <Scale className="w-5 h-5" />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      change: nutrition ? `${proteinPct}% complete` : "No data yet",
      changeColor: "text-emerald-400",
    },
    {
      label: "Hydration",
      value: hydrationL,
      unit: "L today",
      icon: <Droplets className="w-5 h-5" />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      change: nutrition ? `${nutrition.hydration_ml >= 2000 ? "Goal reached!" : `${nutrition.hydration_ml}ml / 2000ml`}` : "No data yet",
      changeColor: nutrition?.hydration_ml >= 2000 ? "text-emerald-400" : "text-blue-400",
    },
  ];

  const rings = [
    { label: "Calories", current: nutrition?.calories_consumed ?? 0, target: goals.calorie_goal },
    { label: "Protein",  current: Math.round(nutrition?.protein_g ?? 0), target: goals.protein_goal },
    { label: "Carbs",    current: Math.round(nutrition?.carbs_g ?? 0), target: goals.carbs_goal },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Greeting row */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              {getGreeting(data?.full_name ?? null)}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here&apos;s your performance overview for today
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">Strava synced</span>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {quickStats.map((stat, i) => (
            <Card key={i} className="glass-card border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-100">
                      {stat.value}
                      <span className="text-sm font-normal text-slate-500 ml-1">
                        {stat.unit}
                      </span>
                    </p>
                    <p className={`text-xs font-semibold mt-1 ${stat.changeColor}`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Activity Ring — tall left column */}
          <div className="lg:col-span-1">
            <ActivityRings rings={rings} />
          </div>

          {/* Meal Cards — spans 3 columns */}
          <div className="lg:col-span-3">
            <MealCards meals={mealItems} />
          </div>

          {/* Strava Activity — full width bottom */}
          <div className="lg:col-span-4">
            <StravaActivity activities={data?.activities} />
          </div>
        </div>
      </div>

      {/* Floating Agent Chat */}
      <AgentChat />
    </>
  );
}
