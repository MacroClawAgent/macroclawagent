import React, { useEffect, useState } from "react";
import {
  Alert, FlatList, KeyboardAvoidingView, Modal, Platform,
  RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View,
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

interface FoodItem { id: string; meal_tag: string; name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; }
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
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set(["Breakfast", "Lunch", "Dinner", "Snack"]));

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

  const toggleTag = (tag: string) => {
    setExpandedTags(prev => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
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
  const grouped = TAGS.map(tag => ({ tag, items: foodItems.filter(i => i.meal_tag === tag) })).filter(g => g.items.length > 0);

  return (
    <Screen>
      <AppHeader title="Log Food" showBack />
      <FlatList
        data={grouped}
        keyExtractor={g => g.tag}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={colors.teal} />}
        ListHeaderComponent={
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
            {/* AI Photo Scan */}
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
        }
        renderItem={({ item: group }) => {
          const tc = TAG_COLORS[group.tag] ?? { color: colors.teal, bg: colors.tealAlpha };
          const isExpanded = expandedTags.has(group.tag);
          const mealCals = group.items.reduce((s, i) => s + i.calories, 0);
          const mealEmojis: Record<string, string> = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", Snack: "🍎" };
          return (
            <View style={[styles.mealCard, { borderColor: tc.color + "30" }]}>
              {/* Meal header — tap to expand/collapse */}
              <TouchableOpacity onPress={() => toggleTag(group.tag)} activeOpacity={0.7} style={styles.mealHeader}>
                <View style={[styles.mealIconBadge, { backgroundColor: tc.bg }]}>
                  <Text style={styles.mealEmoji}>{mealEmojis[group.tag] ?? "🍽"}</Text>
                </View>
                <View style={styles.mealHeaderMid}>
                  <Text style={[styles.mealName, { color: colors.textPrimary }]}>{group.tag}</Text>
                  <Text style={[styles.mealMeta, { color: colors.textMuted }]}>{todayLabel} · {group.items.length} item{group.items.length !== 1 ? "s" : ""}</Text>
                </View>
                <View style={styles.mealHeaderRight}>
                  <Text style={[styles.mealCals, { color: tc.color }]}>{mealCals} kcal</Text>
                  <Text style={[styles.mealChevron, { color: colors.textMuted }]}>{isExpanded ? "▲" : "▼"}</Text>
                </View>
              </TouchableOpacity>

              {/* Ingredient list */}
              {isExpanded && (
                <View style={[styles.ingredientList, { borderTopColor: colors.border }]}>
                  {group.items.map(item => (
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
        }}
      />
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
  mealCard: { marginHorizontal: 20, borderRadius: 18, borderWidth: 1, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.03)" },
  mealHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  mealIconBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  mealEmoji: { fontSize: 18 },
  mealHeaderMid: { flex: 1 },
  mealName: { fontSize: 15, fontWeight: "700" },
  mealMeta: { fontSize: 11, fontWeight: "500", marginTop: 1 },
  mealHeaderRight: { alignItems: "flex-end", gap: 2 },
  mealCals: { fontSize: 14, fontWeight: "800" },
  mealChevron: { fontSize: 10, fontWeight: "600" },
  ingredientList: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingBottom: 8 },
  ingredientRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.06)" },
  ingredientLeft: { flex: 1 },
  ingredientName: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
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
