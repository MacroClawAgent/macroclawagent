import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { MacroRing } from "@/components/MacroRing";
import { StatCard } from "@/components/StatCard";
import { NutritionLog, ActivityRow } from "@/types";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDistance(meters: number | null) {
  if (!meters) return null;
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
}

function activityEmoji(type: string) {
  const map: Record<string, string> = { Run: "🏃", Ride: "🚴", Swim: "🏊", Other: "⚡" };
  return map[type] ?? "⚡";
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardScreen() {
  const { userProfile } = useAuth();
  const [nutrition, setNutrition] = useState<NutritionLog | null>(null);
  const [activity, setActivity] = useState<ActivityRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = userProfile?.full_name?.split(" ")[0] ?? "Athlete";

  async function fetchData() {
    if (!userProfile) return;
    const today = new Date().toISOString().split("T")[0];
    const [{ data: nutritionData }, { data: activityData }] = await Promise.all([
      supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", userProfile.id)
        .eq("date", today)
        .maybeSingle(),
      supabase
        .from("activities")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setNutrition(nutritionData ?? null);
    setActivity(activityData ?? null);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { fetchData(); }, [userProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [userProfile]);

  const goals = {
    calories: userProfile?.calorie_goal ?? 2000,
    protein: userProfile?.protein_goal ?? 120,
    carbs: userProfile?.carbs_goal ?? 250,
    fat: userProfile?.fat_goal ?? 70,
  };

  const consumed = {
    calories: nutrition?.calories_consumed ?? 0,
    protein: nutrition?.protein_g ?? 0,
    carbs: nutrition?.carbs_g ?? 0,
    fat: nutrition?.fat_g ?? 0,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#20C7B7" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#20C7B7" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{greeting()}, {firstName} 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>
          </View>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Macro rings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Macros</Text>
          <View style={styles.ringsRow}>
            <MacroRing label="Calories" value={consumed.calories} goal={goals.calories} unit="kcal" color="#F97316" size={80} />
            <MacroRing label="Protein" value={consumed.protein} goal={goals.protein} unit="g" color="#10B981" size={80} />
            <MacroRing label="Carbs" value={consumed.carbs} goal={goals.carbs} unit="g" color="#F59E0B" size={80} />
            <MacroRing label="Fat" value={consumed.fat} goal={goals.fat} unit="g" color="#6366F1" size={80} />
          </View>
          {!nutrition && (
            <Text style={styles.emptyHint}>No meals logged today yet.</Text>
          )}
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Remaining"
            value={`${Math.max(0, goals.calories - consumed.calories)}`}
            sub="kcal left today"
            accent="#20C7B7"
          />
          <StatCard
            label="Hydration"
            value={`${nutrition?.hydration_ml ?? 0}`}
            sub="ml today"
            accent="#4C7DFF"
          />
        </View>

        {/* Latest activity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest Activity</Text>
          {activity ? (
            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>{activityEmoji(activity.type)}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <View style={styles.activityMeta}>
                  {formatDistance(activity.distance_meters) && (
                    <Text style={styles.activityStat}>{formatDistance(activity.distance_meters)}</Text>
                  )}
                  <Text style={styles.activityStat}>{formatDuration(activity.duration_seconds)}</Text>
                  {activity.calories && (
                    <Text style={styles.activityStat}>{Math.round(activity.calories)} kcal</Text>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>No activities yet.</Text>
              <Text style={styles.emptyActivityHint}>Connect Strava in your profile to sync training data.</Text>
            </View>
          )}
        </View>

        {/* Agent nudge */}
        <TouchableOpacity style={styles.agentCard} activeOpacity={0.85}>
          <View style={styles.agentLeft}>
            <Text style={styles.agentEmoji}>✦</Text>
            <View>
              <Text style={styles.agentTitle}>Ask Jonno</Text>
              <Text style={styles.agentSub}>Get personalised nutrition advice</Text>
            </View>
          </View>
          <Text style={styles.agentArrow}>→</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F5F7" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F5F7" },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  greetingText: { fontSize: 22, fontWeight: "800", color: "#1C1C1E" },
  date: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  avatarBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#20C7B7", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", gap: 16 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#1C1C1E" },
  ringsRow: { flexDirection: "row", justifyContent: "space-between" },
  emptyHint: { fontSize: 12, color: "#9CA3AF", textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 12 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  activityIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#F4F5F7", justifyContent: "center", alignItems: "center" },
  activityEmoji: { fontSize: 22 },
  activityInfo: { flex: 1, gap: 4 },
  activityName: { fontSize: 14, fontWeight: "700", color: "#1C1C1E" },
  activityMeta: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  activityStat: { fontSize: 12, color: "#6B7280", backgroundColor: "#F4F5F7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  emptyActivity: { gap: 4 },
  emptyActivityText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  emptyActivityHint: { fontSize: 12, color: "#9CA3AF", lineHeight: 18 },
  agentCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 18, borderRadius: 18, backgroundColor: "#1C1C1E",
  },
  agentLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  agentEmoji: { fontSize: 20, color: "#20C7B7" },
  agentTitle: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
  agentSub: { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 1 },
  agentArrow: { fontSize: 18, color: "#20C7B7", fontWeight: "700" },
});
