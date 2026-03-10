import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet, apiPost } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/theme/colors";
import { ActivityRow } from "@/types";

const TYPE_EMOJI: Record<string, string> = { Run: "🏃", Ride: "🚴", Swim: "🏊", Other: "⚡" };
const TYPE_FILTERS = ["All", "Run", "Ride", "Swim", "Other"] as const;
type Filter = typeof TYPE_FILTERS[number];

function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(m: number | null) {
  if (!m) return null;
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function formatPace(secPerKm: number | null) {
  if (!secPerKm) return null;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")} /km`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.bg },
    content: { padding: 20, gap: 16, paddingBottom: 40 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    heading: { fontSize: 26, fontWeight: "800", color: c.text },
    syncBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.inputBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    syncBtnText: { fontSize: 13, fontWeight: "700", color: c.primary },
    statsRow: { flexDirection: "row", gap: 10 },
    statCard: { flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: c.border, gap: 2 },
    statValue: { fontSize: 20, fontWeight: "800", color: c.text },
    statLabel: { fontSize: 11, color: c.mutedMore, fontWeight: "600" },
    filterRow: { flexDirection: "row", gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
    filterChipActive: { backgroundColor: c.primary, borderColor: c.primary },
    filterChipText: { fontSize: 13, fontWeight: "600", color: c.muted },
    filterChipTextActive: { color: c.primaryText },
    activityCard: { backgroundColor: c.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: c.border, flexDirection: "row", gap: 14, alignItems: "center" },
    iconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: c.inputBg, justifyContent: "center", alignItems: "center" },
    emoji: { fontSize: 24 },
    info: { flex: 1, gap: 4 },
    name: { fontSize: 15, fontWeight: "700", color: c.text },
    dateLine: { fontSize: 12, color: c.mutedMore },
    statsLine: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    chip: { fontSize: 12, color: c.muted, backgroundColor: c.inputBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: "hidden" },
    emptyState: { alignItems: "center", gap: 10, paddingVertical: 40 },
    emptyTitle: { fontSize: 18, fontWeight: "800", color: c.text },
    emptySub: { fontSize: 14, color: c.muted, textAlign: "center", lineHeight: 20 },
    stravaBtn: { backgroundColor: "#FC4C02", borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
    stravaBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
    sectionHeader: { fontSize: 12, fontWeight: "700", color: c.mutedMore, textTransform: "uppercase", letterSpacing: 0.5, paddingTop: 4 },
  });
}

export default function ActivityScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");

  async function fetchActivities() {
    try {
      const res = await apiGet<{ activities: ActivityRow[] }>("/api/activities?limit=50");
      setActivities(res.activities ?? []);
    } catch { /* keep existing */ }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { fetchActivities(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActivities();
  }, []);

  async function handleSync() {
    setSyncing(true);
    try {
      await apiPost("/api/strava/sync", {});
      await fetchActivities();
    } catch {
      Alert.alert("Sync failed", "Could not sync Strava activities. Check your connection and try again.");
    } finally {
      setSyncing(false);
    }
  }

  const filtered = filter === "All" ? activities : activities.filter((a) => a.type === filter);

  // Weekly stats (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const weeklyActivities = activities.filter((a) => a.started_at >= weekAgo);
  const weeklyStats = {
    sessions: weeklyActivities.length,
    distance: weeklyActivities.reduce((s, a) => s + (a.distance_meters ?? 0), 0) / 1000,
    time: weeklyActivities.reduce((s, a) => s + a.duration_seconds, 0),
    calories: weeklyActivities.reduce((s, a) => s + (a.calories ?? 0), 0),
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Activity</Text>
          <TouchableOpacity style={styles.syncBtn} onPress={handleSync} disabled={syncing} activeOpacity={0.8}>
            {syncing
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={styles.syncBtnText}>↻ Sync</Text>}
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{weeklyStats.sessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{weeklyStats.distance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>km this week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDuration(weeklyStats.time)}</Text>
            <Text style={styles.statLabel}>Active time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(weeklyStats.calories)}</Text>
            <Text style={styles.statLabel}>kcal burned</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {TYPE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                {f === "All" ? f : `${TYPE_EMOJI[f]} ${f}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activity List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySub}>Connect Strava to sync your training data, then tap Sync.</Text>
            <TouchableOpacity style={styles.stravaBtn} onPress={handleSync} activeOpacity={0.85}>
              <Text style={styles.stravaBtnText}>🏃 Sync Strava</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionHeader}>{filtered.length} {filter === "All" ? "Total" : filter} Activit{filtered.length === 1 ? "y" : "ies"}</Text>
            {filtered.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.iconBox}>
                  <Text style={styles.emoji}>{TYPE_EMOJI[activity.type] ?? "⚡"}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>{activity.name}</Text>
                  <Text style={styles.dateLine}>{formatDate(activity.started_at)}</Text>
                  <View style={styles.statsLine}>
                    {formatDistance(activity.distance_meters) && (
                      <Text style={styles.chip}>{formatDistance(activity.distance_meters)}</Text>
                    )}
                    <Text style={styles.chip}>{formatDuration(activity.duration_seconds)}</Text>
                    {activity.calories ? (
                      <Text style={styles.chip}>{Math.round(activity.calories)} kcal</Text>
                    ) : null}
                    {formatPace(activity.pace_seconds_per_km) && (
                      <Text style={styles.chip}>{formatPace(activity.pace_seconds_per_km)}</Text>
                    )}
                    {activity.avg_heart_rate ? (
                      <Text style={styles.chip}>❤️ {Math.round(activity.avg_heart_rate)} bpm</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
