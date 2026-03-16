import React, { useEffect, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Modal, Platform,
  RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  Breakfast: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  Lunch: { color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  Dinner: { color: "#6366F1", bg: "rgba(99,102,241,0.10)" },
  Snack: { color: "#F97316", bg: "rgba(249,115,22,0.10)" },
};
const TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

interface FoodItem { id: string; meal_tag: string; name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; batch_id?: string | null; dish_name?: string | null; }
type Dish = { key: string; dishName: string; items: FoodItem[]; totalCals: number; };
interface NutritionData { log: { calories_consumed: number; protein_g: number; carbs_g: number; fat_g: number; }; goals: { calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number; }; foodItems: FoodItem[]; }

export default function LogFoodScreen() {
  const { colors } = useTheme();
  const { userProfile } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addTag, setAddTag] = useState<string>("Breakfast");
  const [addName, setAddName] = useState("");
  const [addCals, setAddCals] = useState("");
  const [addProtein, setAddProtein] = useState("");
  const [addCarbs, setAddCarbs] = useState("");
  const [addFat, setAddFat] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set());

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [logRes, itemsRes] = await Promise.allSettled([
        apiGet<any>("/api/nutrition/today"),
        apiGet<any>("/api/nutrition/food-items"),
      ]);
      const log = logRes.status === "fulfilled" ? logRes.value : null;
      const items = itemsRes.status === "fulfilled" ? itemsRes.value?.items ?? [] : [];
      setData({ log: log?.today ?? { calories_consumed: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }, goals: log?.goals ?? userProfile, foodItems: items });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id: string) => {
    Alert.alert("Remove item?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
        try { await apiDelete(`/api/nutrition/food-items/${id}`); await fetchData(); } catch { Alert.alert("Error", "Failed to delete."); }
      }},
    ]);
  };

  const handleAdd = async () => {
    if (!addName || !addCals) return;
    setSaving(true);
    try {
      await apiPost("/api/nutrition/food-items", { meal_tag: addTag, name: addName, calories: parseInt(addCals), protein_g: parseFloat(addProtein || "0"), carbs_g: parseFloat(addCarbs || "0"), fat_g: parseFloat(addFat || "0") });
      setShowAdd(false);
      setAddName(""); setAddCals(""); setAddProtein(""); setAddCarbs(""); setAddFat("");
      await fetchData();
    } catch (e: unknown) { Alert.alert("Error", e instanceof Error ? e.message : "Failed to add item."); } finally { setSaving(false); }
  };

  const toggleDish = (key: string) => {
    setExpandedDishes(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const todayLabel = (() => {
    const d = new Date();
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  })();

  const log = data?.log;
  const goals = data?.goals;
  const foodItems = data?.foodItems ?? [];

  // Build sections: meal type → dishes (grouped by batch_id; solo items each get their own dish)
  const sections = TAGS.map(tag => {
    const tagItems = foodItems.filter(i => i.meal_tag === tag);
    const batchMap = new Map<string, FoodItem[]>();
    for (const item of tagItems) {
      const k = item.batch_id ?? `solo_${item.id}`;
      const arr = batchMap.get(k) ?? [];
      arr.push(item);
      batchMap.set(k, arr);
    }
    const dishes: Dish[] = Array.from(batchMap.entries()).map(([key, items]) => ({
      key,
      dishName: items[0].dish_name ?? (items.length > 1
        ? [...items].sort((a, b) => b.calories - a.calories).slice(0, 2).map(i => i.name).join(" & ")
        : items[0].name),
      items,
      totalCals: items.reduce((s, i) => s + i.calories, 0),
    }));
    return { tag, dishes };
  }).filter(s => s.dishes.length > 0);

  const MEAL_EMOJIS: Record<string, string> = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", Snack: "🍎" };

  return (
    <Screen>
      <AppHeader title="Log Food" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={colors.teal} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card + AI buttons */}
        <View style={styles.header}>
          {log && goals && (
            <Card style={styles.summaryCard}>
              <View style={styles.calRow}>
                <View><Text style={[styles.calNum, { color: colors.textPrimary }]}>{log.calories_consumed}</Text><Text style={[styles.calSub, { color: colors.textMuted }]}>consumed</Text></View>
                <View style={styles.calDivider}><Text style={[styles.calNum, { color: colors.teal }]}>{Math.max(0, goals.calorie_goal - log.calories_consumed)}</Text><Text style={[styles.calSub, { color: colors.textMuted }]}>remaining</Text></View>
                <View><Text style={[styles.calNum, { color: colors.textPrimary }]}>{goals.calorie_goal}</Text><Text style={[styles.calSub, { color: colors.textMuted }]}>goal</Text></View>
              </View>
              <ProgressBar ratio={goals.calorie_goal > 0 ? log.calories_consumed / goals.calorie_goal : 0} color={colors.macroCalories} style={styles.bar} />
            </Card>
          )}
          <View style={styles.aiRow}>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "camera" } } as any)}
              style={[styles.aiBtn, { backgroundColor: "rgba(32,199,183,0.1)", borderColor: colors.teal }]}
            >
              <Text style={styles.aiEmoji}>📷</Text>
              <Text style={[styles.aiLabel, { color: colors.teal }]}>Take Photo</Text>
              <Text style={[styles.aiSub, { color: colors.textMuted }]}>AI detects food</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "library" } } as any)}
              style={[styles.aiBtn, { backgroundColor: "rgba(32,199,183,0.06)", borderColor: "rgba(32,199,183,0.3)" }]}
            >
              <Text style={styles.aiEmoji}>📤</Text>
              <Text style={[styles.aiLabel, { color: colors.teal }]}>Upload Photo</Text>
              <Text style={[styles.aiSub, { color: colors.textMuted }]}>From your library</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>or add manually</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={[styles.addBtn, { backgroundColor: colors.teal }]}>
            <Text style={styles.addBtnLabel}>+ Log Food Manually</Text>
          </TouchableOpacity>
        </View>

        {/* Meal sections: Breakfast / Lunch / Dinner / Snack */}
        {sections.map(section => {
          const tc = TAG_COLORS[section.tag] ?? { color: colors.teal, bg: colors.tealAlpha };
          return (
            <View key={section.tag} style={styles.section}>
              {/* Section header */}
              <View style={[styles.sectionHeader, { borderLeftColor: tc.color }]}>
                <Text style={styles.sectionEmoji}>{MEAL_EMOJIS[section.tag] ?? "🍽"}</Text>
                <Text style={[styles.sectionTitle, { color: tc.color }]}>{section.tag.toUpperCase()}</Text>
                <Text style={[styles.sectionDate, { color: colors.textMuted }]}>{todayLabel}</Text>
              </View>

              {/* Dish cards */}
              {section.dishes.map(dish => {
                const isExpanded = expandedDishes.has(dish.key);
                const multi = dish.items.length > 1;
                return (
                  <View key={dish.key} style={[styles.dishCard, { borderColor: tc.color + "25" }]}>
                    <View style={styles.dishRow}>
                      <View style={[styles.dishDot, { backgroundColor: tc.color }]} />
                      <View style={styles.dishMid}>
                        <Text style={[styles.dishName, { color: colors.textPrimary }]}>{dish.dishName}</Text>
                        <Text style={[styles.dishMeta, { color: colors.textMuted }]}>
                          {dish.totalCals} kcal{multi ? ` · ${dish.items.length} ingredients` : ""}
                        </Text>
                      </View>
                      {multi ? (
                        <TouchableOpacity onPress={() => toggleDish(dish.key)} style={styles.expandBtn}>
                          <Text style={[styles.expandText, { color: colors.textMuted }]}>{isExpanded ? "▲" : "▼"}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => handleDelete(dish.items[0].id)} style={[styles.deleteBtn, { backgroundColor: colors.danger + "12" }]}>
                          <Text style={[styles.deleteText, { color: colors.danger }]}>×</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {multi && isExpanded && (
                      <View style={[styles.ingredientList, { borderTopColor: colors.border }]}>
                        {dish.items.map(item => (
                          <View key={item.id} style={styles.ingredientRow}>
                            <View style={styles.ingredientLeft}>
                              <Text style={[styles.ingredientName, { color: colors.textPrimary }]}>{item.name}</Text>
                              <Text style={[styles.ingredientMacros, { color: colors.textMuted }]}>
                                {item.calories} kcal · P {item.protein_g}g · C {item.carbs_g}g · F {item.fat_g}g
                              </Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.deleteBtn, { backgroundColor: colors.danger + "12" }]}>
                              <Text style={[styles.deleteText, { color: colors.danger }]}>×</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Log Food</Text>
            <View style={styles.tagRow}>
              {TAGS.map(t => {
                const tc = TAG_COLORS[t];
                return (
                  <TouchableOpacity key={t} onPress={() => setAddTag(t)} style={[styles.tagChip, { backgroundColor: addTag === t ? tc.color : "rgba(255,255,255,0.08)", borderColor: tc.color }]}>
                    <Text style={[styles.tagChipLabel, { color: addTag === t ? "#FFF" : tc.color }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={styles.input} placeholder="Food name" placeholderTextColor="rgba(245,245,247,0.3)" value={addName} onChangeText={setAddName} autoFocus />
            <TextInput style={styles.input} placeholder="Calories" placeholderTextColor="rgba(245,245,247,0.3)" value={addCals} onChangeText={setAddCals} keyboardType="numeric" />
            <View style={styles.twoCol}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Protein g" placeholderTextColor="rgba(245,245,247,0.3)" value={addProtein} onChangeText={setAddProtein} keyboardType="decimal-pad" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Carbs g" placeholderTextColor="rgba(245,245,247,0.3)" value={addCarbs} onChangeText={setAddCarbs} keyboardType="decimal-pad" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Fat g" placeholderTextColor="rgba(245,245,247,0.3)" value={addFat} onChangeText={setAddFat} keyboardType="decimal-pad" />
            </View>
            <TouchableOpacity onPress={handleAdd} disabled={!addName || !addCals || saving} style={[styles.saveBtn, { opacity: !addName || !addCals ? 0.5 : 1 }]}>
              <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 40 },
  header: { gap: 12, paddingTop: 4 },
  summaryCard: { marginHorizontal: 20 },
  calRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  calNum: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  calDivider: { alignItems: "center" },
  calSub: { fontSize: 11, fontWeight: "500", textAlign: "center", marginTop: 2 },
  bar: { marginTop: 4 },
  aiRow: { flexDirection: "row", gap: 10, marginHorizontal: 20 },
  aiBtn: {
    flex: 1, borderRadius: 16, borderWidth: 1,
    paddingVertical: 16, alignItems: "center", gap: 4,
  },
  aiEmoji: { fontSize: 24 },
  aiLabel: { fontSize: 13, fontWeight: "700" },
  aiSub: { fontSize: 11, fontWeight: "500" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  addBtn: { marginHorizontal: 20, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  addBtnLabel: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  section: { gap: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 20, borderLeftWidth: 3, paddingLeft: 10 },
  sectionEmoji: { fontSize: 14 },
  sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, flex: 1 },
  sectionDate: { fontSize: 11, fontWeight: "500" },
  dishCard: { marginHorizontal: 20, borderRadius: 14, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.03)", overflow: "hidden" },
  dishRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  dishDot: { width: 8, height: 8, borderRadius: 4 },
  dishMid: { flex: 1 },
  dishName: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  dishMeta: { fontSize: 11, fontWeight: "500" },
  expandBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  expandText: { fontSize: 10, fontWeight: "700" },
  ingredientList: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingBottom: 6 },
  ingredientRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.05)" },
  ingredientLeft: { flex: 1 },
  ingredientName: { fontSize: 12, fontWeight: "600", marginBottom: 1 },
  ingredientMacros: { fontSize: 11, fontWeight: "500" },
  deleteBtn: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 18, fontWeight: "700" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#1C1C1E", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  handle: { width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: "#F5F5F7" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1 },
  tagChipLabel: { fontSize: 12, fontWeight: "600" },
  input: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#F5F5F7", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  twoCol: { flexDirection: "row", gap: 8 },
  saveBtn: { backgroundColor: "#20C7B7", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelText: { color: "rgba(245,245,247,0.45)", fontWeight: "600", fontSize: 14 },
});
