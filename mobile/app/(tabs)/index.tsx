import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { apiGet } from "@/lib/api";
import { MacroRing } from "@/components/MacroRing";
import { StatCard } from "@/components/StatCard";
import { NutritionLog, ActivityRow } from "@/types";
import { AppColors } from "@/theme/colors";

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.bg },
    scroll: { flex: 1 },
    content: { padding: 20, gap: 16, paddingBottom: 40 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
    greetingText: { fontSize: 22, fontWeight: "800", color: c.text },
    date: { fontSize: 13, color: c.muted, marginTop: 2 },
    avatarBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 16, fontWeight: "800", color: c.primaryText },
    card: { backgroundColor: c.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: c.border, gap: 16 },
    cardTitle: { fontSize: 14, fontWeight: "700", color: c.text },
    ringsRow: { flexDirection: "row", justifyContent: "space-between" },
    emptyHint: { fontSize: 12, color: c.mutedMore, textAlign: "center" },
    statsRow: { flexDirection: "row", gap: 12 },
    activityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    activityIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: c.inputBg, justifyContent: "center", alignItems: "center" },
    activityEmoji: { fontSize: 22 },
    activityInfo: { flex: 1, gap: 4 },
    activityName: { fontSize: 14, fontWeight: "700", color: c.text },
    activityMeta: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    activityStat: { fontSize: 12, color: c.muted, backgroundColor: c.inputBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    emptyActivity: { gap: 4 },
    emptyActivityText: { fontSize: 14, fontWeight: "600", color: c.muted },
    emptyActivityHint: { fontSize: 12, color: c.mutedMore, lineHeight: 18 },
    stravaCard: { backgroundColor: "#FC4C02", borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    stravaLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
    stravaIcon: { fontSize: 26 },
    stravaTitle: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
    stravaSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2, lineHeight: 16 },
    stravaArrow: { fontSize: 20, color: "#FFFFFF", fontWeight: "700" },
    agentCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, borderRadius: 18, backgroundColor: c.primary },
    agentLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    agentEmoji: { fontSize: 20, color: c.primaryText },
    agentTitle: { fontSize: 15, fontWeight: "800", color: c.primaryText },
    agentSub: { fontSize: 12, color: c.primaryText, opacity: 0.6, marginTop: 1 },
    agentArrow: { fontSize: 18, color: c.primaryText, fontWeight: "700" },
  });
}

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
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [nutrition, setNutrition] = useState<NutritionLog | null>(null);
  const [activity, setActivity] = useState<ActivityRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = userProfile?.full_name?.split(" ")[0] ?? "Athlete";
  const [connectingStrava, setConnectingStrava] = useState(false);

  async function handleConnectStrava() {
    try {
      setConnectingStrava(true);
      const { url } = await apiGet<{ url: string }>("/api/strava/mobile-init");
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Could not start Strava connection. Try again from Profile.");
    } finally {
      setConnectingStrava(false);
    }
  }

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
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4FF00" />}
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
          <TouchableOpacity style={styles.avatarBadge} onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.8}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Strava connect nudge */}
        {!userProfile?.strava_athlete_id && (
          <TouchableOpacity
            style={styles.stravaCard}
            onPress={handleConnectStrava}
            disabled={connectingStrava}
            activeOpacity={0.85}
          >
            <View style={styles.stravaLeft}>
              <Text style={styles.stravaIcon}>🏃</Text>
              <View>
                <Text style={styles.stravaTitle}>Sync your training</Text>
                <Text style={styles.stravaSub}>Connect Strava to personalise your nutrition</Text>
              </View>
            </View>
            {connectingStrava
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.stravaArrow}>→</Text>}
          </TouchableOpacity>
        )}

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
        <TouchableOpacity style={styles.agentCard} activeOpacity={0.85} onPress={() => router.push("/(tabs)/agent")}>
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

