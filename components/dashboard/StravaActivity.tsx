"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, Bike, Mountain, Flame, Clock, MapPin } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "run",
    icon: <Activity className="w-4 h-4" />,
    name: "Morning Zone 2 Run",
    date: "Today, 6:42 AM",
    distance: "5.2 km",
    duration: "28 min",
    calories: 312,
    pace: "5:23/km",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    id: 2,
    type: "ride",
    icon: <Bike className="w-4 h-4" />,
    name: "Evening Threshold Ride",
    date: "Yesterday, 5:15 PM",
    distance: "32.1 km",
    duration: "1h 04min",
    calories: 780,
    pace: "30.1 km/h",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    id: 3,
    type: "hike",
    icon: <Mountain className="w-4 h-4" />,
    name: "Trail Run — Monte Serra",
    date: "Mon, 7:00 AM",
    distance: "12.4 km",
    duration: "1h 42min",
    calories: 920,
    pace: "8:15/km",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    id: 4,
    type: "run",
    icon: <Activity className="w-4 h-4" />,
    name: "Tempo Run",
    date: "Sun, 8:00 AM",
    distance: "8.0 km",
    duration: "37 min",
    calories: 468,
    pace: "4:38/km",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
];

function ActivityRow({ activity, delay }: { activity: (typeof activities)[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-4 py-3 border-b border-white/[0.05] last:border-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors duration-200"
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${activity.bg} ${activity.color}`}
      >
        {activity.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 truncate">{activity.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{activity.date}</p>
      </div>

      <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {activity.distance}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {activity.duration}
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

export function StravaActivity() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const totalCalories = activities.reduce((acc, a) => acc + a.calories, 0);

  return (
    <Card className="glass-card border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-300">
          Recent Activity
        </CardTitle>
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-xs text-slate-500"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono">{totalCalories.toLocaleString()} kcal this week</span>
          </motion.div>
        )}
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
