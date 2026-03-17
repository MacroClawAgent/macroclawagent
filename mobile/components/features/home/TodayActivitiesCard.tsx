import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Card } from "../../ui/Card";
import { useTheme } from "../../../context/ThemeContext";
import { apiGet } from "../../../lib/api";
import type { ActivityRow } from "../../../types";

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
  colors,
  router,
  dimmed = false,
}: {
  activities: ActivityRow[];
  colors: any;
  router: any;
  dimmed?: boolean;
}) {
  return (
    <View style={[styles.list, { borderTopColor: colors.border }]}>
      {activities.map((act, idx) => {
        const meta = getTypeMeta(act.type);
        return (
          <TouchableOpacity
            key={act.id}
            onPress={() => router.push("/(tabs)/activity" as any)}
            activeOpacity={0.7}
            style={[
              styles.row,
              { borderBottomColor: colors.border },
              idx === activities.length - 1 && styles.rowLast,
            ]}
          >
            <View style={[styles.typeIconWrap, { backgroundColor: meta.color + (dimmed ? "14" : "22") }]}>
              <SymbolView
                name={{ ios: meta.ios, android: meta.android, web: meta.android }}
                tintColor={dimmed ? colors.textMuted : meta.color}
                size={15}
              />
            </View>
            <View style={styles.rowMid}>
              <Text style={[styles.actName, { color: dimmed ? colors.textMuted : colors.textPrimary }]} numberOfLines={1}>
                {act.name}
              </Text>
              <Text style={[styles.actMeta, { color: colors.textMuted }]}>
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
              <Text style={[styles.kcalText, { color: colors.textMuted }]}>{act.calories} kcal</Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function TodayActivitiesCard({ activities }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const [recentActivities, setRecentActivities] = useState<ActivityRow[]>([]);

  useEffect(() => {
    apiGet<{ activities: ActivityRow[] }>("/api/activities?limit=5")
      .then((res) => {
        const todayIds = new Set(activities.map((a) => a.id));
        const past = (res.activities ?? []).filter((a) => !todayIds.has(a.id));
        setRecentActivities(past.slice(0, 4));
      })
      .catch(() => {});
  }, [activities]);

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: colors.orangeAlpha }]}>
            <SymbolView
              name={{ ios: "figure.run", android: "directions_run", web: "directions_run" }}
              tintColor={colors.orange}
              size={16}
            />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Activity</Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>Today</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/activity" as any)}
          style={styles.viewAllBtn}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewAllText, { color: colors.textMuted }]}>View all</Text>
          <SymbolView
            name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
            tintColor={colors.textMuted}
            size={11}
          />
        </TouchableOpacity>
      </View>

      {/* Today's activities */}
      {activities.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No activities today</Text>
        </View>
      ) : (
        <ActivityList activities={activities} colors={colors} router={router} />
      )}

      {/* Recent history — fills card height */}
      {recentActivities.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textMuted, borderTopColor: colors.border }]}>
            Recent
          </Text>
          <ActivityList activities={recentActivities} colors={colors} router={router} dimmed />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, minHeight: 240 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  sub: { fontSize: 11, fontWeight: "500", marginTop: 1 },
  viewAllBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewAllText: { fontSize: 12, fontWeight: "600" },

  emptyWrap: { paddingVertical: 8 },
  emptyText: { fontSize: 13, fontWeight: "500" },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  list: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 8, paddingTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: { borderBottomWidth: 0 },
  typeIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowMid: { flex: 1 },
  actName: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  actMeta: { fontSize: 11, fontWeight: "500" },
  kcalBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  kcalText: { fontSize: 11, fontWeight: "700" },
});
