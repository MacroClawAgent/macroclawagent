import { ActivityRings } from "@/components/dashboard/ActivityRings";
import { MealCards } from "@/components/dashboard/MealCards";
import { StravaActivity } from "@/components/dashboard/StravaActivity";
import { AgentChat } from "@/components/dashboard/AgentChat";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Bell, Settings, Zap, Droplets, Scale } from "lucide-react";

const quickStats = [
  {
    label: "Calories Burned",
    value: "1,640",
    unit: "kcal",
    icon: <Zap className="w-5 h-5" />,
    color: "text-green-400",
    bg: "bg-green-500/10",
    change: "+12%",
    changeColor: "text-green-400",
  },
  {
    label: "Protein Target",
    value: "87",
    unit: "/ 120g",
    icon: <Scale className="w-5 h-5" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    change: "73%",
    changeColor: "text-blue-400",
  },
  {
    label: "Hydration",
    value: "1.8",
    unit: "/ 3.0L",
    icon: <Droplets className="w-5 h-5" />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    change: "60%",
    changeColor: "text-cyan-400",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A1A0F]">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A1A0F]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-green-300/50 hover:text-green-300 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🦀</span>
              <span className="font-bold text-green-50">MacroClawAgent</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-green-50">Good morning, Athlete</p>
              <p className="text-xs text-green-300/40">Here&apos;s your plan for today</p>
            </div>
            <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-green-300/60 hover:text-green-300 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
            </button>
            <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-green-300/60 hover:text-green-300 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
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
                    <p className="text-xs text-green-300/50 font-medium">{stat.label}</p>
                    <p className="mt-2 text-2xl font-black text-green-50">
                      {stat.value}
                      <span className="text-sm font-normal text-green-300/40 ml-1">
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
