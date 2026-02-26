"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app/AppShell";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Activity, Bike, Waves, RefreshCw, Flame, Clock, MapPin, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityRow } from "@/types/database";

type Tab = "All" | "Runs" | "Rides" | "Other";
const tabs: Tab[] = ["All", "Runs", "Rides", "Other"];

function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m} min`;
}

function formatPace(secPerKm: number | null, speedKmh: number | null): string {
  if (secPerKm) {
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    return `${m}:${s.toString().padStart(2, "0")}/km`;
  }
  if (speedKmh) return `${speedKmh.toFixed(1)} km/h`;
  return "—";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const t = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff === 0) return `Today, ${t}`;
  if (diff === 1) return `Yesterday, ${t}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${t}`;
}

function typeIcon(type: string) {
  if (type === "Ride") return <Bike className="w-4 h-4" />;
  if (type === "Swim") return <Waves className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
}

function typeColor(type: string): string {
  if (type === "Ride") return "text-amber-400 bg-amber-500/10";
  if (type === "Swim") return "text-blue-400 bg-blue-500/10";
  return "text-orange-400 bg-orange-500/10";
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

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
    fetch("/api/activities?limit=50")
      .then((r) => r.json())
      .then((d) => setActivities(d.activities ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authorized]);

  if (!authorized) return null;

  const filtered = activities.filter((a) => {
    if (activeTab === "All") return true;
    if (activeTab === "Runs") return a.type === "Run";
    if (activeTab === "Rides") return a.type === "Ride";
    return a.type === "Swim" || a.type === "Other";
  });

  const weekActivities = activities.slice(0, 4);
  const weekTotalKcal = weekActivities.reduce((acc, a) => acc + a.calories, 0);
  const weekTotalDist = weekActivities.reduce((acc, a) => acc + a.distance_meters, 0);
  const avgDuration = weekActivities.length > 0
    ? Math.round(weekActivities.reduce((acc, a) => acc + a.duration_seconds, 0) / weekActivities.length / 60)
    : 0;

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
            { label: "This Week Distance", value: loading ? null : `${formatDistance(weekTotalDist)}`, icon: <MapPin className="w-4 h-4" />, color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Calories Burned",    value: loading ? null : `${weekTotalKcal.toLocaleString()} kcal`, icon: <Flame className="w-4 h-4" />, color: "text-red-400",    bg: "bg-red-500/10" },
            { label: "Activities",         value: loading ? null : `${weekActivities.length} sessions`, icon: <Zap className="w-4 h-4" />,   color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Avg Duration",       value: loading ? null : `${avgDuration} min`, icon: <Clock className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/10" },
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
              {s.value === null ? (
                <Skeleton className="h-5 w-24 mt-1" />
              ) : (
                <p className="text-lg font-black text-slate-100 mt-0.5">{s.value}</p>
              )}
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
          {loading ? (
            [0,1,2,3,4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">No activities found</div>
          ) : (
            filtered.map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
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
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(act.started_at)}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-slate-100">{formatDistance(act.distance_meters)}</p>
                      <p className="text-[10px] text-slate-600">distance</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-100">{formatDuration(act.duration_seconds)}</p>
                      <p className="text-[10px] text-slate-600">time</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-100">{formatPace(act.pace_seconds_per_km, act.speed_kmh)}</p>
                      <p className="text-[10px] text-slate-600">pace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 ml-auto sm:ml-0">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-xs font-bold text-orange-400">{act.calories}</span>
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
                        <p className="text-sm font-bold text-slate-200 mt-0.5">{formatPace(act.pace_seconds_per_km, act.speed_kmh)}</p>
                      </div>
                      {act.elevation_meters != null && (
                        <div>
                          <p className="text-[10px] text-slate-600 uppercase tracking-wider">Elevation</p>
                          <p className="text-sm font-bold text-slate-200 mt-0.5">{act.elevation_meters}m</p>
                        </div>
                      )}
                      {act.avg_heart_rate != null && (
                        <div>
                          <p className="text-[10px] text-slate-600 uppercase tracking-wider">Avg HR</p>
                          <p className="text-sm font-bold text-slate-200 mt-0.5">{act.avg_heart_rate} bpm</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider">Energy</p>
                        <p className="text-sm font-bold text-orange-400 mt-0.5">{act.calories} kcal</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
