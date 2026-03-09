import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPatch } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/theme/colors";

interface NutritionData {
  date: string;
  calories_consumed: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  hydration_ml: number;
}

interface Goals {
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
}

function MacroBar({
  label, value, goal, color,
}: { label: string; value: number; goal: number; color: string }) {
  const { colors } = useTheme();
  const pct = Math.min(1, goal > 0 ? value / goal : 0);
  return (
    <View style={bar.row}>
      <View style={bar.labelRow}>
        <Text style={[bar.label, { color: colors.muted }]}>{label}</Text>
        <Text style={[bar.value, { color: colors.text }]}>{value} <Text style={[bar.goal, { color: colors.mutedMore }]}>/ {goal}</Text></Text>
      </View>
      <View style={[bar.track, { backgroundColor: colors.border }]}>
        <View style={[bar.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const bar = StyleSheet.create({
  row: { gap: 6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 13, fontWeight: "600" },
  value: { fontSize: 13, fontWeight: "700" },
  goal: { fontWeight: "400" },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
});

const HYDRATION_STEPS = [250, 500, 750, 1000, 1500, 2000, 2500, 3000];

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.bg },
    content: { padding: 20, gap: 16, paddingBottom: 40 },
    heading: { fontSize: 26, fontWeight: "800", color: c.text },
    date: { fontSize: 13, color: c.muted, marginTop: -8 },
    card: { backgroundColor: c.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: c.border, gap: 12 },
    cardTitle: { fontSize: 13, fontWeight: "700", color: c.text, textTransform: "uppercase", letterSpacing: 0.5 },
    calorieRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
    calorieStat: { alignItems: "center", gap: 2 },
    calorieBig: { fontSize: 28, fontWeight: "800", color: c.text },
    calorieLabel: { fontSize: 11, color: c.mutedMore, fontWeight: "500" },
    calorieDivider: { width: 1, height: 40, backgroundColor: c.bg },
    hydrationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    hydrationValue: { fontSize: 18, fontWeight: "800", color: c.primary },
    hydrationSub: { fontSize: 12, color: c.mutedMore, marginTop: -8 },
    hydrationButtons: { flexDirection: "row", gap: 10 },
    hydrationBtn: {
      flex: 1, backgroundColor: c.primaryAlpha, borderRadius: 12,
      paddingVertical: 12, alignItems: "center",
    },
    hydrationBtnText: { fontSize: 14, fontWeight: "700", color: c.primary },
    emptyHint: { fontSize: 13, color: c.mutedMore, textAlign: "center", lineHeight: 20 },
  });
}

export default function NutritionScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { userProfile } = useAuth();
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hydrationLoading, setHydrationLoading] = useState(false);

  const goals: Goals = {
    calorie_goal: userProfile?.calorie_goal ?? 2000,
    protein_goal: userProfile?.protein_goal ?? 120,
    carbs_goal: userProfile?.carbs_goal ?? 250,
    fat_goal: userProfile?.fat_goal ?? 70,
  };

  async function fetchData() {
    try {
      const res = await apiGet<{ log: NutritionData; goals: Goals }>("/api/nutrition/today");
      setNutrition(res?.log ?? null);
    } catch {
      // Not signed in yet or network issue — show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  async function addHydration(ml: number) {
    setHydrationLoading(true);
    const current = nutrition?.hydration_ml ?? 0;
    await apiPatch("/api/nutrition/today", { hydration_ml: current + ml });
    await fetchData();
    setHydrationLoading(false);
  }

  const consumed = {
    calories: nutrition?.calories_consumed ?? 0,
    protein: Math.round(nutrition?.protein_g ?? 0),
    carbs: Math.round(nutrition?.carbs_g ?? 0),
    fat: Math.round(nutrition?.fat_g ?? 0),
    hydration: nutrition?.hydration_ml ?? 0,
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
        <Text style={styles.heading}>Nutrition</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </Text>

        {/* Calorie summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calories</Text>
          <View style={styles.calorieRow}>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieBig}>{consumed.calories}</Text>
              <Text style={styles.calorieLabel}>eaten</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieStat}>
              <Text style={[styles.calorieBig, { color: "#10B981" }]}>
                {Math.max(0, goals.calorie_goal - consumed.calories)}
              </Text>
              <Text style={styles.calorieLabel}>remaining</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieStat}>
              <Text style={styles.calorieBig}>{goals.calorie_goal}</Text>
              <Text style={styles.calorieLabel}>goal</Text>
            </View>
          </View>
        </View>

        {/* Macro bars */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macros</Text>
          <View style={{ gap: 16 }}>
            <MacroBar label="Protein" value={consumed.protein} goal={goals.protein_goal} color="#10B981" />
            <MacroBar label="Carbs" value={consumed.carbs} goal={goals.carbs_goal} color="#F59E0B" />
            <MacroBar label="Fat" value={consumed.fat} goal={goals.fat_goal} color="#6366F1" />
          </View>
        </View>

        {/* Hydration */}
        <View style={styles.card}>
          <View style={styles.hydrationHeader}>
            <Text style={styles.cardTitle}>Hydration</Text>
            <Text style={styles.hydrationValue}>{consumed.hydration} ml</Text>
          </View>
          <Text style={styles.hydrationSub}>Log your water intake</Text>
          <View style={styles.hydrationButtons}>
            {[250, 500].map((ml) => (
              <TouchableOpacity
                key={ml}
                style={styles.hydrationBtn}
                onPress={() => addHydration(ml)}
                disabled={hydrationLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.hydrationBtnText}>+{ml}ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {!nutrition && (
          <Text style={styles.emptyHint}>No nutrition data logged today. Meals will appear here once synced.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

