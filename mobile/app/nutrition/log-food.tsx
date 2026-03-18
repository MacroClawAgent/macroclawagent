import React, { useEffect, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Modal, Platform,
  RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/ui/AppHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

const BG = "#EEF4FA";
const WHITE = "#FFFFFF";
const TEAL = "#2BB6A6";
const BORDER = "#E5E7EB";

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
  const { userProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"log" | "history">("log");
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

  const handleDeleteDish = (dish: Dish) => {
    Alert.alert("Delete dish?", `Remove "${dish.dishName}" and all its ingredients?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          const batchId = dish.items[0]?.batch_id;
          const todayStr = new Date().toISOString().split("T")[0];
          if (batchId) {
            await apiDelete(`/api/nutrition/food-items?batch_id=${batchId}&date=${todayStr}`);
          } else {
            await Promise.all(dish.items.map(i => apiDelete(`/api/nutrition/food-items/${i.id}`)));
          }
          await fetchData();
        } catch { Alert.alert("Error", "Failed to delete dish."); }
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
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Log Food" showBack />

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(["log", "history"] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === "log" ? "Log" : "History"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={TEAL} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "log" ? (
          /* ── LOG TAB ── */
          <View style={styles.logContent}>
            {/* Calorie summary */}
            {log && goals && (
              <View style={styles.summaryCard}>
                <View style={styles.calRow}>
                  <View style={styles.calBlock}>
                    <Text style={styles.calNum}>{log.calories_consumed}</Text>
                    <Text style={styles.calSub}>consumed</Text>
                  </View>
                  <View style={styles.calBlockCenter}>
                    <Text style={[styles.calNum, styles.calNumTeal]}>{Math.max(0, goals.calorie_goal - log.calories_consumed)}</Text>
                    <Text style={styles.calSub}>remaining</Text>
                  </View>
                  <View style={styles.calBlock}>
                    <Text style={styles.calNum}>{goals.calorie_goal}</Text>
                    <Text style={styles.calSub}>goal</Text>
                  </View>
                </View>
                <ProgressBar ratio={goals.calorie_goal > 0 ? log.calories_consumed / goals.calorie_goal : 0} color={TEAL} style={styles.bar} />
                {/* Macro pills */}
                <View style={styles.macroPills}>
                  <View style={[styles.macroPill, { backgroundColor: "rgba(239,68,68,0.08)" }]}>
                    <Text style={[styles.macroPillVal, { color: "#EF4444" }]}>{+log.protein_g.toFixed(0)}g</Text>
                    <Text style={styles.macroPillLabel}>Protein</Text>
                  </View>
                  <View style={[styles.macroPill, { backgroundColor: "rgba(59,130,246,0.08)" }]}>
                    <Text style={[styles.macroPillVal, { color: "#3B82F6" }]}>{+log.carbs_g.toFixed(0)}g</Text>
                    <Text style={styles.macroPillLabel}>Carbs</Text>
                  </View>
                  <View style={[styles.macroPill, { backgroundColor: "rgba(234,179,8,0.08)" }]}>
                    <Text style={[styles.macroPillVal, { color: "#EAB308" }]}>{+log.fat_g.toFixed(0)}g</Text>
                    <Text style={styles.macroPillLabel}>Fat</Text>
                  </View>
                </View>
              </View>
            )}

            {/* AI Photo actions */}
            <Text style={styles.sectionHeading}>Add with AI</Text>
            <View style={styles.aiRow}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "camera" } } as any)}
                style={styles.aiBtn}
                activeOpacity={0.8}
              >
                <View style={styles.aiIconWrap}>
                  <Text style={styles.aiEmoji}>📷</Text>
                </View>
                <Text style={styles.aiLabel}>Take Photo</Text>
                <Text style={styles.aiSub}>AI detects food</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "library" } } as any)}
                style={styles.aiBtn}
                activeOpacity={0.8}
              >
                <View style={[styles.aiIconWrap, { backgroundColor: "rgba(43,182,166,0.08)" }]}>
                  <Text style={styles.aiEmoji}>📤</Text>
                </View>
                <Text style={styles.aiLabel}>Upload Photo</Text>
                <Text style={styles.aiSub}>From your library</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or add manually</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Manual log button */}
            <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addBtn} activeOpacity={0.85}>
              <Text style={styles.addBtnLabel}>+ Log Food Manually</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── HISTORY TAB ── */
          <View style={styles.historyContent}>
            {sections.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyEmoji}>🍽</Text>
                <Text style={styles.emptyTitle}>No food logged yet</Text>
                <Text style={styles.emptySub}>Switch to the Log tab to add your first meal</Text>
              </View>
            ) : (
              sections.map(section => {
                const tc = TAG_COLORS[section.tag] ?? { color: TEAL, bg: "rgba(43,182,166,0.08)" };
                return (
                  <View key={section.tag} style={styles.section}>
                    <View style={[styles.sectionHeader, { borderLeftColor: tc.color }]}>
                      <Text style={styles.sectionEmoji}>{MEAL_EMOJIS[section.tag] ?? "🍽"}</Text>
                      <Text style={[styles.sectionTitle, { color: tc.color }]}>{section.tag}</Text>
                      <Text style={styles.sectionDate}>{todayLabel}</Text>
                    </View>
                    {section.dishes.map(dish => {
                      const isExpanded = expandedDishes.has(dish.key);
                      const multi = dish.items.length > 1;
                      return (
                        <View key={dish.key} style={[styles.dishCard, { borderLeftColor: tc.color }]}>
                          <View style={styles.dishRow}>
                            <View style={styles.dishMid}>
                              <Text style={styles.dishName}>{dish.dishName}</Text>
                              <Text style={styles.dishMeta}>
                                {+dish.totalCals.toFixed(0)} kcal{multi ? ` · ${dish.items.length} ingredients` : ""}
                              </Text>
                            </View>
                            <View style={styles.dishActions}>
                              {multi && (
                                <TouchableOpacity onPress={() => toggleDish(dish.key)} style={styles.expandBtn}>
                                  <Text style={styles.expandText}>{isExpanded ? "▲" : "▼"}</Text>
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity
                                onPress={() => multi ? handleDeleteDish(dish) : handleDelete(dish.items[0].id)}
                                style={styles.deleteBtn}
                              >
                                <Text style={styles.deleteText}>×</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          {multi && isExpanded && (
                            <View style={styles.ingredientList}>
                              {dish.items.map((item, idx) => (
                                <View key={item.id} style={[styles.ingredientRow, idx === dish.items.length - 1 && { borderBottomWidth: 0 }]}>
                                  <View style={styles.ingredientLeft}>
                                    <Text style={styles.ingredientName}>{item.name}</Text>
                                    <Text style={styles.ingredientMacros}>
                                      {+item.calories.toFixed(0)} kcal · P {+item.protein_g.toFixed(1)}g · C {+item.carbs_g.toFixed(1)}g · F {+item.fat_g.toFixed(1)}g
                                    </Text>
                                  </View>
                                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                                    <Text style={styles.deleteText}>×</Text>
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
              })
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Manual add bottom sheet */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Log Food</Text>
            <View style={styles.tagRow}>
              {TAGS.map(t => {
                const tc = TAG_COLORS[t];
                return (
                  <TouchableOpacity key={t} onPress={() => setAddTag(t)} style={[styles.tagChip, { backgroundColor: addTag === t ? tc.color : tc.bg, borderColor: tc.color + "60" }]}>
                    <Text style={[styles.tagChipLabel, { color: addTag === t ? "#FFF" : tc.color }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={styles.input} placeholder="Food name" placeholderTextColor="#9CA3AF" value={addName} onChangeText={setAddName} autoFocus />
            <TextInput style={styles.input} placeholder="Calories" placeholderTextColor="#9CA3AF" value={addCals} onChangeText={setAddCals} keyboardType="numeric" />
            <View style={styles.twoCol}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Protein g" placeholderTextColor="#9CA3AF" value={addProtein} onChangeText={setAddProtein} keyboardType="decimal-pad" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Carbs g" placeholderTextColor="#9CA3AF" value={addCarbs} onChangeText={setAddCarbs} keyboardType="decimal-pad" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Fat g" placeholderTextColor="#9CA3AF" value={addFat} onChangeText={setAddFat} keyboardType="decimal-pad" />
            </View>
            <TouchableOpacity onPress={handleAdd} disabled={!addName || !addCals || saving} style={[styles.saveBtn, { opacity: !addName || !addCals ? 0.5 : 1 }]}>
              <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },

  // Tab bar
  tabBar: { flexDirection: "row", marginHorizontal: 20, marginTop: 8, marginBottom: 4, backgroundColor: WHITE, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: BORDER },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
  tabActive: { backgroundColor: TEAL },
  tabLabel: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
  tabLabelActive: { color: WHITE },

  // Log tab
  logContent: { gap: 16, paddingTop: 12 },
  summaryCard: { marginHorizontal: 20, backgroundColor: WHITE, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  calRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  calBlock: { alignItems: "center", flex: 1 },
  calBlockCenter: { alignItems: "center", flex: 1 },
  calNum: { fontSize: 22, fontWeight: "800", color: "#1C1C1E", textAlign: "center" },
  calNumTeal: { color: TEAL },
  calSub: { fontSize: 11, fontWeight: "500", color: "#9CA3AF", textAlign: "center", marginTop: 2 },
  bar: { marginTop: 4 },
  macroPills: { flexDirection: "row", gap: 8, marginTop: 12 },
  macroPill: { flex: 1, alignItems: "center", borderRadius: 10, paddingVertical: 8 },
  macroPillVal: { fontSize: 15, fontWeight: "800" },
  macroPillLabel: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", marginTop: 1 },

  sectionHeading: { fontSize: 11, fontWeight: "800", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8, marginHorizontal: 20 },
  aiRow: { flexDirection: "row", gap: 10, marginHorizontal: 20 },
  aiBtn: { flex: 1, backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: "rgba(43,182,166,0.3)", paddingVertical: 18, alignItems: "center", gap: 6, shadowColor: TEAL, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  aiIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(43,182,166,0.12)", alignItems: "center", justifyContent: "center" },
  aiEmoji: { fontSize: 22 },
  aiLabel: { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },
  aiSub: { fontSize: 11, fontWeight: "500", color: "#9CA3AF" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5 },
  addBtn: { marginHorizontal: 20, borderRadius: 14, paddingVertical: 16, alignItems: "center", backgroundColor: TEAL },
  addBtnLabel: { color: WHITE, fontWeight: "700", fontSize: 15 },

  // History tab
  historyContent: { gap: 8, paddingTop: 12 },
  emptyWrap: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#1C1C1E" },
  emptySub: { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingHorizontal: 40 },
  section: { gap: 6 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 20, borderLeftWidth: 3, paddingLeft: 10 },
  sectionEmoji: { fontSize: 14 },
  sectionTitle: { fontSize: 13, fontWeight: "800", flex: 1 },
  sectionDate: { fontSize: 11, fontWeight: "500", color: "#9CA3AF" },
  dishCard: { marginHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3, backgroundColor: WHITE, overflow: "hidden" },
  dishRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  dishMid: { flex: 1 },
  dishName: { fontSize: 14, fontWeight: "700", color: "#1C1C1E", marginBottom: 2 },
  dishMeta: { fontSize: 11, fontWeight: "500", color: "#9CA3AF" },
  dishActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  expandBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  expandText: { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },
  ingredientList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: BORDER, paddingHorizontal: 14, paddingBottom: 6 },
  ingredientRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BORDER },
  ingredientLeft: { flex: 1 },
  ingredientName: { fontSize: 12, fontWeight: "600", color: "#1C1C1E", marginBottom: 1 },
  ingredientMacros: { fontSize: 11, fontWeight: "500", color: "#9CA3AF" },
  deleteBtn: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239,68,68,0.08)" },
  deleteText: { fontSize: 18, fontWeight: "700", color: "#EF4444" },

  // Bottom sheet
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16 },
  handle: { width: 40, height: 4, backgroundColor: BORDER, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: "#1C1C1E" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  tagChipLabel: { fontSize: 12, fontWeight: "700" },
  input: { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#1C1C1E", borderWidth: 1, borderColor: BORDER },
  twoCol: { flexDirection: "row", gap: 8 },
  saveBtn: { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: WHITE, fontWeight: "800", fontSize: 16 },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelText: { color: "#9CA3AF", fontWeight: "600", fontSize: 14 },
});
