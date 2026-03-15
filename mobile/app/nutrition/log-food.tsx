import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, FlatList, KeyboardAvoidingView, Modal, Platform,
  RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiDelete, apiPatch } from "@/lib/api";

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  Breakfast: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  Lunch: { color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  Dinner: { color: "#6366F1", bg: "rgba(99,102,241,0.10)" },
  Snack: { color: "#F97316", bg: "rgba(249,115,22,0.10)" },
};
const TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

interface FoodItem { id: string; tag: string; name: string; calories: number; protein: number; carbs: number; fat: number; }
interface NutritionData { log: { calories_consumed: number; protein_g: number; carbs_g: number; fat_g: number; }; goals: { calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number; }; foodItems: FoodItem[]; }

export default function LogFoodScreen() {
  const { colors } = useTheme();
  const { userProfile } = useAuth();
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

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [logRes, itemsRes] = await Promise.allSettled([
        apiGet<any>("/api/nutrition/today"),
        apiGet<any>("/api/nutrition/food-items"),
      ]);
      const log = logRes.status === "fulfilled" ? logRes.value : null;
      const items = itemsRes.status === "fulfilled" ? itemsRes.value?.items ?? [] : [];
      setData({ log: log?.log ?? { calories_consumed: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }, goals: log?.goals ?? userProfile, foodItems: items });
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
      await apiPost("/api/nutrition/food-items", { tag: addTag, name: addName, calories: parseInt(addCals), protein: parseFloat(addProtein || "0"), carbs: parseFloat(addCarbs || "0"), fat: parseFloat(addFat || "0") });
      setShowAdd(false);
      setAddName(""); setAddCals(""); setAddProtein(""); setAddCarbs(""); setAddFat("");
      await fetchData();
    } catch { Alert.alert("Error", "Failed to add item."); } finally { setSaving(false); }
  };

  const log = data?.log;
  const goals = data?.goals;
  const foodItems = data?.foodItems ?? [];
  const grouped = TAGS.map(tag => ({ tag, items: foodItems.filter(i => i.tag === tag) })).filter(g => g.items.length > 0);

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
            <TouchableOpacity onPress={() => setShowAdd(true)} style={[styles.addBtn, { backgroundColor: colors.teal }]}>
              <Text style={styles.addBtnLabel}>+ Log Food</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: group }) => {
          const tc = TAG_COLORS[group.tag] ?? { color: colors.teal, bg: colors.tealAlpha };
          return (
            <View style={styles.group}>
              <Pill label={group.tag} color={tc.color} bg={tc.bg} style={styles.groupLabel} />
              {group.items.map(item => (
                <Card key={item.id} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
                      <Text style={[styles.itemMacros, { color: colors.textMuted }]}>{item.calories} kcal · P{item.protein}g · C{item.carbs}g · F{item.fat}g</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.deleteBtn, { backgroundColor: colors.danger + "12" }]}>
                      <Text style={[styles.deleteText, { color: colors.danger }]}>×</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
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
  addBtn: { marginHorizontal: 20, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  addBtnLabel: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  group: { gap: 8, paddingHorizontal: 20 },
  groupLabel: { marginBottom: 4 },
  itemCard: { marginHorizontal: 0, padding: 14 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  itemMacros: { fontSize: 12, fontWeight: "500" },
  deleteBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
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
