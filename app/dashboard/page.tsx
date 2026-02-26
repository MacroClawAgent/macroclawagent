import { ActivityRings } from "@/components/dashboard/ActivityRings";
import { MealCards } from "@/components/dashboard/MealCards";
import { StravaActivity } from "@/components/dashboard/StravaActivity";
import { AgentChat } from "@/components/dashboard/AgentChat";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Droplets, Scale } from "lucide-react";
import { redirect } from "next/navigation";

const quickStats = [
  {
    label: "Calories Burned",
    value: "1,640",
    unit: "kcal",
    icon: <Zap className="w-5 h-5" />,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    change: "+12%",
    changeColor: "text-orange-400",
  },
  {
    label: "Protein Target",
    value: "87",
    unit: "/ 120g",
    icon: <Scale className="w-5 h-5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    change: "73%",
    changeColor: "text-emerald-400",
  },
  {
    label: "Hydration",
    value: "1.8",
    unit: "/ 3.0L",
    icon: <Droplets className="w-5 h-5" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    change: "60%",
    changeColor: "text-blue-400",
  },
];

async function getUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }
    // Try to fetch full name from public.users
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, avatar_url, profile_complete")
      .eq("id", user.id)
      .single();
    if (!profile?.profile_complete) {
      redirect("/onboarding");
    }
    return {
      email: user.email ?? "",
      full_name: profile.full_name ?? null,
      avatar_url: profile.avatar_url ?? null,
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
  const user = await getUser();

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Greeting row */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              {getGreeting(user?.full_name ?? null)}
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
            <ActivityRings />
          </div>

          {/* Meal Cards — spans 3 columns */}
          <div className="lg:col-span-3">
            <MealCards />
          </div>

          {/* Strava Activity — full width bottom */}
          <div className="lg:col-span-4">
            <StravaActivity />
          </div>
        </div>
      </div>

      {/* Floating Agent Chat */}
      <AgentChat />
    </>
  );
}
