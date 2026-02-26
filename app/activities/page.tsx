"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app/AppShell";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Activity, Bike, Waves, RefreshCw, Flame, Clock, MapPin, Zap } from "lucide-react";

type ActivityType = "Run" | "Ride" | "Swim" | "Other";

interface StravaActivity {
  id: number;
  type: ActivityType;
  name: string;
  date: string;
  distance: string;
  duration: string;
  pace: string;
  kcal: number;
  elevation?: string;
  heartRate?: number;
}

const activities: StravaActivity[] = [
  { id: 1, type: "Run", name: "Morning Zone 2 Run", date: "Today, 6:45 AM", distance: "5.2 km", duration: "28 min", pace: "5:23/km", kcal: 312, elevation: "42m", heartRate: 148 },
  { id: 2, type: "Ride", name: "Evening Threshold Ride", date: "Yesterday, 5:30 PM", distance: "32.1 km", duration: "1h 4min", pace: "30.1 km/h", kcal: 780, elevation: "320m", heartRate: 162 },
  { id: 3, type: "Run", name: "Trail Run — Monte Serra", date: "Feb 24, 8:00 AM", distance: "12.4 km", duration: "1h 42min", pace: "8:03/km", kcal: 920, elevation: "810m", heartRate: 155 },
  { id: 4, type: "Run", name: "Tempo Run", date: "Feb 23, 7:00 AM", distance: "8.0 km", duration: "37 min", pace: "4:38/km", kcal: 468, elevation: "28m", heartRate: 172 },
  { id: 5, type: "Ride", name: "Recovery Spin", date: "Feb 22, 4:00 PM", distance: "18.5 km", duration: "45 min", pace: "24.7 km/h", kcal: 380, elevation: "95m", heartRate: 128 },
  { id: 6, type: "Run", name: "Long Slow Run", date: "Feb 21, 7:30 AM", distance: "16.8 km", duration: "1h 48min", pace: "6:26/km", kcal: 1050, elevation: "75m", heartRate: 142 },
  { id: 7, type: "Swim", name: "Pool Intervals", date: "Feb 20, 7:00 AM", distance: "2.4 km", duration: "52 min", pace: "2:10/100m", kcal: 640, heartRate: 145 },
  { id: 8, type: "Run", name: "Easy Recovery Run", date: "Feb 19, 6:30 AM", distance: "6.1 km", duration: "38 min", pace: "6:14/km", kcal: 295, elevation: "22m", heartRate: 138 },
];

const typeIcon = (type: ActivityType) => {
  if (type === "Ride") return <Bike className="w-4 h-4" />;
  if (type === "Swim") return <Waves className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
};

const typeColor = (type: ActivityType) => {
  if (type === "Ride") return "text-amber-400 bg-amber-500/10";
  if (type === "Swim") return "text-blue-400 bg-blue-500/10";
  return "text-orange-400 bg-orange-500/10";
};

const tabs = ["All", "Runs", "Rides", "Other"] as const;
type Tab = (typeof tabs)[number];

export default function ActivitiesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setAuthorized(true); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setAuthorized(true);
    });
  }, [router]);

  if (!authorized) return null;

  const filtered = activities.filter((a) => {
    if (activeTab === "All") return true;
    if (activeTab === "Runs") return a.type === "Run";
    if (activeTab === "Rides") return a.type === "Ride";
    return a.type === "Swim" || a.type === "Other";
  });

  const weekTotal = activities.slice(0, 4).reduce((acc, a) => ({
    kcal: acc.kcal + a.kcal,
    distance: acc.distance + parseFloat(a.distance),
  }), { kcal: 0, distance: 0 });

  const handleSync = async () => {
    setSyncing(true);
    await fetch("/api/strava/sync", { method: "POST" });
    setTimeout(() => setSyncing(false), 1500);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-1">Activities</p>
            <h1 className="text-2xl font-black text-slate-100">Your Activities</h1>
            <p className="text-sm text-slate-500 mt-0.5">Synced from Strava</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm font-semibold hover:bg-orange-500/20 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync Strava"}
          </button>
        </div>

        {/* Week stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "This Week Distance", value: `${weekTotal.distance.toFixed(1)} km`, icon: <MapPin className="w-4 h-4" />, color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Calories Burned", value: `${weekTotal.kcal.toLocaleString()} kcal`, icon: <Flame className="w-4 h-4" />, color: "text-red-400", bg: "bg-red-500/10" },
            { label: "Activities", value: `${activities.slice(0, 4).length} sessions`, icon: <Zap className="w-4 h-4" />, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Avg Duration", value: "52 min", icon: <Clock className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/10" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-lg font-black text-slate-100 mt-0.5">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] w-fit mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-500 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Activity list */}
        <div className="flex flex-col gap-3">
          {filtered.map((act, i) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === act.id ? null : act.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl ${typeColor(act.type)} flex items-center justify-center flex-shrink-0`}>
                  {typeIcon(act.type)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-slate-100 truncate">{act.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{act.date}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-slate-100">{act.distance}</p>
                    <p className="text-[10px] text-slate-600">distance</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-100">{act.duration}</p>
                    <p className="text-[10px] text-slate-600">time</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-100">{act.pace}</p>
                    <p className="text-[10px] text-slate-600">pace</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 ml-auto sm:ml-0">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-bold text-orange-400">{act.kcal}</span>
                </div>
              </button>

              {expanded === act.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-4 border-t border-white/[0.06]"
                >
                  <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider">Pace</p>
                      <p className="text-sm font-bold text-slate-200 mt-0.5">{act.pace}</p>
                    </div>
                    {act.elevation && (
                      <div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider">Elevation</p>
                        <p className="text-sm font-bold text-slate-200 mt-0.5">{act.elevation}</p>
                      </div>
                    )}
                    {act.heartRate && (
                      <div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider">Avg HR</p>
                        <p className="text-sm font-bold text-slate-200 mt-0.5">{act.heartRate} bpm</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider">Energy</p>
                      <p className="text-sm font-bold text-orange-400 mt-0.5">{act.kcal} kcal</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
