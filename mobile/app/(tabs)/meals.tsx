import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Modal, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet, apiPost } from "@/lib/api";
import { getCache, setCache, clearCache } from "@/lib/cache";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/theme/colors";

const PLAN_CACHE_KEY = "mealplan:7d";
const PLAN_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

interface Ingredient { id: string; name: string; grams: number }
interface MacroTotals { calories: number; protein_g: number; carbs_g: number; fat_g: number }
interface Meal {
  id: string; tag: string; name: string;
  ingredients: Ingredient[]; macro_totals: MacroTotals;
  prep_time_min: number; recipe_steps?: string[];
}
interface GroceryItem { name: string; qty: number; unit: string; category: string }
interface Plan {
  id?: string; start_date?: string; end_date?: string;
  targets: { day_date: string; calories: number; protein_g: number }[];
  meal_plan: Record<string, Meal[]>;
  grocery_list: GroceryItem[];
  rationale: string[];
  summary?: string;
}

const TAG_COLORS: Record<string, string> = {
  Breakfast: "#F59E0B", Lunch: "#10B981", Dinner: "#6366F1", Snack: "#F97316",
};

function MealCard({ meal, onPress }: { meal: Meal; onPress: () => void }) {
  return (
    <TouchableOpacity style={mcard.card} onPress={onPress} activeOpacity={0.85}>
      <View style={mcard.header}>
        <View style={[mcard.tagBadge, { backgroundColor: TAG_COLORS[meal.tag] + "22" }]}>
          <Text style={[mcard.tagText, { color: TAG_COLORS[meal.tag] }]}>{meal.tag}</Text>
        </View>
        <Text style={mcard.prep}>{meal.prep_time_min} min</Text>
      </View>
      <Text style={mcard.name}>{meal.name}</Text>
      <View style={mcard.macros}>
        {[
          { label: "kcal", value: meal.macro_totals.calories, color: "#F97316" },
          { label: "P", value: Math.round(meal.macro_totals.protein_g), color: "#10B981" },
          { label: "C", value: Math.round(meal.macro_totals.carbs_g), color: "#F59E0B" },
          { label: "F", value: Math.round(meal.macro_totals.fat_g), color: "#6366F1" },
        ].map(({ label, value, color }) => (
          <View key={label} style={[mcard.chip, { backgroundColor: color + "15" }]}>
            <Text style={[mcard.chipText, { color }]}>{value}{label}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const mcard = StyleSheet.create({
  card: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", gap: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: "700" },
  prep: { fontSize: 11, color: "rgba(245,245,247,0.35)" },
  name: { fontSize: 15, fontWeight: "700", color: "#F5F5F7" },
  macros: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: "700" },
});

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.bg },
    content: { padding: 20, gap: 16, paddingBottom: 40 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    heading: { fontSize: 26, fontWeight: "800", color: c.text },
    refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.inputBg, alignItems: "center", justifyContent: "center" },
    refreshIcon: { fontSize: 18, color: c.muted },
    groceryBtn: { backgroundColor: c.primaryAlpha, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    groceryBtnText: { fontSize: 13, fontWeight: "700", color: c.primary },
    emptyState: { alignItems: "center", gap: 12, paddingVertical: 40 },
    emptyTitle: { fontSize: 20, fontWeight: "800", color: c.text },
    emptySub: { fontSize: 14, color: c.muted, textAlign: "center", lineHeight: 20 },
    generateBtn: { backgroundColor: c.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
    generateBtnText: { color: c.primaryText, fontWeight: "800", fontSize: 16 },
    summaryCard: { backgroundColor: c.primaryAlpha, borderRadius: 16, padding: 16 },
    summaryText: { fontSize: 14, color: c.text, lineHeight: 20 },
    dayScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
    dayRow: { flexDirection: "row", gap: 8, paddingRight: 20 },
    dayChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
    dayChipActive: { backgroundColor: c.primary, borderColor: c.primary },
    dayChipText: { fontSize: 13, fontWeight: "600", color: c.muted },
    dayChipTextActive: { color: c.primaryText },
    mealsSection: { gap: 12 },
    noMeals: { fontSize: 14, color: c.mutedMore, textAlign: "center" },
    regenBtn: { backgroundColor: c.card, borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: c.border },
    regenBtnText: { color: c.primary, fontWeight: "700", fontSize: 14 },
  });
}

export default function MealsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showGrocery, setShowGrocery] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  async function fetchPlan(bust = false) {
    if (bust) clearCache(PLAN_CACHE_KEY);
    const cached = getCache<Plan>(PLAN_CACHE_KEY, PLAN_MAX_AGE_MS);
    if (cached) {
      setPlan(cached);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const res = await apiGet<{ plan: Plan | null }>("/api/optimizer/create");
    const fetched = res?.plan ?? null;
    if (fetched) setCache(PLAN_CACHE_KEY, fetched);
    setPlan(fetched);
    setLoading(false);
    setRefreshing(false);
  }

  async function generatePlan() {
    setGenerating(true);
    const res = await apiPost<{ plan: Plan }>("/api/optimizer/create", {});
    if (res?.plan) {
      setCache(PLAN_CACHE_KEY, res.plan);
      setPlan(res.plan);
    }
    setGenerating(false);
  }

  useEffect(() => { fetchPlan(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchPlan(true); }, []);

  const days = plan
    ? Object.keys(plan.meal_plan).sort()
    : Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i);
        return d.toISOString().split("T")[0];
      });

  const currentDay = days[selectedDay];
  const todayMeals = plan?.meal_plan[currentDay] ?? [];

  function dayLabel(dateStr: string, idx: number) {
    const d = new Date(dateStr);
    return idx === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
  }

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
          <Text style={styles.heading}>Meal Plan</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => { setRefreshing(true); fetchPlan(true); }}
              disabled={refreshing || loading}
            >
              <Text style={styles.refreshIcon}>{refreshing ? "⏳" : "↻"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.groceryBtn}
              onPress={() => setShowGrocery(true)}
              disabled={!plan}
            >
              <Text style={styles.groceryBtnText}>Grocery List</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Generate button */}
        {!plan && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No plan yet</Text>
            <Text style={styles.emptySub}>Generate a personalised 7-day meal plan based on your training.</Text>
            <TouchableOpacity
              style={[styles.generateBtn, generating && { opacity: 0.6 }]}
              onPress={generatePlan}
              disabled={generating}
              activeOpacity={0.85}
            >
              {generating
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.generateBtnText}>Generate Plan ✦</Text>}
            </TouchableOpacity>
          </View>
        )}

        {plan && (
          <>
            {/* Summary */}
            {plan.summary && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>{plan.summary}</Text>
              </View>
            )}

            {/* Day picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
              <View style={styles.dayRow}>
                {days.map((d, idx) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayChip, selectedDay === idx && styles.dayChipActive]}
                    onPress={() => setSelectedDay(idx)}
                  >
                    <Text style={[styles.dayChipText, selectedDay === idx && styles.dayChipTextActive]}>
                      {dayLabel(d, idx)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Meals */}
            <View style={styles.mealsSection}>
              {todayMeals.length > 0 ? (
                todayMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} onPress={() => setSelectedMeal(meal)} />
                ))
              ) : (
                <Text style={styles.noMeals}>No meals for this day.</Text>
              )}
            </View>

            {/* Regenerate */}
            <TouchableOpacity
              style={[styles.regenBtn, generating && { opacity: 0.6 }]}
              onPress={generatePlan}
              disabled={generating}
              activeOpacity={0.85}
            >
              {generating
                ? <ActivityIndicator color={colors.primary} size="small" />
                : <Text style={styles.regenBtnText}>Regenerate Plan</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Recipe modal */}
      <Modal visible={!!selectedMeal} transparent animationType="slide">
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.handle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={modal.title}>{selectedMeal?.name}</Text>
              <Text style={modal.section}>Ingredients</Text>
              {selectedMeal?.ingredients.map((ing) => (
                <Text key={ing.id} style={modal.ingredient}>• {ing.name} — {ing.grams}g</Text>
              ))}
              {selectedMeal?.recipe_steps && selectedMeal.recipe_steps.length > 0 && (
                <>
                  <Text style={modal.section}>Steps</Text>
                  {selectedMeal.recipe_steps.map((step, i) => (
                    <Text key={i} style={modal.step}>{i + 1}. {step}</Text>
                  ))}
                </>
              )}
            </ScrollView>
            <TouchableOpacity style={modal.closeBtn} onPress={() => setSelectedMeal(null)}>
              <Text style={modal.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Grocery modal */}
      <Modal visible={showGrocery} transparent animationType="slide">
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.handle} />
            <Text style={modal.title}>Grocery List</Text>
            <FlatList
              data={plan?.grocery_list ?? []}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <View style={grocery.row}>
                  <Text style={grocery.name}>{item.name}</Text>
                  <Text style={grocery.qty}>{item.qty}{item.unit}</Text>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#0B0B0B" }} />}
            />
            <TouchableOpacity style={modal.closeBtn} onPress={() => setShowGrocery(false)}>
              <Text style={modal.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "80%", gap: 12 },
  handle: { width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, alignSelf: "center", marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "800", color: "#F5F5F7" },
  section: { fontSize: 12, fontWeight: "700", color: "rgba(245,245,247,0.55)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 8 },
  ingredient: { fontSize: 14, color: "#F5F5F7", paddingVertical: 2 },
  step: { fontSize: 14, color: "#F5F5F7", lineHeight: 22, paddingVertical: 2 },
  closeBtn: { backgroundColor: "#0B0B0B", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  closeBtnText: { fontWeight: "700", color: "#F5F5F7", fontSize: 15 },
});

const grocery = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  name: { fontSize: 14, color: "#F5F5F7", fontWeight: "500" },
  qty: { fontSize: 14, color: "rgba(245,245,247,0.55)", fontWeight: "600" },
});
