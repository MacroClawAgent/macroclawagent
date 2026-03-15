import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "../../ui/Card";
import { Pill } from "../../ui/Pill";
import { useTheme } from "../../../context/ThemeContext";
import { formatDistance, formatDuration } from "../../../lib/formatters";

interface ActivityInfo {
  type: string;
  title: string;
  distanceKm: number;
  kcal: number;
  durationMin: number;
}

interface LatestActivityCardProps {
  activity?: ActivityInfo;
  isStravaConnected: boolean;
}

const SPARKLINE_HEIGHTS = [4, 8, 5, 10, 7, 12, 9];

export function LatestActivityCard({ activity, isStravaConnected }: LatestActivityCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  if (!isStravaConnected) {
    return (
      <Card style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/profile")}
          style={styles.ctaRow}
        >
          <View style={[styles.stravaIcon, { backgroundColor: colors.orangeAlpha }]}>
            <Text style={styles.stravaEmoji}>🏃</Text>
          </View>
          <View style={styles.ctaText}>
            <Text style={[styles.ctaTitle, { color: colors.textPrimary }]}>Connect Strava</Text>
            <Text style={[styles.ctaBody, { color: colors.textMuted }]}>Sync training to adapt your macro targets</Text>
          </View>
          <Text style={[styles.ctaArrow, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  if (!activity) {
    return (
      <Card style={styles.card}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No recent activity · Sync Strava to get started</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <Pill label={activity.type.toUpperCase()} color={colors.orange} bg={colors.orangeAlpha} />
        <View style={styles.sparkline}>
          {SPARKLINE_HEIGHTS.map((h, i) => (
            <View
              key={i}
              style={[styles.bar, { height: h, backgroundColor: i === 6 ? colors.orange : colors.orangeAlpha }]}
            />
          ))}
        </View>
      </View>
      <Text style={[styles.activityTitle, { color: colors.textPrimary }]} numberOfLines={1}>
        {activity.title}
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{activity.distanceKm.toFixed(1)}</Text>
          <Text style={[styles.statUnit, { color: colors.textMuted }]}>km</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{activity.durationMin}</Text>
          <Text style={[styles.statUnit, { color: colors.textMuted }]}>min</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{activity.kcal}</Text>
          <Text style={[styles.statUnit, { color: colors.textMuted }]}>kcal</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  activityTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stat: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  statValue: { fontSize: 16, fontWeight: "700" },
  statUnit: { fontSize: 11, fontWeight: "500" },
  divider: { width: 1, height: 14 },
  sparkline: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  bar: { width: 3, borderRadius: 2 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stravaIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stravaEmoji: { fontSize: 18 },
  ctaText: { flex: 1 },
  ctaTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  ctaBody: { fontSize: 12, fontWeight: "500", lineHeight: 16 },
  ctaArrow: { fontSize: 22, fontWeight: "300" },
  emptyText: { fontSize: 13, fontWeight: "500", textAlign: "center", paddingVertical: 8 },
});
