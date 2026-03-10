import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity, Modal, Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiGet, apiPost } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { DashCard } from "@/components/DashCard";
import { ProgressBar } from "@/components/ProgressBar";
import { NutritionLog, ActivityRow, MealItem } from "@/types";
import { AppColors } from "@/theme/colors";

// ─── Cache key + TTL ────────────────────────────────────────────
const OPTIMIZER_KEY = "home_optimizer";
const SIX_HOURS = 6 * 60 * 60 * 1000;

// ─── Types ──────────────────────────────────────────────────────
interface NutritionGoals {
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
}

interface WeeklyDay {
  date: string;
  day: string;
  kcal: number;
  target: number;
}

interface TodayResponse {
  today: NutritionLog | null;
  goals: NutritionGoals;
  mealLog: MealItem[];
  weeklyCalories: WeeklyDay[];
}

interface GroceryItem {
  name: string;
  qty: number;
  unit: string;
  category: string;
}

interface OptimizerResponse {
  plan?: { grocery_list?: GroceryItem[]; meal_plan?: Record<string, MealItem[]> };
  grocery_list?: GroceryItem[];
}

// ─── Helpers ────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function isToday(isoString: string) {
  return isoString.startsWith(new Date().toISOString().split("T")[0]);
}

function getSubheadline(
  activity: ActivityRow | null,
  goals: NutritionGoals,
  consumedCal: number,
): string {
  if (activity && isToday(activity.started_at)) {
    return `You crushed your ${activity.type.toLowerCase()} today 💪`;
  }
  const pct = goals.calorie_goal > 0 ? consumedCal / goals.calorie_goal : 0;
  if (pct >= 0.8) return "You're on track for your goal 🎯";
  if (pct >= 0.4) return "Keep fuelling — you're making progress 🥗";
  return "Let's start fuelling today 🍽️";
}

function loadLabel(a: ActivityRow): "High" | "Med" | "Low" {
  const hr = a.avg_heart_rate;
  const min = a.duration_seconds / 60;
  if ((hr && hr > 155) || min > 90) return "High";
  if ((hr && hr > 130) || min > 40) return "Med";
  return "Low";
}

function loadColor(label: string): string {
  if (label === "High") return "#F97316";
  if (label === "Med") return "#F59E0B";
  return "#10B981";
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(meters: number | null): string | null {
  if (!meters) return null;
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

const ACTIVITY_EMOJI: Record<string, string> = { Run: "🏃", Ride: "🚴", Swim: "🏊", Other: "⚡" };

// ─── Sub-components ─────────────────────────────────────────────

/** Mini weekly ring shown in the Weekly Progress row. */
function DayRing({
  day, kcal, target, primary, border,
}: { day: string; kcal: number; target: number; primary: string; border: string }) {
  const size = 44;
  const sw = 4;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(kcal / target, 1) : 0;
  const hit = kcal >= target * 0.85;
  return (
    <View style={{ alignItems: "center", gap: 5 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={sw} fill="none" />
          {kcal > 0 && (
            <Circle
              cx={size / 2} cy={size / 2} r={r}
              stroke={hit ? primary : border}
              strokeWidth={sw}
              fill="none"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          )}
        </Svg>
        <View style={{ position: "absolute", top: 0, left: 0, width: size, height: size, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 9, fontWeight: "700", color: hit ? primary : "rgba(245,245,247,0.4)" }}>
            {kcal > 0 ? `${Math.round(kcal / 100) / 10}k` : "—"}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 10, fontWeight: "600", color: "rgba(245,245,247,0.45)" }}>
        {day.slice(0, 3)}
      </Text>
    </View>
  );
}

/** 2-column stat box used inside Today's Targets card. */
function StatPill({
  label, value, goal, unit, color, inputBg, muted, mutedMore,
}: {
  label: string; value: number; goal: number; unit: string; color: string;
  inputBg: string; muted: string; mutedMore: string;
}) {
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  const over = value > goal * 1.05;
  const barColor = over ? "#F97316" : color;
  return (
    <View style={{ flex: 1, backgroundColor: inputBg, borderRadius: 14, padding: 14, gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ fontSize: 11, fontWeight: "600", color: muted }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 21, fontWeight: "800", color: barColor }} numberOfLines={1}>
        {Math.round(value)}
        <Text style={{ fontSize: 11, fontWeight: "600" }}> {unit}</Text>
      </Text>
      <Text style={{ fontSize: 10, color: mutedMore }}>of {goal} {unit}</Text>
      <View style={{ height: 3, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
        <View style={{ height: 3, width: `${pct * 100}%`, backgroundColor: barColor, borderRadius: 2 }} />
      </View>
    </View>
  );
}

/** Skeleton placeholder for loading state. */
function Skel({ h, style }: { h: number; style?: object }) {
  return (
    <View style={[{ height: h, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)" }, style]} />
  );
}

// ─── Styles factory ─────────────────────────────────────────────
function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.bg },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 14, paddingBottom: 48 },

    // Top bar
    topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    logo: { fontSize: 18, fontWeight: "900", letterSpacing: 3, color: c.primary },
    topRight: { flexDirection: "row", alignItems: "center", gap: 10 },
    bellBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
      justifyContent: "center", alignItems: "center",
    },
    avatarBadge: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: c.primary, justifyContent: "center", alignItems: "center",
    },
    avatarText: { fontSize: 15, fontWeight: "800", color: c.primaryText },

    // Greeting
    greetText: { fontSize: 28, fontWeight: "800", color: c.text, lineHeight: 34 },
    subText: { fontSize: 14, color: c.muted, marginTop: 4 },

    // Stats grid
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },

    // Progress bar wrapper
    progressWrap: { marginTop: 2 },

    // Activity card
    activityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    activityIcon: {
      width: 52, height: 52, borderRadius: 16,
      backgroundColor: c.inputBg, justifyContent: "center", alignItems: "center",
    },
    activityEmoji: { fontSize: 24 },
    activityInfo: { flex: 1, gap: 5 },
    activityName: { fontSize: 14, fontWeight: "700", color: c.text },
    activityMeta: { flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" },
    chip: {
      fontSize: 12, color: c.muted,
      backgroundColor: c.inputBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },

    // Strava CTA
    stravaCard: {
      backgroundColor: "#FC4C02", borderRadius: 18, padding: 18,
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    stravaLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
    stravaTitle: { fontSize: 15, fontWeight: "800", color: "#FFF" },
    stravaSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
    stravaArrow: { fontSize: 20, color: "#FFF", fontWeight: "700" },

    // Half row
    halfRow: { flexDirection: "row", gap: 12 },

    // Meal card
    mealTag: {
      alignSelf: "flex-start",
      fontSize: 10, fontWeight: "700", color: c.primary,
      backgroundColor: c.primaryAlpha, borderRadius: 6,
      paddingHorizontal: 7, paddingVertical: 3, marginBottom: 8,
    },
    mealName: { fontSize: 15, fontWeight: "700", color: c.text, lineHeight: 20 },
    mealMacro: { fontSize: 11, color: c.muted, marginTop: 4 },

    // Grocery card
    groceryCount: { fontSize: 38, fontWeight: "900", color: c.primary },
    groceryLabel: { fontSize: 12, color: c.muted, marginTop: 2, marginBottom: 4 },

    // Primary button
    primaryBtn: {
      backgroundColor: c.primary, borderRadius: 12,
      paddingVertical: 10, alignItems: "center", marginTop: 10,
    },
    primaryBtnText: { fontSize: 13, fontWeight: "800", color: c.primaryText },
    disabledBtn: { opacity: 0.4 },

    // Weekly row
    weekRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 2 },

    // Grocery export modal
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: "#161616", borderTopLeftRadius: 26, borderTopRightRadius: 26,
      padding: 24, paddingBottom: 40, gap: 10,
    },
    sheetTitle: { fontSize: 17, fontWeight: "800", color: "#F5F5F7", marginBottom: 6 },
    sheetBtn: {
      flexDirection: "row", alignItems: "center", gap: 14,
      padding: 16, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14,
    },
    sheetBtnIcon: { fontSize: 20 },
    sheetBtnText: { fontSize: 15, fontWeight: "600", color: "#F5F5F7" },
    sheetCancel: { padding: 14, alignItems: "center", marginTop: 2 },
    sheetCancelText: { fontSize: 15, fontWeight: "600", color: "rgba(245,245,247,0.45)" },
  });
}

// ─── Screen ─────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { userProfile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const s = useMemo(() => createStyles(colors), [colors]);

  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [lastActivity, setLastActivity] = useState<ActivityRow | null>(null);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groceryModal, setGroceryModal] = useState(false);

  const firstName = userProfile?.full_name?.split(" ")[0] ?? "Athlete";

  const fetchAll = useCallback(async (force = false) => {
    try {
      const [nd, ad] = await Promise.allSettled([
        apiGet<TodayResponse>("/api/nutrition/today"),
        apiGet<{ activities: ActivityRow[]; total: number }>("/api/activities?limit=1"),
      ]);

      if (nd.status === "fulfilled") setTodayData(nd.value);
      if (ad.status === "fulfilled") setLastActivity(ad.value.activities?.[0] ?? null);

      // Optimizer with 6h in-memory cache
      if (!force) {
        const cached = getCache<OptimizerResponse>(OPTIMIZER_KEY, SIX_HOURS);
        if (cached) {
          setGroceryItems(cached.plan?.grocery_list ?? cached.grocery_list ?? []);
          return;
        }
      }

      const od = await apiPost<OptimizerResponse>("/api/optimizer/create", {}).catch(() => null);
      if (od) {
        setCache(OPTIMIZER_KEY, od);
        setGroceryItems(od.plan?.grocery_list ?? od.grocery_list ?? []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (userProfile) fetchAll();
  }, [fetchAll, userProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll(true);
  }, [fetchAll]);

  // Resolved goals — prefer server response, fall back to profile
  const goals: NutritionGoals = todayData?.goals ?? {
    calorie_goal: userProfile?.calorie_goal ?? 2000,
    protein_goal: userProfile?.protein_goal ?? 120,
    carbs_goal:   userProfile?.carbs_goal   ?? 250,
    fat_goal:     userProfile?.fat_goal      ?? 70,
  };

  const consumed = {
    calories: todayData?.today?.calories_consumed ?? 0,
    protein:  todayData?.today?.protein_g         ?? 0,
    carbs:    todayData?.today?.carbs_g            ?? 0,
    fat:      todayData?.today?.fat_g              ?? 0,
  };

  const nextMeal = todayData?.mealLog?.[0] ?? null;
  const weekly   = todayData?.weeklyCalories ?? [];

  async function handleShare() {
    const lines = groceryItems.map((g) => `• ${g.name} × ${g.qty}${g.unit}`).join("\n");
    const text = lines.length > 0 ? `Jonno Grocery List:\n\n${lines}` : "Your grocery list is empty.";
    try { await Share.share({ message: text, title: "Jonno Grocery List" }); } catch { /* cancelled */ }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.content}>
          {/* top bar skeleton */}
          <View style={s.topBar}>
            <Skel h={20} style={{ width: 80 }} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Skel h={38} style={{ width: 38, borderRadius: 19 }} />
              <Skel h={38} style={{ width: 38, borderRadius: 19 }} />
            </View>
          </View>
          <Skel h={34} style={{ width: "60%" }} />
          <Skel h={18} style={{ width: "45%", marginTop: -6 }} />
          <Skel h={180} style={{ borderRadius: 20 }} />
          <Skel h={100} style={{ borderRadius: 20 }} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Skel h={150} style={{ flex: 1, borderRadius: 20 }} />
            <Skel h={150} style={{ flex: 1, borderRadius: 20 }} />
          </View>
        </View>
        <View style={s.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ──
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar ── */}
        <View style={s.topBar}>
          <View style={s.topRight}>
            <View style={s.bellBtn}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
            </View>
            <TouchableOpacity
              style={s.avatarBadge}
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.8}
            >
              <Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Greeting ── */}
        <View>
          <Text style={s.greetText}>{greeting()}, {firstName} 👋</Text>
          <Text style={s.subText}>
            {getSubheadline(lastActivity, goals, consumed.calories)}
          </Text>
        </View>

        {/* ── Today's Targets ── */}
        <DashCard
          title="Today's Targets"
          rightLabel="Add food →"
          onRightPress={() => router.push("/(tabs)/nutrition")}
        >
          <View style={s.statsRow}>
            <StatPill
              label="Calories" value={consumed.calories} goal={goals.calorie_goal} unit="kcal"
              color="#F97316" inputBg={colors.inputBg} muted={colors.muted} mutedMore={colors.mutedMore}
            />
            <StatPill
              label="Protein" value={consumed.protein} goal={goals.protein_goal} unit="g"
              color="#10B981" inputBg={colors.inputBg} muted={colors.muted} mutedMore={colors.mutedMore}
            />
          </View>
          <View style={s.statsRow}>
            <StatPill
              label="Carbs" value={consumed.carbs} goal={goals.carbs_goal} unit="g"
              color="#F59E0B" inputBg={colors.inputBg} muted={colors.muted} mutedMore={colors.mutedMore}
            />
            <StatPill
              label="Fat" value={consumed.fat} goal={goals.fat_goal} unit="g"
              color="#6366F1" inputBg={colors.inputBg} muted={colors.muted} mutedMore={colors.mutedMore}
            />
          </View>
          <View style={s.progressWrap}>
            <ProgressBar
              progress={goals.calorie_goal > 0 ? consumed.calories / goals.calorie_goal : 0}
              label={
                consumed.calories >= goals.calorie_goal
                  ? "Calorie target reached 🎉"
                  : "You're on track"
              }
              color={consumed.calories > goals.calorie_goal * 1.05 ? "#F97316" : colors.primary}
            />
          </View>
        </DashCard>

        {/* ── Training / Strava connect ── */}
        {!userProfile?.strava_athlete_id ? (
          <TouchableOpacity
            style={s.stravaCard}
            onPress={() => Linking.openURL("https://jonnoai.com/strava/connect")}
            activeOpacity={0.85}
          >
            <View style={s.stravaLeft}>
              <Text style={{ fontSize: 26 }}>🏃</Text>
              <View>
                <Text style={s.stravaTitle}>Sync your training</Text>
                <Text style={s.stravaSub}>Connect Strava to personalise your nutrition</Text>
              </View>
            </View>
            <Text style={s.stravaArrow}>→</Text>
          </TouchableOpacity>
        ) : (
          <DashCard
            title="Today's Training"
            rightLabel="See all →"
            onRightPress={() => router.push("/(tabs)/activity")}
          >
            {lastActivity ? (() => {
              const load = loadLabel(lastActivity);
              return (
                <View style={s.activityRow}>
                  <View style={s.activityIcon}>
                    <Text style={s.activityEmoji}>
                      {ACTIVITY_EMOJI[lastActivity.type] ?? "⚡"}
                    </Text>
                  </View>
                  <View style={s.activityInfo}>
                    <Text style={s.activityName}>{lastActivity.name}</Text>
                    <View style={s.activityMeta}>
                      {formatDistance(lastActivity.distance_meters) && (
                        <Text style={s.chip}>{formatDistance(lastActivity.distance_meters)}</Text>
                      )}
                      <Text style={s.chip}>{formatDuration(lastActivity.duration_seconds)}</Text>
                      {!!lastActivity.calories && (
                        <Text style={s.chip}>{Math.round(lastActivity.calories)} kcal</Text>
                      )}
                      <View style={{ backgroundColor: `${loadColor(load)}22`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: loadColor(load) }}>
                          Load: {load}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })() : (
              <Text style={{ fontSize: 13, color: colors.muted }}>
                No recent activities. Pull to refresh or sync in the Activity tab.
              </Text>
            )}
          </DashCard>
        )}

        {/* ── Next Meal + Groceries ── */}
        <View style={s.halfRow}>
          {/* Next Meal */}
          <DashCard title="Next Meal" style={{ flex: 1 }}>
            {nextMeal ? (
              <>
                <Text style={s.mealTag}>{nextMeal.tag}</Text>
                <Text style={s.mealName} numberOfLines={2}>{nextMeal.name}</Text>
                <Text style={s.mealMacro}>
                  {nextMeal.calories} kcal · {nextMeal.protein}g P · {nextMeal.carbs}g C
                </Text>
                <TouchableOpacity
                  style={s.primaryBtn}
                  onPress={() => router.push("/(tabs)/meals")}
                  activeOpacity={0.85}
                >
                  <Text style={s.primaryBtnText}>View Recipe →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 4 }}>
                  No meal plan yet.
                </Text>
                <TouchableOpacity
                  style={s.primaryBtn}
                  onPress={() => router.push("/(tabs)/meals")}
                  activeOpacity={0.85}
                >
                  <Text style={s.primaryBtnText}>Build Plan →</Text>
                </TouchableOpacity>
              </>
            )}
          </DashCard>

          {/* Groceries */}
          <DashCard title="Groceries" style={{ flex: 1 }}>
            <Text style={s.groceryCount}>{groceryItems.length}</Text>
            <Text style={s.groceryLabel}>
              {groceryItems.length === 1 ? "item" : "items"} in list
            </Text>
            <TouchableOpacity
              style={[s.primaryBtn, groceryItems.length === 0 && s.disabledBtn]}
              onPress={() => setGroceryModal(true)}
              activeOpacity={0.85}
              disabled={groceryItems.length === 0}
            >
              <Text style={s.primaryBtnText}>Export →</Text>
            </TouchableOpacity>
          </DashCard>
        </View>

        {/* ── Weekly Progress ── */}
        {weekly.length > 0 && (
          <DashCard
            title="Weekly Progress"
            rightLabel="Nutrition →"
            onRightPress={() => router.push("/(tabs)/nutrition")}
          >
            <View style={s.weekRow}>
              {weekly.map((d) => (
                <DayRing
                  key={d.date}
                  day={d.day}
                  kcal={d.kcal}
                  target={d.target}
                  primary={colors.primary}
                  border={colors.border}
                />
              ))}
            </View>
          </DashCard>
        )}

        {/* ── Ask Jonno nudge ── */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/agent")}
          activeOpacity={0.85}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            padding: 18, borderRadius: 18, backgroundColor: colors.primary,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 20 }}>✦</Text>
            <View>
              <Text style={{ fontSize: 15, fontWeight: "800", color: colors.primaryText }}>
                Ask Jonno
              </Text>
              <Text style={{ fontSize: 12, color: colors.primaryText, opacity: 0.65, marginTop: 1 }}>
                Get personalised nutrition advice
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 18, color: colors.primaryText, fontWeight: "700" }}>→</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Grocery Export Sheet ── */}
      <Modal
        visible={groceryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setGroceryModal(false)}
      >
        <View style={s.overlay}>
          {/* Tap outside to dismiss */}
          <TouchableOpacity
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setGroceryModal(false)}
            activeOpacity={1}
          />
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Export Grocery List</Text>

            <TouchableOpacity style={s.sheetBtn} onPress={handleShare}>
              <Text style={s.sheetBtnIcon}>📤</Text>
              <Text style={s.sheetBtnText}>Share list</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.sheetBtn}
              onPress={() => {
                setGroceryModal(false);
                Linking.openURL("https://www.ubereats.com/au");
              }}
            >
              <Text style={s.sheetBtnIcon}>🛵</Text>
              <Text style={s.sheetBtnText}>Open Uber Eats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.sheetBtn}
              onPress={() => {
                setGroceryModal(false);
                Linking.openURL("https://www.woolworths.com.au/shop");
              }}
            >
              <Text style={s.sheetBtnIcon}>🛒</Text>
              <Text style={s.sheetBtnText}>Open Woolworths</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sheetCancel} onPress={() => setGroceryModal(false)}>
              <Text style={s.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
