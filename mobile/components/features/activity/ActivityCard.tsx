import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../../ui/Card";
import { Pill } from "../../ui/Pill";
import { useTheme } from "../../../context/ThemeContext";
import { formatDate, formatDistance, formatDuration } from "../../../lib/formatters";
import type { ActivityRow } from "../../../types";

const TYPE_EMOJI: Record<string, string> = {
  Run: "🏃",
  Ride: "🚴",
  Swim: "🏊",
  Other: "💪",
};

interface ActivityCardProps {
  activity: ActivityRow;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { colors } = useTheme();
  const emoji = TYPE_EMOJI[activity.type] ?? "💪";

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.orangeAlpha }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {activity.name}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {formatDate(activity.started_at)}
          </Text>
        </View>
        <Pill label={activity.type.toUpperCase()} color={colors.orange} bg={colors.orangeAlpha} size="sm" />
      </View>

      <View style={styles.statsRow}>
        {activity.distance_meters ? (
          <StatChip value={formatDistance(activity.distance_meters)} colors={colors} />
        ) : null}
        <StatChip value={formatDuration(activity.duration_seconds)} colors={colors} />
        {activity.calories ? (
          <StatChip value={`${activity.calories} kcal`} colors={colors} />
        ) : null}
      </View>

      {/* Subtle decorative bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.bottomBarFill, { backgroundColor: colors.orange, width: "65%" }]} />
      </View>
    </Card>
  );
}

function StatChip({ value, colors }: { value: string; colors: any }) {
  return (
    <View style={[styles.statChip, { backgroundColor: colors.surfaceAlt }]}>
      <Text style={[styles.statText, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  date: { fontSize: 12, fontWeight: "500" },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  statChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statText: { fontSize: 12, fontWeight: "600" },
  bottomBar: { height: 3, borderRadius: 100, overflow: "hidden" },
  bottomBarFill: { height: 3, borderRadius: 100 },
});
