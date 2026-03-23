import React, { useEffect, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Modal, Platform,
  RefreshControl, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { DimensionValue } from "react-native";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

const BG   = "#EEF4FA";
const TEAL = "#2DD4BF";
const BLUE = "#3B6FD4";

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  Breakfast: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  Lunch:     { color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  Dinner:    { color: "#6366F1", bg: "rgba(99,102,241,0.10)" },
  Snack:     { color: "#F97316", bg: "rgba(249,115,22,0.10)" },
};
const TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

interface FoodItem {
  id: string; meal_tag: string; name: string; calories: number;
  protein_g: number; carbs_g: number; fat_g: number;
  batch_id?: string | null; dish_name?: string | null;
}
type Dish = { key: string; dishName: string; items: FoodItem[]; totalCals: number; };
interface NutritionData {
  log:   { calories_consumed: number; protein_g: number; carbs_g: number; fat_g: number; };
  goals: { calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number; };
  foodItems: FoodItem[];
}

const RECENT_MEALS = [
  { name: "Chicken Bowl", calories: 520, emoji: "🍗" },
  { name: "Greek Yogurt", calories: 180, emoji: "🥛" },
  { name: "Salmon Rice",  calories: 490, emoji: "🐟" },
  { name: "Oats",         calories: 320, emoji: "🥣" },
  { name: "Eggs Toast",   calories: 380, emoji: "🍳" },
];

const MOCK_HISTORY = [
  { date: "Yesterday",   calories: 2100, protein: 168, carbs: 210, fat: 58 },
  { date: "Sun 16 Mar",  calories: 1840, protein: 142, carbs: 195, fat: 52 },
  { date: "Sat 15 Mar",  calories: 2450, protein: 185, carbs: 240, fat: 72 },
];

const MEAL_EMOJIS: Record<string, string> = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", Snack: "🍎" };

export default function LogFoodScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // ── state (all existing logic preserved) ─────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);
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
  const [relogToast, setRelogToast] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [logRes, itemsRes] = await Promise.allSettled([
        apiGet<any>("/api/nutrition/today"),
        apiGet<any>("/api/nutrition/food-items"),
      ]);
      const log   = logRes.status === "fulfilled" ? logRes.value : null;
      const items = itemsRes.status === "fulfilled" ? itemsRes.value?.items ?? [] : [];
      setData({
        log:       log?.today ?? { calories_consumed: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
        goals:     log?.goals ?? userProfile,
        foodItems: items,
      });
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
        try { await apiDelete(`/api/nutrition/food-items/${id}`); await fetchData(); }
        catch { Alert.alert("Error", "Failed to delete."); }
      }},
    ]);
  };

  const handleDeleteDish = (dish: Dish) => {
    Alert.alert("Delete dish?", `Remove "${dish.dishName}" and all its ingredients?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          const batchId  = dish.items[0]?.batch_id;
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
      await apiPost("/api/nutrition/food-items", {
        meal_tag: addTag, name: addName,
        calories: parseInt(addCals),
        protein_g: parseFloat(addProtein || "0"),
        carbs_g:   parseFloat(addCarbs   || "0"),
        fat_g:     parseFloat(addFat     || "0"),
      });
      setShowAdd(false);
      setAddName(""); setAddCals(""); setAddProtein(""); setAddCarbs(""); setAddFat("");
      await fetchData();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add item.");
    } finally { setSaving(false); }
  };

  const toggleDish = (key: string) => {
    setExpandedDishes(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleRelog = (meal: typeof RECENT_MEALS[0]) => {
    setRelogToast(`${meal.name} added to today's log ✓`);
    setTimeout(() => setRelogToast(null), 2200);
    // TODO: actually add to today's nutrition log
  };

  const todayLabel = (() => {
    const d = new Date();
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  })();

  const log       = data?.log;
  const goals     = data?.goals;
  const foodItems = data?.foodItems ?? [];

  const sections = TAGS.map(tag => {
    const tagItems = foodItems.filter(i => i.meal_tag === tag);
    const batchMap = new Map<string, FoodItem[]>();
    for (const item of tagItems) {
      const k   = item.batch_id ?? `solo_${item.id}`;
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

  // ── clock button for header ───────────────────────────────────────────────
  const ClockBtn = (
    <TouchableOpacity
      style={s.iconBtn}
      activeOpacity={0.7}
      onPress={() => setShowHistory(h => !h)}
    >
      <Text style={[s.iconBtnText, showHistory && { color: TEAL }]}>🕐</Text>
    </TouchableOpacity>
  );

  const calConsumed  = log?.calories_consumed ?? 0;
  const calGoal      = goals?.calorie_goal    ?? 0;
  const calPct       = calGoal > 0 ? Math.min(1, calConsumed / calGoal) : 0;
  const calRemaining = Math.max(0, calGoal - calConsumed);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <AppHeader title="Log Food" showBack rightElement={ClockBtn} />

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={TEAL} />}
        showsVerticalScrollIndicator={false}
      >
        {showHistory ? (
          /* ══════════════════════ HISTORY VIEW ══════════════════════ */
          <View style={s.section}>
            <Text style={s.sectionTitle}>Food History</Text>

            {sections.length === 0 && MOCK_HISTORY.length === 0 ? (
              <View style={s.emptyWrap}>
                <Text style={s.emptyEmoji}>🍽️</Text>
                <Text style={s.emptyTitle}>No food logged yet</Text>
                <Text style={s.emptySub}>Tap the clock icon again to go back and log your first meal</Text>
              </View>
            ) : (
              <>
                {/* Today's logged items (real data) */}
                {sections.map(section => {
                  const tc = TAG_COLORS[section.tag] ?? { color: TEAL, bg: `rgba(45,212,191,0.08)` };
                  return (
                    <View key={section.tag} style={s.historySection}>
                      <View style={[s.histSectionHeader, { borderLeftColor: tc.color }]}>
                        <Text style={s.histSectionEmoji}>{MEAL_EMOJIS[section.tag] ?? "🍽️"}</Text>
                        <Text style={[s.histSectionTitle, { color: tc.color }]}>{section.tag}</Text>
                        <Text style={s.histDate}>{todayLabel}</Text>
                      </View>
                      {section.dishes.map(dish => {
                        const isExpanded = expandedDishes.has(dish.key);
                        const multi      = dish.items.length > 1;
                        return (
                          <View key={dish.key} style={[s.dishCard, { borderLeftColor: tc.color }]}>
                            <View style={s.dishRow}>
                              <View style={s.dishMid}>
                                <Text style={s.dishName}>{dish.dishName}</Text>
                                <Text style={s.dishMeta}>
                                  {+dish.totalCals.toFixed(0)} kcal{multi ? ` · ${dish.items.length} ingredients` : ""}
                                </Text>
                              </View>
                              <View style={s.dishActions}>
                                {multi && (
                                  <TouchableOpacity onPress={() => toggleDish(dish.key)} style={s.expandBtn}>
                                    <Text style={s.expandText}>{isExpanded ? "▲" : "▼"}</Text>
                                  </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                  onPress={() => multi ? handleDeleteDish(dish) : handleDelete(dish.items[0].id)}
                                  style={s.deleteBtn}
                                >
                                  <Text style={s.deleteText}>×</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            {multi && isExpanded && (
                              <View style={s.ingredientList}>
                                {dish.items.map((item, idx) => (
                                  <View key={item.id} style={[s.ingredientRow, idx === dish.items.length - 1 && { borderBottomWidth: 0 }]}>
                                    <View style={s.ingredientLeft}>
                                      <Text style={s.ingredientName}>{item.name}</Text>
                                      <Text style={s.ingredientMacros}>
                                        {+item.calories.toFixed(0)} kcal · P {+item.protein_g.toFixed(1)}g · C {+item.carbs_g.toFixed(1)}g · F {+item.fat_g.toFixed(1)}g
                                      </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={s.deleteBtn}>
                                      <Text style={s.deleteText}>×</Text>
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

                {/* Mock past days */}
                <Text style={[s.sectionTitle, { marginTop: 20 }]}>Past Days</Text>
                {MOCK_HISTORY.map(day => {
                  const total = day.protein + day.carbs + day.fat;
                  const pPct  = total > 0 ? day.protein / total : 0.33;
                  const cPct  = total > 0 ? day.carbs   / total : 0.33;
                  const fPct  = total > 0 ? day.fat     / total : 0.34;
                  return (
                    <View key={day.date} style={s.histDayCard}>
                      <View style={s.histDayTop}>
                        <Text style={s.histDayDate}>{day.date}</Text>
                        <Text style={s.histDayCal}>{day.calories.toLocaleString()} kcal</Text>
                        <Text style={s.histChevron}>›</Text>
                      </View>
                      <View style={s.histMacroBar}>
                        <View style={[s.histMacroSeg, { flex: pPct, backgroundColor: "#22C55E" }]} />
                        <View style={[s.histMacroSeg, { flex: cPct, backgroundColor: "#F59E0B" }]} />
                        <View style={[s.histMacroSeg, { flex: fPct, backgroundColor: "#8B5CF6" }]} />
                      </View>
                      <View style={s.histMacroLabels}>
                        <Text style={[s.histMacroLbl, { color: "#22C55E" }]}>P {day.protein}g</Text>
                        <Text style={[s.histMacroLbl, { color: "#F59E0B" }]}>C {day.carbs}g</Text>
                        <Text style={[s.histMacroLbl, { color: "#8B5CF6" }]}>F {day.fat}g</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        ) : (
          /* ══════════════════════ LOG VIEW ══════════════════════════ */
          <>
            {/* ── Zone 1: Today's Progress Card ── */}
            {log && goals && (
              <View style={s.progressCard}>
                {/* Calorie row */}
                <View style={s.calRow}>
                  <View>
                    <View style={s.calConsumedRow}>
                      <Text style={s.calBig}>{calConsumed.toLocaleString()}</Text>
                      <Text style={s.calGoalText}>/ {calGoal.toLocaleString()} kcal</Text>
                    </View>
                  </View>
                  <View style={s.remainingBadge}>
                    <Text style={s.remainingText}>{calRemaining.toLocaleString()} left</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={s.barTrack}>
                  <LinearGradient
                    colors={["#2DD4BF", "#38BDF8"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.barFill, { width: `${Math.round(calPct * 100)}%` as DimensionValue }]}
                  />
                </View>

                {/* Macro row */}
                <View style={s.macroRow}>
                  <View style={s.macroItem}>
                    <Text style={[s.macroVal, { color: "#22C55E" }]}>{+log.protein_g.toFixed(0)}g</Text>
                    <Text style={s.macroLabel}>Protein</Text>
                  </View>
                  <View style={s.macroDivider} />
                  <View style={s.macroItem}>
                    <Text style={[s.macroVal, { color: "#F59E0B" }]}>{+log.carbs_g.toFixed(0)}g</Text>
                    <Text style={s.macroLabel}>Carbs</Text>
                  </View>
                  <View style={s.macroDivider} />
                  <View style={s.macroItem}>
                    <Text style={[s.macroVal, { color: "#8B5CF6" }]}>{+log.fat_g.toFixed(0)}g</Text>
                    <Text style={s.macroLabel}>Fat</Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── Zone 2: Scan Meal hero card ── */}
            <View style={s.scanCard}>
              {/* Gradient banner */}
              <LinearGradient
                colors={["#E0FDF4", "#CCFBF1", "#99F6E4"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.scanBanner}
              >
                <Text style={s.scanIcon}>⊙</Text>
                <Text style={s.scanTitle}>Scan your meal</Text>
                <Text style={s.scanSub}>AI identifies food & macros instantly</Text>
              </LinearGradient>

              {/* Buttons */}
              <View style={s.scanBtns}>
                <TouchableOpacity
                  style={s.scanBtnPrimary}
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "camera" } } as any)}
                >
                  <Text style={s.scanBtnPrimaryText}>📷  Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.scanBtnSecondary}
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "library" } } as any)}
                >
                  <Text style={s.scanBtnSecondaryText}>🖼  From Library</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Zone 3: Manual log ── */}
            <TouchableOpacity style={s.manualBtn} onPress={() => setShowAdd(true)} activeOpacity={0.8}>
              <Text style={s.manualBtnPlus}>+</Text>
              <Text style={s.manualBtnText}>Log Food Manually</Text>
            </TouchableOpacity>

            {/* ── Zone 4: Quick Re-log ── */}
            <Text style={s.relogTitle}>Recent Meals</Text>
            <Text style={s.relogSub}>Tap to log again instantly</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.relogRow}
            >
              {RECENT_MEALS.map((meal, idx) => (
                <TouchableOpacity
                  key={meal.name}
                  style={[s.relogPill, idx === 0 && { marginLeft: 16 }]}
                  activeOpacity={0.8}
                  onPress={() => handleRelog(meal)}
                >
                  <Text style={s.relogEmoji}>{meal.emoji}</Text>
                  <Text style={s.relogName} numberOfLines={1}>{meal.name}</Text>
                  <Text style={s.relogCal}>{meal.calories} kcal</Text>
                  <Text style={s.relogAction}>+ Log</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Relog toast */}
      {relogToast ? (
        <View style={s.toast} pointerEvents="none">
          <Text style={s.toastText}>{relogToast}</Text>
        </View>
      ) : null}

      {/* ── Manual add bottom sheet (unchanged logic) ── */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>Log Food</Text>
            <View style={s.tagRow}>
              {TAGS.map(t => {
                const tc = TAG_COLORS[t];
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setAddTag(t)}
                    style={[s.tagChip, { backgroundColor: addTag === t ? tc.color : tc.bg, borderColor: tc.color + "60" }]}
                  >
                    <Text style={[s.tagChipLabel, { color: addTag === t ? "#FFF" : tc.color }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={s.input} placeholder="Food name" placeholderTextColor="#9CA3AF" value={addName} onChangeText={setAddName} autoFocus />
            <TextInput style={s.input} placeholder="Calories" placeholderTextColor="#9CA3AF" value={addCals} onChangeText={setAddCals} keyboardType="numeric" />
            <View style={s.twoCol}>
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Protein g" placeholderTextColor="#9CA3AF" value={addProtein} onChangeText={setAddProtein} keyboardType="decimal-pad" />
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Carbs g"   placeholderTextColor="#9CA3AF" value={addCarbs}   onChangeText={setAddCarbs}   keyboardType="decimal-pad" />
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Fat g"     placeholderTextColor="#9CA3AF" value={addFat}     onChangeText={setAddFat}     keyboardType="decimal-pad" />
            </View>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!addName || !addCals || saving}
              style={[s.saveBtn, { opacity: !addName || !addCals ? 0.5 : 1 }]}
            >
              <Text style={s.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAdd(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const SHADOW = {
  shadowColor: "#B0C4D8" as const,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 3,
};

const styles = StyleSheet.create({});  // kept to avoid unused import warning

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },

  // Header clock btn
  iconBtn:     { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.75)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  iconBtnText: { fontSize: 18 },

  // ── Progress card ──────────────────────────────────────────────────────────
  progressCard: { marginHorizontal: 16, marginTop: 4, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 20, padding: 16, ...SHADOW },
  calRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  calConsumedRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  calBig:         { fontSize: 32, fontWeight: "800", color: "#1E293B", lineHeight: 36 },
  calGoalText:    { fontSize: 14, color: "#94A3B8", lineHeight: 24, marginBottom: 2 },
  remainingBadge: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(200,220,240,0.6)" },
  remainingText:  { fontSize: 13, fontWeight: "700", color: TEAL },

  barTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(45,212,191,0.12)", overflow: "hidden", marginBottom: 14 },
  barFill:  { height: 6, borderRadius: 3 },

  macroRow:    { flexDirection: "row", alignItems: "center" },
  macroItem:   { flex: 1, alignItems: "center" },
  macroVal:    { fontSize: 16, fontWeight: "700" },
  macroLabel:  { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  macroDivider:{ width: 1, height: 24, backgroundColor: "#F1F5F9" },

  // ── Scan card ─────────────────────────────────────────────────────────────
  scanCard:   { marginHorizontal: 16, marginTop: 16, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 24, overflow: "hidden", ...SHADOW },
  scanBanner: { height: 140, alignItems: "center", justifyContent: "center", gap: 4 },
  scanIcon:   { fontSize: 48, color: TEAL, lineHeight: 52 },
  scanTitle:  { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  scanSub:    { fontSize: 13, color: "#64748B", marginTop: 2 },
  scanBtns:   { flexDirection: "row", padding: 16, gap: 8 },
  scanBtnPrimary: {
    flex: 1, backgroundColor: TEAL, borderRadius: 20, paddingVertical: 14, alignItems: "center",
    shadowColor: TEAL, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
  },
  scanBtnPrimaryText:   { fontSize: 15, fontWeight: "600", color: "#fff" },
  scanBtnSecondary:     { flex: 1, backgroundColor: "rgba(45,212,191,0.08)", borderRadius: 20, paddingVertical: 14, alignItems: "center", borderWidth: 1.5, borderColor: "rgba(45,212,191,0.3)" },
  scanBtnSecondaryText: { fontSize: 15, fontWeight: "600", color: TEAL },

  // ── Manual log btn ────────────────────────────────────────────────────────
  manualBtn:     { marginHorizontal: 16, marginTop: 12, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 20, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.08)", paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  manualBtnPlus: { fontSize: 18, color: "#1E293B", lineHeight: 20 },
  manualBtnText: { fontSize: 15, fontWeight: "600", color: "#1E293B" },

  // ── Quick Re-log ──────────────────────────────────────────────────────────
  relogTitle: { fontSize: 15, fontWeight: "600", color: "#1E293B", marginLeft: 16, marginTop: 22, marginBottom: 2 },
  relogSub:   { fontSize: 12, color: "#94A3B8", marginLeft: 16, marginBottom: 10 },
  relogRow:   { paddingRight: 16, paddingBottom: 4 },
  relogPill:  { backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.9)", paddingHorizontal: 16, paddingVertical: 14, marginRight: 10, alignItems: "center", gap: 4, minWidth: 90, ...SHADOW },
  relogEmoji: { fontSize: 24 },
  relogName:  { fontSize: 13, fontWeight: "600", color: "#1E293B", maxWidth: 100, textAlign: "center" },
  relogCal:   { fontSize: 11, color: "#94A3B8" },
  relogAction:{ fontSize: 11, color: TEAL, fontWeight: "600", marginTop: 2 },

  // ── History view ──────────────────────────────────────────────────────────
  section:        { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  sectionTitle:   { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  emptyWrap:      { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyEmoji:     { fontSize: 40 },
  emptyTitle:     { fontSize: 17, fontWeight: "700", color: "#1C1C1E" },
  emptySub:       { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingHorizontal: 40 },
  historySection: { gap: 6, marginTop: 4 },
  histSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, borderLeftWidth: 3, paddingLeft: 10, marginBottom: 4 },
  histSectionEmoji:  { fontSize: 14 },
  histSectionTitle:  { fontSize: 13, fontWeight: "800", flex: 1 },
  histDate:          { fontSize: 11, fontWeight: "500", color: "#9CA3AF" },
  dishCard:       { borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", borderLeftWidth: 3, backgroundColor: "rgba(255,255,255,0.9)", overflow: "hidden" },
  dishRow:        { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  dishMid:        { flex: 1 },
  dishName:       { fontSize: 14, fontWeight: "700", color: "#1C1C1E", marginBottom: 2 },
  dishMeta:       { fontSize: 11, fontWeight: "500", color: "#9CA3AF" },
  dishActions:    { flexDirection: "row", alignItems: "center", gap: 4 },
  expandBtn:      { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  expandText:     { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },
  ingredientList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB", paddingHorizontal: 14, paddingBottom: 6 },
  ingredientRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  ingredientLeft: { flex: 1 },
  ingredientName:   { fontSize: 12, fontWeight: "600", color: "#1C1C1E", marginBottom: 1 },
  ingredientMacros: { fontSize: 11, fontWeight: "500", color: "#9CA3AF" },
  deleteBtn:  { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239,68,68,0.08)" },
  deleteText: { fontSize: 18, fontWeight: "700", color: "#EF4444" },

  // Past days cards
  histDayCard:    { backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 16, padding: 14, ...SHADOW },
  histDayTop:     { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  histDayDate:    { flex: 1, fontSize: 14, fontWeight: "600", color: "#1E293B" },
  histDayCal:     { fontSize: 14, fontWeight: "700", color: "#1E293B", marginRight: 6 },
  histChevron:    { fontSize: 18, color: "#94A3B8" },
  histMacroBar:   { flexDirection: "row", height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  histMacroSeg:   { height: 5 },
  histMacroLabels:{ flexDirection: "row", gap: 12 },
  histMacroLbl:   { fontSize: 11, fontWeight: "600" },

  // Toast
  toast:     { position: "absolute", bottom: 48, alignSelf: "center", backgroundColor: "rgba(30,41,59,0.9)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12 },
  toastText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  // ── Manual add sheet ──────────────────────────────────────────────────────
  overlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet:        { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  handle:       { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  sheetTitle:   { fontSize: 20, fontWeight: "800", color: "#1C1C1E" },
  tagRow:       { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  tagChipLabel: { fontSize: 12, fontWeight: "700" },
  input:        { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#1C1C1E", borderWidth: 1, borderColor: "#E5E7EB" },
  twoCol:       { flexDirection: "row", gap: 8 },
  saveBtn:      { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  saveBtnText:  { color: "#fff", fontWeight: "800", fontSize: 16 },
  cancelBtn:    { alignItems: "center", paddingVertical: 8 },
  cancelText:   { color: "#9CA3AF", fontWeight: "600", fontSize: 14 },
});
