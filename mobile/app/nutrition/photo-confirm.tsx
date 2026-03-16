import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { useTheme } from "@/context/ThemeContext";
import { apiPost } from "@/lib/api";

type Stage = "picking" | "analyzing" | "review" | "saving" | "error";

const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
type MealTag = (typeof MEAL_TAGS)[number];

function getMealTagForTime(): MealTag {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "Breakfast";
  if (h >= 11 && h < 15) return "Lunch";
  if (h >= 15 && h < 21) return "Dinner";
  return "Snack";
}

interface DetectedFood {
  name: string;
  grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  per100g: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
}

function recalcFromGrams(food: DetectedFood, newGrams: number): DetectedFood {
  const ratio = newGrams / 100;
  return {
    ...food,
    grams: newGrams,
    calories: Math.round(food.per100g.calories * ratio),
    protein_g: Math.round(food.per100g.protein_g * ratio * 10) / 10,
    carbs_g: Math.round(food.per100g.carbs_g * ratio * 10) / 10,
    fat_g: Math.round(food.per100g.fat_g * ratio * 10) / 10,
  };
}

function sumTotals(foods: DetectedFood[]) {
  return foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein_g: Math.round((acc.protein_g + f.protein_g) * 10) / 10,
      carbs_g: Math.round((acc.carbs_g + f.carbs_g) * 10) / 10,
      fat_g: Math.round((acc.fat_g + f.fat_g) * 10) / 10,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

export default function PhotoConfirmScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode: "camera" | "library" }>();
  const mode = params.mode ?? "library";

  const [stage, setStage] = useState<Stage>("picking");
  const [foods, setFoods] = useState<DetectedFood[]>([]);
  const [gramInputs, setGramInputs] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<MealTag>(getMealTagForTime());
  const [errorMsg, setErrorMsg] = useState("");
  const launched = useRef(false);

  const launch = useCallback(async () => {
    // Request permissions
    if (mode === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera access is required to take photos.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Photo library access is required.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }
    }

    const result =
      mode === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
          });

    if (result.canceled || !result.assets?.[0]?.base64) {
      router.back();
      return;
    }

    const { base64, mimeType } = result.assets[0];
    setStage("analyzing");

    try {
      const data = await apiPost<{
        foods: DetectedFood[];
        totals: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
        error?: string;
      }>("/api/food/analyze", {
        imageBase64: base64,
        mimeType: mimeType ?? "image/jpeg",
      });

      if (data.error || !data.foods?.length) {
        setErrorMsg(data.error ?? "No foods detected. Please add items manually.");
        setStage("error");
        return;
      }

      setFoods(data.foods);
      setGramInputs(data.foods.map((f) => String(f.grams)));
      setStage("review");
    } catch {
      setErrorMsg("Analysis failed. Check your connection and try again.");
      setStage("error");
    }
  }, [mode, router]);

  useEffect(() => {
    if (!launched.current) {
      launched.current = true;
      launch();
    }
  }, [launch]);

  const handleGramChange = (idx: number, val: string) => {
    const updated = [...gramInputs];
    updated[idx] = val;
    setGramInputs(updated);

    const g = parseFloat(val);
    if (!isNaN(g) && g > 0) {
      const updatedFoods = [...foods];
      updatedFoods[idx] = recalcFromGrams(foods[idx], g);
      setFoods(updatedFoods);
    }
  };

  const handleRemove = (idx: number) => {
    setFoods(foods.filter((_, i) => i !== idx));
    setGramInputs(gramInputs.filter((_, i) => i !== idx));
  };

  const handleConfirm = async () => {
    if (foods.length === 0) {
      Alert.alert("No items", "Add at least one food item before saving.");
      return;
    }
    setStage("saving");
    try {
      // Save each food item — the API auto-updates daily nutrition_logs
      await Promise.all(
        foods.map((f) =>
          apiPost("/api/nutrition/food-items", {
            meal_tag: selectedTag,
            name: f.name,
            calories: f.calories,
            protein_g: f.protein_g,
            carbs_g: f.carbs_g,
            fat_g: f.fat_g,
          })
        )
      );
      // Navigate to home tab so the Nutrition widget refreshes immediately
      router.replace("/(tabs)/home" as any);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save meal.";
      Alert.alert("Save failed", msg + "\n\nMake sure the food_log_items table exists in Supabase.");
      setStage("review");
    }
  };

  const totals = sumTotals(foods);

  // Loading states
  if (stage === "picking" || stage === "analyzing") {
    return (
      <Screen style={{ backgroundColor: "#0B0B0B" }}>
        <AppHeader title="AI Scan" showBack textColor="#F5F5F7" />
        <View style={styles.centered}>
          <View style={styles.scanIcon}>
            <Text style={styles.scanEmoji}>🍽</Text>
          </View>
          <ActivityIndicator color="#20C7B7" size="large" style={{ marginTop: 24 }} />
          <Text style={styles.analyzingText}>
            {stage === "picking" ? "Opening camera…" : "Analysing your meal…"}
          </Text>
          <Text style={styles.analyzingSubtext}>This takes 2–4 seconds</Text>
        </View>
      </Screen>
    );
  }

  if (stage === "error") {
    return (
      <Screen style={{ backgroundColor: "#0B0B0B" }}>
        <AppHeader title="AI Scan" showBack textColor="#F5F5F7" />
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Detection failed</Text>
          <Text style={styles.errorBody}>{errorMsg}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Add manually instead</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { launched.current = false; setStage("picking"); launch(); }} style={styles.tryAgainBtn}>
            <Text style={styles.tryAgainText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={{ backgroundColor: "#0B0B0B" }}>
      <AppHeader title="Confirm Meal" showBack textColor="#F5F5F7" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Meal tag selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Meal</Text>
            <View style={styles.tagRow}>
              {MEAL_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setSelectedTag(tag)}
                  style={[
                    styles.tagChip,
                    selectedTag === tag && styles.tagChipActive,
                  ]}
                >
                  <Text style={[styles.tagText, selectedTag === tag && styles.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Detected foods */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Detected foods — edit grams to adjust</Text>
            {foods.map((food, idx) => (
              <View key={idx} style={styles.foodRow}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodMacros}>
                    {food.calories} kcal · P {food.protein_g}g · C {food.carbs_g}g · F {food.fat_g}g
                  </Text>
                </View>
                <View style={styles.foodRight}>
                  <TextInput
                    style={styles.gramInput}
                    value={gramInputs[idx]}
                    onChangeText={(v) => handleGramChange(idx, v)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                  <Text style={styles.gramLabel}>g</Text>
                  <TouchableOpacity onPress={() => handleRemove(idx)} style={styles.removeBtn}>
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsCard}>
            <Text style={styles.totalsTitle}>Total</Text>
            <View style={styles.totalsRow}>
              <View style={styles.totalItem}>
                <Text style={styles.totalVal}>{totals.calories}</Text>
                <Text style={styles.totalLabel}>kcal</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={[styles.totalVal, { color: "#60A5FA" }]}>{totals.protein_g}g</Text>
                <Text style={styles.totalLabel}>Protein</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={[styles.totalVal, { color: "#FBBF24" }]}>{totals.carbs_g}g</Text>
                <Text style={styles.totalLabel}>Carbs</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={[styles.totalVal, { color: "#F97316" }]}>{totals.fat_g}g</Text>
                <Text style={styles.totalLabel}>Fat</Text>
              </View>
            </View>
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            style={[styles.confirmBtn, stage === "saving" && { opacity: 0.6 }]}
            onPress={handleConfirm}
            disabled={stage === "saving"}
            activeOpacity={0.85}
          >
            {stage === "saving" ? (
              <ActivityIndicator color="#0B0B0B" />
            ) : (
              <Text style={styles.confirmText}>Save Meal</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 20 },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  scanIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: "rgba(32,199,183,0.12)", borderWidth: 1,
    borderColor: "rgba(32,199,183,0.3)", alignItems: "center", justifyContent: "center",
  },
  scanEmoji: { fontSize: 36 },
  analyzingText: { color: "#F5F5F7", fontSize: 18, fontWeight: "700", marginTop: 16, textAlign: "center" },
  analyzingSubtext: { color: "rgba(245,245,247,0.45)", fontSize: 13, marginTop: 6, textAlign: "center" },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorTitle: { color: "#F5F5F7", fontSize: 20, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  errorBody: { color: "rgba(245,245,247,0.55)", fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  retryBtn: { backgroundColor: "#20C7B7", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginBottom: 12 },
  retryText: { color: "#0B0B0B", fontWeight: "800", fontSize: 15 },
  tryAgainBtn: { paddingVertical: 10 },
  tryAgainText: { color: "rgba(245,245,247,0.5)", fontWeight: "600", fontSize: 14 },

  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(245,245,247,0.45)", textTransform: "uppercase", letterSpacing: 0.8 },

  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tagChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  tagChipActive: { backgroundColor: "rgba(32,199,183,0.15)", borderColor: "#20C7B7" },
  tagText: { color: "rgba(245,245,247,0.55)", fontSize: 13, fontWeight: "600" },
  tagTextActive: { color: "#20C7B7" },

  foodRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
  },
  foodInfo: { flex: 1 },
  foodName: { color: "#F5F5F7", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  foodMacros: { color: "rgba(245,245,247,0.45)", fontSize: 12, fontWeight: "500" },
  foodRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  gramInput: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, fontWeight: "700",
    color: "#F5F5F7", width: 56, textAlign: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  gramLabel: { color: "rgba(245,245,247,0.45)", fontSize: 13, fontWeight: "500" },
  removeBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.12)", alignItems: "center", justifyContent: "center",
  },
  removeText: { color: "#EF4444", fontSize: 18, fontWeight: "700", lineHeight: 22 },

  totalsCard: {
    backgroundColor: "rgba(32,199,183,0.08)", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(32,199,183,0.2)", padding: 18, gap: 12,
  },
  totalsTitle: { color: "#F5F5F7", fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between" },
  totalItem: { alignItems: "center", gap: 2 },
  totalVal: { color: "#F5F5F7", fontSize: 20, fontWeight: "800" },
  totalLabel: { color: "rgba(245,245,247,0.45)", fontSize: 11, fontWeight: "500" },

  confirmBtn: {
    backgroundColor: "#20C7B7", borderRadius: 16, paddingVertical: 16, alignItems: "center",
  },
  confirmText: { color: "#0B0B0B", fontWeight: "800", fontSize: 16 },
});
