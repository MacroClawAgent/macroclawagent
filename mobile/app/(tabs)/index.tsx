import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity, Modal, Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiGet, apiPost } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { TargetTile } from "@/components/TargetTile";
import { ProgressBar } from "@/components/ProgressBar";
import { WeeklyChips } from "@/components/WeeklyChips";
import { NutritionLog, ActivityRow, MealItem } from "@/types";
import { AppColors } from "@/theme/colors";

// ─── Cache ──────────────────────────────────────────────────────
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
  plan?: { grocery_list?: GroceryItem[] };
  grocery_list?: GroceryItem[];
}

// ─── Helpers ────────────────────────────────────────────────────
function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function isToday(isoString: string) {
  return isoString.startsWith(new Date().toISOString().split("T")[0]);
}

function getDayType(activity: ActivityRow | null): string {
  if (!activity) return "Performance";
  const map: Record<string, string> = { Run: "Run", Ride: "Ride", Swim: "Swim" };
  return map[activity.type] ?? "Training";
}

function loadLabel(a: ActivityRow): "Low" | "Moderate" | "High" {
  const hr = a.avg_heart_rate;
  const min = a.duration_seconds / 60;
  if ((hr && hr > 155) || min > 90) return "High";
  if ((hr && hr > 130) || min > 40) return "Moderate";
  return "Low";
}

function formatDist(meters: number | null): string {
  if (!meters) return "—";
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtNum(n: number): string {
  return n >= 1000 ? n.toLocaleString() : String(n);
}

// ─── Inline sub-components ──────────────────────────────────────

/** Simple mini sparkline using proportional bars */
function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 26, gap: 2 }}>
      {points.map((h, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: Math.max(4, 26 * h),
            backgroundColor: color,
            borderRadius: 2,
            opacity: i === points.length - 1 ? 1 : 0.3 + i * 0.08,
          }}
        />
      ))}
    </View>
  );
}

/** Loading skeleton block */
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
    content: { padding: 16, gap: 14, paddingBottom: 52 },

    // ── Header ──
    topBar: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    },
    brand: { flexDirection: "row", alignItems: "center", gap: 8 },
    brandDot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary,
    },
    brandText: { fontSize: 14, fontWeight: "800", letterSpacing: 1.5, color: c.text },
    topRight: { flexDirection: "row", alignItems: "center", gap: 10 },
    bellWrap: { position: "relative" },
    bellBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
      justifyContent: "center", alignItems: "center",
    },
    bellDot: {
      position: "absolute", top: 4, right: 4,
      width: 8, height: 8, borderRadius: 4, backgroundColor: c.danger,
      borderWidth: 1.5, borderColor: c.bg,
    },
    avatarBadge: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: c.primary, justifyContent: "center", alignItems: "center",
    },
    avatarText: { fontSize: 15, fontWeight: "800", color: c.primaryText },

    // ── Greeting ──
    greetText: { fontSize: 27, fontWeight: "800", color: c.text, lineHeight: 33 },
    subRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
    subIcon: { fontSize: 14 },
    subText: { fontSize: 13, color: c.muted },
    subHighlight: { color: c.primary, fontWeight: "700" },

    // ── Card shell ──
    card: {
      backgroundColor: c.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: c.border,
      gap: 12,
    },
    cardHeader: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    },
    cardTitle: { fontSize: 15, fontWeight: "700", color: c.text },
    editLink: { fontSize: 13, fontWeight: "600", color: c.primary },

    // ── Target tiles row ──
    tilesRow: { flexDirection: "row", gap: 8 },

    // ── On-track row ──
    trackRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    trackText: { fontSize: 12, color: c.muted },
    trackPct: { fontSize: 13, fontWeight: "700", color: c.primary },

    // ── Training card ──
    trainingBody: { flexDirection: "row", alignItems: "center", gap: 12 },
    trainingLeft: { flex: 3, gap: 5 },
    trainingTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" },
    trainingTitle: { fontSize: 14, fontWeight: "700", color: c.text, flex: 1 },
    trainingTime: { fontSize: 12, color: c.muted, marginLeft: 15 },
    trainingRight: { flex: 2, alignItems: "flex-end", gap: 6 },
    loadRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    loadLabel: { fontSize: 11, fontWeight: "600", color: c.muted },
    closeBtn: {
      width: 26, height: 26, borderRadius: 13,
      backgroundColor: c.danger, justifyContent: "center", alignItems: "center",
    },
    closeBtnText: { fontSize: 11, fontWeight: "800", color: "#FFF" },

    // ── Strava CTA ──
    stravaCard: {
      backgroundColor: "#FC4C02", borderRadius: 20, padding: 18,
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    stravaLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
    stravaTitle: { fontSize: 15, fontWeight: "800", color: "#FFF" },
    stravaSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
    stravaArrow: { fontSize: 20, color: "#FFF", fontWeight: "700" },

    // ── Half row ──
    halfRow: { flexDirection: "row", gap: 12 },

    // ── Next Meal card ──
    mealThumb: {
      width: 48, height: 48, borderRadius: 12,
      backgroundColor: c.card2, justifyContent: "center", alignItems: "center",
    },
    mealThumbEmoji: { fontSize: 24 },
    mealInfo: { flex: 1, gap: 2 },
    mealName: { fontSize: 14, fontWeight: "700", color: c.text },
    mealEta: { fontSize: 12, color: c.muted },
    mealRow: { flexDirection: "row", alignItems: "center", gap: 10 },

    // ── Groceries card ──
    groceryCount: { fontSize: 32, fontWeight: "900", color: c.primary },
    groceryLabel: { fontSize: 12, color: c.muted },
    appIconRow: { flexDirection: "row", gap: 6, marginTop: 4 },
    appIconBox: {
      width: 28, height: 28, borderRadius: 8,
      justifyContent: "center", alignItems: "center",
    },
    appIconText: { fontSize: 16 },

    // ── Primary pill button ──
    pillBtn: {
      backgroundColor: c.primary, borderRadius: 50,
      paddingVertical: 9, paddingHorizontal: 14,
      alignItems: "center", marginTop: 4,
    },
    pillBtnText: { fontSize: 13, fontWeight: "800", color: c.primaryText },
    pillBtnDisabled: { opacity: 0.4 },

    // ── Weekly progress ──
    sectionHeader: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      marginBottom: 4,
    },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: c.text },
    seeAll: { fontSize: 13, fontWeight: "600", color: c.primary },

    // ── Ask Jonno nudge ──
    jonnoCard: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      padding: 18, borderRadius: 20, backgroundColor: c.primary,
    },
    jonnoLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    jonnoTitle: { fontSize: 15, fontWeight: "800", color: c.primaryText },
    jonnoSub: { fontSize: 12, color: c.primaryText, opacity: 0.65, marginTop: 1 },

    // ── Grocery sheet ──
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: "#161616", borderTopLeftRadius: 26, borderTopRightRadius: 26,
      padding: 24, paddingBottom: 44, gap: 10,
    },
    sheetTitle: { fontSize: 17, fontWeight: "800", color: "#F5F5F7", marginBottom: 6 },
    sheetBtn: {
      flexDirection: "row", alignItems: "center", gap: 14,
      padding: 16, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14,
    },
    sheetBtnIcon: { fontSize: 20 },
    sheetBtnText: { fontSize: 15, fontWeight: "600", color: "#F5F5F7" },
    sheetCancel: { padding: 14, alignItems: "center" },
    sheetCancelText: { fontSize: 15, fontWeight: "600", color: "rgba(245,245,247,0.4)" },
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
  const [trainingVisible, setTrainingVisible] = useState(true);
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

      // Optimizer — 6h client-side cache
      if (!force) {
        const hit = getCache<OptimizerResponse>(OPTIMIZER_KEY, SIX_HOURS);
        if (hit) {
          setGroceryItems(hit.plan?.grocery_list ?? hit.grocery_list ?? []);
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

  // ── Derived data ──
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

  const onTrackPct = goals.calorie_goal > 0
    ? Math.min(Math.round((consumed.calories / goals.calorie_goal) * 100), 100)
    : 0;

  const nextMeal = todayData?.mealLog?.[0] ?? null;
  const weekly   = todayData?.weeklyCalories ?? [];
  const dayType  = getDayType(lastActivity);

  // Sparkline: use last 7 weekly kcal values normalised 0–1
  const sparkPoints: number[] = weekly.length >= 2
    ? (() => {
        const max = Math.max(...weekly.map((d) => d.kcal), 1);
        return weekly.slice(-7).map((d) => Math.max(0.08, d.kcal / max));
      })()
    : [0.3, 0.55, 0.45, 0.72, 0.6, 0.85, 0.7];

  async function handleShare() {
    const lines = groceryItems.map((g) => `• ${g.name} × ${g.qty}${g.unit}`).join("\n");
    const text = lines ? `Jonno Grocery List:\n\n${lines}` : "Your grocery list is empty.";
    try { await Share.share({ message: text, title: "Jonno Grocery List" }); } catch { /* cancelled */ }
  }

  // ── Skeleton ──
  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.content}>
          <View style={s.topBar}>
            <Skel h={16} style={{ width: 90 }} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Skel h={38} style={{ width: 38, borderRadius: 19 }} />
              <Skel h={38} style={{ width: 38, borderRadius: 19 }} />
            </View>
          </View>
          <Skel h={32} style={{ width: "60%", marginTop: 6 }} />
          <Skel h={16} style={{ width: "50%" }} />
          <Skel h={190} style={{ borderRadius: 20 }} />
          <Skel h={90} style={{ borderRadius: 20 }} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Skel h={160} style={{ flex: 1.2, borderRadius: 20 }} />
            <Skel h={160} style={{ flex: 1, borderRadius: 20 }} />
          </View>
          <Skel h={80} style={{ borderRadius: 20 }} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Main ──
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
        {/* ── Header ── */}
        <View style={s.topBar}>
          <View style={s.brand}>
            <View style={s.brandDot} />
            <Text style={s.brandText}>JONNO AI</Text>
          </View>
          <View style={s.topRight}>
            <View style={s.bellWrap}>
              <View style={s.bellBtn}>
                <Text style={{ fontSize: 16 }}>🔔</Text>
              </View>
              <View style={s.bellDot} />
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
          <Text style={s.greetText}>{greetingWord()}, {firstName} 👋</Text>
          <View style={s.subRow}>
            <Text style={s.subIcon}>⚡</Text>
            <Text style={s.subText}>
              Today is a{" "}
              <Text style={s.subHighlight}>{dayType}</Text>
              {" "}day
            </Text>
          </View>
        </View>

        {/* ── Card 1: Today's Targets ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Today's Targets</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/nutrition")}
              activeOpacity={0.7}
            >
              <Text style={s.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* 4 tiles — SAME ROW, never wraps */}
          <View style={s.tilesRow}>
            <TargetTile
              label="Calories" value={fmtNum(goals.calorie_goal)}
              unit="kcal" icon="🔥" color="#F97316"
            />
            <TargetTile
              label="Protein" value={`${goals.protein_goal}`}
              unit="g" icon="🥩" color="#10B981"
            />
            <TargetTile
              label="Carbs" value={`${goals.carbs_goal}`}
              unit="g" icon="🌾" color="#F59E0B"
            />
            <TargetTile
              label="Fat" value={`${goals.fat_goal}`}
              unit="g" icon="💧" color="#6366F1"
            />
          </View>

          {/* On-track row */}
          <View style={s.trackRow}>
            <Text style={s.trackText}>
              {onTrackPct >= 80 ? "You're on track 🔥" : onTrackPct >= 40 ? "Keep going 💪" : "Let's fuel up 🍽️"}
            </Text>
            <Text style={s.trackPct}>{onTrackPct}%</Text>
          </View>

          <ProgressBar
            progress={onTrackPct / 100}
            color={onTrackPct >= 105 ? colors.danger : colors.primary}
          />
        </View>

        {/* ── Card 2: Today's Training ── */}
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
        ) : trainingVisible ? (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>Today's Training (Strava)</Text>
              <TouchableOpacity
                style={s.closeBtn}
                onPress={() => setTrainingVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {lastActivity ? (() => {
              const load = loadLabel(lastActivity);
              const loadColor = load === "High" ? colors.danger : load === "Moderate" ? "#F59E0B" : "#22C55E";
              return (
                <View style={s.trainingBody}>
                  {/* Left: activity info */}
                  <View style={s.trainingLeft}>
                    <View style={s.trainingTitleRow}>
                      <View style={s.greenDot} />
                      <Text style={s.trainingTitle} numberOfLines={1}>
                        {lastActivity.type} — {formatDist(lastActivity.distance_meters)}
                      </Text>
                    </View>
                    <Text style={s.trainingTime}>
                      {isToday(lastActivity.started_at) ? "Today" : "Recent"},{" "}
                      {formatTime(lastActivity.started_at)}
                    </Text>
                  </View>

                  {/* Right: sparkline + load badge */}
                  <View style={s.trainingRight}>
                    <MiniSparkline points={sparkPoints} color={colors.primary} />
                    <View style={s.loadRow}>
                      <Text style={s.loadLabel}>Load: </Text>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: loadColor }}>
                        {load}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })() : (
              <Text style={{ fontSize: 13, color: colors.muted }}>
                No activities yet. Sync in the Activity tab.
              </Text>
            )}
          </View>
        ) : null}

        {/* ── Cards 3 + 4: Next Meal | Groceries ── */}
        <View style={s.halfRow}>
          {/* Next Meal — slightly wider */}
          <View style={[s.card, { flex: 1.2, gap: 10 }]}>
            <Text style={s.cardTitle}>Next Meal</Text>

            {nextMeal ? (
              <>
                <View style={s.mealRow}>
                  <View style={s.mealThumb}>
                    <Text style={s.mealThumbEmoji}>
                      {nextMeal.tag === "Breakfast" ? "🥣" :
                       nextMeal.tag === "Lunch" ? "🥗" :
                       nextMeal.tag === "Dinner" ? "🍗" : "🥨"}
                    </Text>
                  </View>
                  <View style={s.mealInfo}>
                    <Text style={s.mealName} numberOfLines={2}>{nextMeal.name}</Text>
                    <Text style={s.mealEta}>{nextMeal.tag}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={s.pillBtn}
                  onPress={() => router.push("/(tabs)/meals")}
                  activeOpacity={0.85}
                >
                  <Text style={s.pillBtnText}>View Recipe →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 12, color: colors.muted }}>No meal plan yet.</Text>
                <TouchableOpacity
                  style={s.pillBtn}
                  onPress={() => router.push("/(tabs)/meals")}
                  activeOpacity={0.85}
                >
                  <Text style={s.pillBtnText}>Build Plan →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Groceries */}
          <View style={[s.card, { flex: 1, gap: 6 }]}>
            <Text style={s.cardTitle}>Groceries</Text>
            <Text style={s.groceryCount}>{groceryItems.length}</Text>
            <Text style={s.groceryLabel}>
              {groceryItems.length === 1 ? "item" : "items"}
            </Text>
            <TouchableOpacity
              style={[s.pillBtn, groceryItems.length === 0 && s.pillBtnDisabled]}
              onPress={() => setGroceryModal(true)}
              activeOpacity={0.85}
              disabled={groceryItems.length === 0}
            >
              <Text style={s.pillBtnText}>Export →</Text>
            </TouchableOpacity>
            {/* App icons */}
            <View style={s.appIconRow}>
              {[
                { emoji: "🛵", bg: "#06B6D4" },
                { emoji: "🛒", bg: "#16A34A" },
                { emoji: "🏪", bg: "#7C3AED" },
              ].map((app) => (
                <View key={app.emoji} style={[s.appIconBox, { backgroundColor: app.bg }]}>
                  <Text style={s.appIconText}>{app.emoji}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Weekly Progress ── */}
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Weekly Progress</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/nutrition")} activeOpacity={0.7}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <WeeklyChips
            days={
              weekly.length > 0
                ? weekly
                : Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(Date.now() - (6 - i) * 86400000);
                    return {
                      date: d.toISOString().split("T")[0],
                      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
                      kcal: 0,
                      target: goals.calorie_goal,
                    };
                  })
            }
            primary={colors.primary}
            primaryText={colors.primaryText}
          />
        </View>

        {/* ── Ask Jonno CTA ── */}
        <TouchableOpacity
          style={s.jonnoCard}
          onPress={() => router.push("/(tabs)/agent")}
          activeOpacity={0.85}
        >
          <View style={s.jonnoLeft}>
            <Text style={{ fontSize: 20 }}>✦</Text>
            <View>
              <Text style={s.jonnoTitle}>Ask Jonno</Text>
              <Text style={s.jonnoSub}>Get personalised nutrition advice</Text>
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
              onPress={() => { setGroceryModal(false); Linking.openURL("https://www.ubereats.com/au"); }}
            >
              <Text style={s.sheetBtnIcon}>🛵</Text>
              <Text style={s.sheetBtnText}>Open Uber Eats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.sheetBtn}
              onPress={() => { setGroceryModal(false); Linking.openURL("https://www.woolworths.com.au/shop"); }}
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
