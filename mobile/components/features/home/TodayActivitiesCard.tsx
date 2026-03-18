import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { Card } from "../../ui/Card";
import { apiGet } from "../../../lib/api";
import type { ActivityRow } from "../../../types";
import { useHevyWorkouts } from "../../../hooks/useHevyWorkouts";
import { HevyWorkoutCard } from "./HevyWorkoutCard";
import { HevyConnectPrompt } from "./HevyConnectPrompt";
import { formatWorkoutDate } from "../../../utils/hevyHelpers";

const TYPE_META: Record<string, { ios: string; android: string; color: string }> = {
  run:      { ios: "figure.run",           android: "directions_run",   color: "#F97316" },
  ride:     { ios: "figure.outdoor.cycle", android: "directions_bike",  color: "#6366F1" },
  swim:     { ios: "figure.pool.swim",     android: "pool",             color: "#38BDF8" },
  walk:     { ios: "figure.walk",          android: "directions_walk",  color: "#22C55E" },
  hike:     { ios: "mountain.2.fill",      android: "terrain",          color: "#84CC16" },
  workout:  { ios: "dumbbell.fill",        android: "fitness_center",   color: "#A855F7" },
  yoga:     { ios: "figure.mind.and.body", android: "self_improvement", color: "#EC4899" },
};

function getTypeMeta(type: string) {
  return TYPE_META[type.toLowerCase()] ?? TYPE_META.workout;
}

function fmt(seconds: number) {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

interface Props {
  activities: ActivityRow[];
}

function ActivityList({
  activities,
  dimmed = false,
}: {
  activities: ActivityRow[];
  dimmed?: boolean;
}) {
  return (
    <View style={styles.list}>
      {activities.map((act, idx) => {
        const meta = getTypeMeta(act.type);
        return (
          <View
            key={act.id}
            style={[
              styles.row,
              idx === activities.length - 1 && styles.rowLast,
            ]}
          >
            <View style={[styles.typeIconWrap, { backgroundColor: meta.color + (dimmed ? "14" : "20") }]}>
              <SymbolView
                name={{ ios: meta.ios, android: meta.android, web: meta.android }}
                tintColor={dimmed ? "#9CA3AF" : meta.color}
                size={15}
              />
            </View>
            <View style={styles.rowMid}>
              <Text style={[styles.actName, { color: dimmed ? "#9CA3AF" : "#1A1A1A" }]} numberOfLines={1}>
                {act.name}
              </Text>
              <Text style={styles.actMeta}>
                {act.type.charAt(0).toUpperCase() + act.type.slice(1).toLowerCase()}
                {act.duration_seconds ? ` · ${fmt(act.duration_seconds)}` : ""}
                {act.distance_meters ? ` · ${(act.distance_meters / 1000).toFixed(1)} km` : ""}
              </Text>
            </View>
            {act.calories && !dimmed ? (
              <View style={[styles.kcalBadge, { backgroundColor: meta.color + "18" }]}>
                <Text style={[styles.kcalText, { color: meta.color }]}>{act.calories} kcal</Text>
              </View>
            ) : act.calories ? (
              <Text style={[styles.kcalText, { color: "#9CA3AF" }]}>{act.calories} kcal</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function TodayActivitiesCard({ activities }: Props) {
  const [recentActivities, setRecentActivities] = useState<ActivityRow[]>([]);
  const hevy = useHevyWorkouts(30);

  useEffect(() => {
    apiGet<{ activities: ActivityRow[] }>("/api/activities?limit=5")
      .then((res) => {
        const todayIds = new Set(activities.map((a) => a.id));
        const past = (res.activities ?? []).filter((a) => !todayIds.has(a.id));
        setRecentActivities(past.slice(0, 4));
      })
      .catch(() => {});
  }, [activities]);

  // Today's Hevy workout (if any)
  const todayHevy = hevy.isConnected
    ? hevy.workouts.find((w) => formatWorkoutDate(w.workout.start_time) === "Today") ?? null
    : null;

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <SymbolView
              name={{ ios: "figure.run", android: "directions_run", web: "directions_run" }}
              tintColor="#F97316"
              size={16}
            />
          </View>
          <View>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.sub}>Today</Text>
          </View>
        </View>
      </View>

      {/* Today's cardio/activities */}
      {activities.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No activities today</Text>
        </View>
      ) : (
        <ActivityList activities={activities} />
      )}

      {/* Recent history */}
      {recentActivities.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Recent</Text>
          <ActivityList activities={recentActivities} dimmed />
        </>
      )}

      {/* ── Strength Training (Hevy) ── */}
      <View style={styles.strengthHeader}>
        <Text style={styles.sectionLabel}>🏋️  Strength Training</Text>
      </View>

      {hevy.isConnected ? (
        todayHevy ? (
          <HevyWorkoutCard stats={todayHevy} />
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No strength session today</Text>
          </View>
        )
      ) : (
        <HevyConnectPrompt />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, flex: 1 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(249,115,22,0.15)" },
  title: { fontSize: 16, fontWeight: "700", letterSpacing: -0.3, color: "#1A1A1A" },
  sub: { fontSize: 11, fontWeight: "500", marginTop: 1, color: "#6B7280" },
  emptyWrap: { paddingVertical: 8 },
  emptyText: { fontSize: 13, fontWeight: "500", color: "#9CA3AF" },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#9CA3AF",
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.07)",
  },
  strengthHeader: {
    marginTop: 4,
  },

  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.07)", marginTop: 8, paddingTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  rowLast: { borderBottomWidth: 0 },
  typeIconWrap: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  rowMid: { flex: 1 },
  actName: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  actMeta: { fontSize: 11, fontWeight: "500", color: "#6B7280" },
  kcalBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  kcalText: { fontSize: 11, fontWeight: "700" },
});
