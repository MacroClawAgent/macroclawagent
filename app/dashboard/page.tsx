import { ActivityRings } from "@/components/dashboard/ActivityRings";
import { MealCards } from "@/components/dashboard/MealCards";
import { StravaActivity } from "@/components/dashboard/StravaActivity";
import { AgentChat } from "@/components/dashboard/AgentChat";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Bell, Settings, Zap, Droplets, Scale } from "lucide-react";
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
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();
    return {
      email: user.email ?? "",
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
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
    <div className="min-h-screen bg-[#08090D]">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#08090D]/80 border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🦀</span>
              <span className="font-bold text-slate-100">MacroClawAgent</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-100">
                {getGreeting(user?.full_name ?? null)}
              </p>
              <p className="text-xs text-slate-500">Here&apos;s your plan for today</p>
            </div>

            {/* Avatar or initials */}
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt="Profile"
                className="w-9 h-9 rounded-xl object-cover border border-white/10"
              />
            ) : user?.full_name ? (
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                {user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            ) : null}

            <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>
            <Link
              href="/profile"
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
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
      </main>

      {/* Floating Agent Chat */}
      <AgentChat />
    </div>
  );
}
