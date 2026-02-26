"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, Bike, Waves, Flame, Clock, MapPin, ChevronRight } from "lucide-react";
import type { ActivityRow as ActivityRowType } from "@/types/database";

interface StravaActivityProps {
  activities?: ActivityRowType[];
}

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

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeStr}`;
}

function activityStyle(type: string) {
  if (type === "Ride") return { color: "text-blue-400",    bg: "bg-blue-500/10",    icon: <Bike className="w-4 h-4" /> };
  if (type === "Swim") return { color: "text-cyan-400",    bg: "bg-cyan-500/10",    icon: <Waves className="w-4 h-4" /> };
  return                       { color: "text-orange-400", bg: "bg-orange-500/10",  icon: <Activity className="w-4 h-4" /> };
}

function ActivityRow({ activity, delay }: { activity: ActivityRowType; delay: number }) {
  const style = activityStyle(activity.type);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-4 py-3 border-b border-white/[0.05] last:border-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors duration-200"
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg} ${style.color}`}
      >
        {style.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 truncate">{activity.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{formatDate(activity.started_at)}</p>
      </div>

      <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {formatDistance(activity.distance_meters)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(activity.duration_seconds)}
        </span>
      </div>

      <Badge variant="calories" className="flex-shrink-0">
        <Flame className="w-3 h-3 mr-1" />
        {activity.calories}
      </Badge>
    </motion.div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.05] last:border-0">
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

export function StravaActivity({ activities: activitiesProp }: StravaActivityProps) {
  const loading = activitiesProp === undefined;
  const activities = activitiesProp ?? [];
  const totalCalories = activities.reduce((acc, a) => acc + a.calories, 0);

  return (
    <Card className="glass-card border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-300">
          Recent Activity
        </CardTitle>
        <div className="flex items-center gap-3">
          {!loading && totalCalories > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-xs text-slate-500"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-mono">{totalCalories.toLocaleString()} kcal this week</span>
            </motion.div>
          )}
          <Link href="/activities" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors">
            All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        {loading
          ? [0, 1, 2, 3].map((i) => <ActivitySkeleton key={i} />)
          : activities.map((activity, index) => (
              <ActivityRow key={activity.id} activity={activity} delay={index * 0.08} />
            ))}
      </CardContent>
    </Card>
  );
}
