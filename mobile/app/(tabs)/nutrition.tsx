import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Modal, TextInput,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiDelete, apiPatch } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/theme/colors";

interface FoodItem {
  id: string;
  meal_tag: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface NutritionData {
  calories_consumed: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  hydration_ml: number;
}

const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
type MealTag = typeof MEAL_TAGS[number];
const TAG_COLORS: Record<MealTag, string> = {
  Breakfast: "#F59E0B", Lunch: "#10B981", Dinner: "#6366F1", Snack: "#F97316",
};
const HYDRATION_PRESETS = [200, 330, 500, 750];

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const { colors } = useTheme();
  const pct = Math.min(1, goal > 0 ? value / goal : 0);
  const over = goal > 0 && value > goal;
  return (
    <View style={bar.row}>
      {!!label && (
        <View style={bar.labelRow}>
          <Text style={[bar.label, { color: colors.muted }]}>{label}</Text>
          <Text style={[bar.value, { color: over ? "#EF4444" : colors.text }]}>
            {Math.round(value)}<Text style={[bar.goal, { color: colors.mutedMore }]}> / {goal}</Text>
          </Text>
        </View>
      )}
      <View style={[bar.track, { backgroundColor: colors.border }]}>
        <View style={[bar.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: over ? "#EF4444" : color }]} />
      </View>
    </View>
  );
}

const bar = StyleSheet.create({
  row: { gap: 5 },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 13, fontWeight: "600" },
  value: { fontSize: 13, fontWeight: "700" },
  goal: { fontWeight: "400" },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
});

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.bg },
    content: { padding: 20, gap: 16, paddingBottom: 40 },
    heading: { fontSize: 26, fontWeight: "800", color: c.text },
    date: { fontSize: 13, color: c.muted, marginTop: -8 },
    card: { backgroundColor: c.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: c.border, gap: 14 },
    cardTitle: { fontSize: 13, fontWeight: "700", color: c.text, textTransform: "uppercase", letterSpacing: 0.5 },
    calorieRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
    calorieStat: { alignItems: "center", gap: 2 },
    calorieBig: { fontSize: 32, fontWeight: "800", color: c.text },
    calorieLabel: { fontSize: 11, color: c.mutedMore, fontWeight: "500" },
    calorieDivider: { width: 1, height: 44, backgroundColor: c.border },
    hydrationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    hydrationValue: { fontSize: 20, fontWeight: "800", color: c.primary },
    hydrationSub: { fontSize: 12, color: c.mutedMore },
    hydrationPresets: { flexDirection: "row", gap: 8 },
    hydrationBtn: { flex: 1, backgroundColor: c.primaryAlpha, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
    hydrationBtnText: { fontSize: 13, fontWeight: "700", color: c.primary },
    mealSection: { gap: 6 },
    mealHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    mealTagLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    addBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    addBtnText: { fontSize: 20, fontWeight: "700", lineHeight: 24 },
    foodItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    foodName: { flex: 1, fontSize: 14, color: c.text, fontWeight: "500" },
    foodCals: { fontSize: 13, fontWeight: "700", color: c.text },
    foodMacros: { fontSize: 11, color: c.mutedMore },
    deleteBtn: { padding: 4 },
    deleteBtnText: { fontSize: 16, color: c.mutedMore },
    emptyItem: { fontSize: 13, color: c.mutedMore, fontStyle: "italic", paddingVertical: 2 },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
    sheet: { backgroundColor: "#1C1C1E", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
    handle: { width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, alignSelf: "center", marginBottom: 4 },
    modalTitle: { fontSize: 20, fontWeight: "800", color: "#F5F5F7" },
    tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    tagChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    tagChipText: { fontSize: 13, fontWeight: "700" },
    inputLabel: { fontSize: 11, fontWeight: "700", color: "rgba(245,245,247,0.45)", textTransform: "uppercase", letterSpacing: 0.5 },
    modalInput: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#F5F5F7", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    macroInputRow: { flexDirection: "row", gap: 8 },
    macroInput: { flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, fontSize: 14, color: "#F5F5F7", textAlign: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    macroLabel: { fontSize: 10, color: "rgba(245,245,247,0.45)", textAlign: "center", marginTop: 3 },
    saveBtn: { backgroundColor: "#D4FF00", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
    saveBtnText: { fontWeight: "800", color: "#0B0B0B", fontSize: 16 },
    cancelBtn: { alignItems: "center", paddingVertical: 8 },
    cancelBtnText: { color: "rgba(245,245,247,0.45)", fontWeight: "600", fontSize: 14 },
  });
}

export default function NutritionScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { userProfile } = useAuth();

  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hydrationLoading, setHydrationLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTag, setAddTag] = useState<MealTag>("Breakfast");
  const [addName, setAddName] = useState("");
  const [addCals, setAddCals] = useState("");
  const [addProtein, setAddProtein] = useState("");
  const [addCarbs, setAddCarbs] = useState("");
  const [addFat, setAddFat] = useState("");
  const [saving, setSaving] = useState(false);

  const goals = {
    calorie_goal: userProfile?.calorie_goal ?? 2000,
    protein_goal: userProfile?.protein_goal ?? 120,
    carbs_goal: userProfile?.carbs_goal ?? 250,
    fat_goal: userProfile?.fat_goal ?? 70,
  };

  async function fetchData() {
    try {
      const [nutRes, itemsRes] = await Promise.all([
        apiGet<{ today: NutritionData | null }>("/api/nutrition/today"),
        apiGet<{ items: FoodItem[] }>("/api/nutrition/food-items"),
      ]);
      setNutrition(nutRes.today);
      setFoodItems(itemsRes.items ?? []);
    } catch { /* keep state */ }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { fetchData(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  const consumed = {
    calories: nutrition?.calories_consumed ?? 0,
    protein: Math.round(nutrition?.protein_g ?? 0),
    carbs: Math.round(nutrition?.carbs_g ?? 0),
    fat: Math.round(nutrition?.fat_g ?? 0),
    hydration: nutrition?.hydration_ml ?? 0,
  };

  async function addHydration(ml: number) {
    setHydrationLoading(true);
    const newTotal = consumed.hydration + ml;
    try {
      await apiPatch("/api/nutrition/today", { hydration_ml: newTotal });
      setNutrition((p) => ({ ...(p ?? { calories_consumed: 0, protein_g: 0, carbs_g: 0, fat_g: 0, hydration_ml: 0 }), hydration_ml: newTotal }));
    } catch { Alert.alert("Error", "Could not update hydration."); }
    finally { setHydrationLoading(false); }
  }

  async function handleAddFood() {
    if (!addName.trim() || !addCals) return;
    setSaving(true);
    try {
      const res = await apiPost<{ item: FoodItem }>("/api/nutrition/food-items", {
        meal_tag: addTag, name: addName.trim(),
        calories: parseInt(addCals, 10) || 0,
        protein_g: parseFloat(addProtein) || 0,
        carbs_g: parseFloat(addCarbs) || 0,
        fat_g: parseFloat(addFat) || 0,
      });
      setFoodItems((p) => [...p, res.item]);
      setNutrition((p) => {
        const base = p ?? { calories_consumed: 0, protein_g: 0, carbs_g: 0, fat_g: 0, hydration_ml: 0 };
        return { ...base, calories_consumed: base.calories_consumed + (parseInt(addCals, 10) || 0), protein_g: base.protein_g + (parseFloat(addProtein) || 0), carbs_g: base.carbs_g + (parseFloat(addCarbs) || 0), fat_g: base.fat_g + (parseFloat(addFat) || 0) };
      });
      setShowAddModal(false);
      setAddName(""); setAddCals(""); setAddProtein(""); setAddCarbs(""); setAddFat("");
    } catch { Alert.alert("Error", "Could not save food item."); }
    finally { setSaving(false); }
  }

  async function handleDeleteFood(item: FoodItem) {
    Alert.alert("Remove", `Remove "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
        try {
          await apiDelete(`/api/nutrition/food-items/${item.id}`);
          setFoodItems((p) => p.filter((f) => f.id !== item.id));
          setNutrition((p) => p ? { ...p, calories_consumed: Math.max(0, p.calories_consumed - item.calories), protein_g: Math.max(0, p.protein_g - item.protein_g), carbs_g: Math.max(0, p.carbs_g - item.carbs_g), fat_g: Math.max(0, p.fat_g - item.fat_g) } : p);
        } catch { Alert.alert("Error", "Could not remove item."); }
      }},
    ]);
  }

  if (loading) {
    return (<SafeAreaView style={styles.loadingContainer}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Nutrition</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Text>

        {/* Calories */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calories</Text>
          <View style={styles.calorieRow}>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieBig}>{consumed.calories}</Text>
              <Text style={styles.calorieLabel}>Eaten</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieStat}>
              <Text style={[styles.calorieBig, { color: colors.primary }]}>{Math.max(0, goals.calorie_goal - consumed.calories)}</Text>
              <Text style={styles.calorieLabel}>Remaining</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieStat}>
              <Text style={styles.calorieBig}>{goals.calorie_goal}</Text>
              <Text style={styles.calorieLabel}>Goal</Text>
            </View>
          </View>
        </View>

        {/* Macros */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macros</Text>
          <MacroBar label="Protein" value={consumed.protein} goal={goals.protein_goal} color="#10B981" />
          <MacroBar label="Carbs" value={consumed.carbs} goal={goals.carbs_goal} color="#F59E0B" />
          <MacroBar label="Fat" value={consumed.fat} goal={goals.fat_goal} color="#6366F1" />
        </View>

        {/* Hydration */}
        <View style={styles.card}>
          <View style={styles.hydrationHeader}>
            <View><Text style={styles.cardTitle}>Hydration</Text><Text style={styles.hydrationSub}>Goal: 2,000 ml</Text></View>
            <Text style={styles.hydrationValue}>{consumed.hydration.toLocaleString()} ml</Text>
          </View>
          <MacroBar label="" value={consumed.hydration} goal={2000} color="#4C7DFF" />
          {hydrationLoading ? <ActivityIndicator color={colors.primary} /> : (
            <View style={styles.hydrationPresets}>
              {HYDRATION_PRESETS.map((ml) => (
                <TouchableOpacity key={ml} style={styles.hydrationBtn} onPress={() => addHydration(ml)} activeOpacity={0.8}>
                  <Text style={styles.hydrationBtnText}>+{ml}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Food Log */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Food Log</Text>
          {MEAL_TAGS.map((tag) => {
            const tagItems = foodItems.filter((f) => f.meal_tag === tag);
            const tagColor = TAG_COLORS[tag];
            return (
              <View key={tag} style={styles.mealSection}>
                <View style={styles.mealHeader}>
                  <Text style={[styles.mealTagLabel, { color: tagColor }]}>{tag}</Text>
                  <TouchableOpacity style={[styles.addBtn, { backgroundColor: tagColor + "22" }]} onPress={() => { setAddTag(tag); setShowAddModal(true); }} activeOpacity={0.8}>
                    <Text style={[styles.addBtnText, { color: tagColor }]}>+</Text>
                  </TouchableOpacity>
                </View>
                {tagItems.length === 0
                  ? <Text style={styles.emptyItem}>No {tag.toLowerCase()} logged</Text>
                  : tagItems.map((item) => (
                    <View key={item.id} style={styles.foodItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.foodMacros}>P {Math.round(item.protein_g)}g · C {Math.round(item.carbs_g)}g · F {Math.round(item.fat_g)}g</Text>
                      </View>
                      <Text style={styles.foodCals}>{item.calories} kcal</Text>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteFood(item)}>
                        <Text style={styles.deleteBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Food Sheet */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Add Food</Text>

            <View style={styles.tagRow}>
              {MEAL_TAGS.map((tag) => {
                const active = addTag === tag;
                const color = TAG_COLORS[tag];
                return (
                  <TouchableOpacity key={tag} style={[styles.tagChip, { borderColor: active ? color : "rgba(255,255,255,0.15)", backgroundColor: active ? color + "22" : "transparent" }]} onPress={() => setAddTag(tag)} activeOpacity={0.8}>
                    <Text style={[styles.tagChipText, { color: active ? color : "rgba(245,245,247,0.5)" }]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ gap: 6 }}>
              <Text style={styles.inputLabel}>Food Name</Text>
              <TextInput style={styles.modalInput} value={addName} onChangeText={setAddName} placeholder="e.g. Chicken breast, Oats..." placeholderTextColor="rgba(245,245,247,0.3)" autoFocus />
            </View>

            <View style={{ gap: 6 }}>
              <Text style={styles.inputLabel}>Calories</Text>
              <TextInput style={styles.modalInput} value={addCals} onChangeText={setAddCals} placeholder="kcal" placeholderTextColor="rgba(245,245,247,0.3)" keyboardType="number-pad" />
            </View>

            <View style={{ gap: 6 }}>
              <Text style={styles.inputLabel}>Macros (optional)</Text>
              <View style={styles.macroInputRow}>
                {[{ label: "Protein g", value: addProtein, setter: setAddProtein }, { label: "Carbs g", value: addCarbs, setter: setAddCarbs }, { label: "Fat g", value: addFat, setter: setAddFat }].map(({ label, value, setter }) => (
                  <View key={label} style={{ flex: 1 }}>
                    <TextInput style={styles.macroInput} value={value} onChangeText={setter} placeholder="0" placeholderTextColor="rgba(245,245,247,0.3)" keyboardType="decimal-pad" />
                    <Text style={styles.macroLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={[styles.saveBtn, (!addName.trim() || !addCals) && { opacity: 0.4 }]} onPress={handleAddFood} disabled={!addName.trim() || !addCals || saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#0B0B0B" /> : <Text style={styles.saveBtnText}>Add to {addTag}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
