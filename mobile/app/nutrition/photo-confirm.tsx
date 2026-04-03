import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { useTheme } from "@/context/ThemeContext";
import { apiPost } from "@/lib/api";
import { setPendingCommunityPost } from "@/lib/communityStore";

type Stage = "picking" | "analyzing" | "review" | "saving" | "error" | "share_prompt";

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
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [pickedImageBase64, setPickedImageBase64] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const savedDishRef = useRef<{ dishName: string; totals: ReturnType<typeof sumTotals> } | null>(null);
  const launched = useRef(false);
  // Stable UUID v4 for this photo session — groups all detected foods as one dish
  const batchId = useRef(
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    })
  );

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
            quality: 0.7,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            base64: true,
          });

    if (result.canceled || !result.assets?.[0]?.base64) {
      router.back();
      return;
    }

    const { base64, mimeType, uri } = result.assets[0];
    setPickedImageUri(uri ?? null);
    setPickedImageBase64(base64 ?? null);
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
    // Derive dish name from top 2 calorie items
    const sorted = [...foods].sort((a, b) => b.calories - a.calories);
    const dishName = foods.length === 1
      ? foods[0].name
      : sorted.slice(0, 2).map(f => f.name).join(" & ");
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
            batch_id: batchId.current,
            dish_name: dishName,
          })
        )
      );
      savedDishRef.current = { dishName, totals };
      setStage("share_prompt");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save meal.";
      Alert.alert("Save failed", msg);
      setStage("review");
    }
  };

  const totals = sumTotals(foods);

  const TAG_ICONS: Record<string, string> = { Breakfast: "sunny-outline", Lunch: "restaurant-outline", Dinner: "moon-outline", Snack: "flash-outline" };

  const handleShareToComm = () => {
    const saved = savedDishRef.current;
    if (!saved) { router.replace("/(tabs)/home" as any); return; }
    setPendingCommunityPost({
      id: batchId.current,
      dishName: saved.dishName,
      mealTag: selectedTag,
      mealEmoji: TAG_ICONS[selectedTag] ?? "restaurant-outline",
      calories: saved.totals.calories,
      protein: saved.totals.protein_g,
      carbs: saved.totals.carbs_g,
      fat: saved.totals.fat_g,
      ingredients: foods.map((f) => ({ name: f.name, grams: f.grams, calories: f.calories })),
      imageUri: pickedImageUri,
      imageBase64: pickedImageBase64,
      postedAt: Date.now(),
    });
    router.replace("/(tabs)/community" as any);
  };

  const handleKeepPrivate = () => {
    router.replace("/(tabs)/home" as any);
  };

  // Share prompt — shown after successful save
  if (stage === "share_prompt") {
    const saved = savedDishRef.current;
    const iconName = TAG_ICONS[selectedTag] ?? "restaurant-outline";
    return (
      <Screen style={{ backgroundColor: "#1C1612" }}>
        <AppHeader title="" textColor="#E8E0D0" />
        <View style={sp.container}>
          <View style={sp.emojiWrap}>
            <Ionicons name={iconName as any} size={36} color="#F5C842" />
          </View>
          <Text style={sp.heading}>Meal saved</Text>
          <Text style={sp.sub}>Share it with the community?</Text>

          {/* Meal card */}
          <View style={sp.mealCard}>
            <Text style={sp.dishName}>{saved?.dishName ?? selectedTag}</Text>
            <View style={sp.macroRow}>
              <View style={sp.macroItem}>
                <Text style={sp.macroVal}>{saved?.totals.calories ?? 0}</Text>
                <Text style={sp.macroLbl}>kcal</Text>
              </View>
              <View style={sp.macroDivider} />
              <View style={sp.macroItem}>
                <Text style={[sp.macroVal, { color: "#E07B54" }]}>{+(saved?.totals.protein_g ?? 0).toFixed(1)}g</Text>
                <Text style={sp.macroLbl}>Protein</Text>
              </View>
              <View style={sp.macroDivider} />
              <View style={sp.macroItem}>
                <Text style={[sp.macroVal, { color: "#F5C842" }]}>{+(saved?.totals.carbs_g ?? 0).toFixed(1)}g</Text>
                <Text style={sp.macroLbl}>Carbs</Text>
              </View>
              <View style={sp.macroDivider} />
              <View style={sp.macroItem}>
                <Text style={[sp.macroVal, { color: "#8B9E6E" }]}>{+(saved?.totals.fat_g ?? 0).toFixed(1)}g</Text>
                <Text style={sp.macroLbl}>Fat</Text>
              </View>
            </View>
            <Text style={sp.ingredientsHint}>
              {foods.length} ingredient{foods.length !== 1 ? "s" : ""} · tap meal to see details in feed
            </Text>
          </View>

          <TouchableOpacity style={sp.postBtn} activeOpacity={0.85} onPress={handleShareToComm}>
            <Text style={sp.postBtnText}>Post to Community</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sp.privateBtn} activeOpacity={0.7} onPress={handleKeepPrivate}>
            <Text style={sp.privateBtnText}>Keep private</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // Loading states
  if (stage === "picking" || stage === "analyzing") {
    return (
      <Screen style={{ backgroundColor: "#1C1612" }}>
        <AppHeader title="AI Scan" showBack textColor="#E8E0D0" />
        <View style={styles.centered}>
          <View style={styles.scanIcon}>
            <Ionicons name="scan-outline" size={36} color="#F5C842" />
          </View>
          <ActivityIndicator color="#F5C842" size="large" style={{ marginTop: 24 }} />
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
      <Screen style={{ backgroundColor: "#1C1612" }}>
        <AppHeader title="AI Scan" showBack textColor="#E8E0D0" />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#E07B54" />
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
    <Screen style={{ backgroundColor: "#1C1612" }}>
      <AppHeader title="Confirm Meal" showBack textColor="#E8E0D0" />
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
                    {+food.calories.toFixed(1)} kcal · P {+food.protein_g.toFixed(1)}g · C {+food.carbs_g.toFixed(1)}g · F {+food.fat_g.toFixed(1)}g
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
                <Text style={styles.totalVal}>{+totals.calories.toFixed(1)}</Text>
                <Text style={styles.totalLabel}>kcal</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={[styles.totalVal, { color: "#E07B54" }]}>{+totals.protein_g.toFixed(1)}g</Text>
                <Text style={styles.totalLabel}>Protein</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={[styles.totalVal, { color: "#F5C842" }]}>{+totals.carbs_g.toFixed(1)}g</Text>
                <Text style={styles.totalLabel}>Carbs</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={[styles.totalVal, { color: "#8B9E6E" }]}>{+totals.fat_g.toFixed(1)}g</Text>
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
              <ActivityIndicator color="#1C1612" />
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
    backgroundColor: "rgba(245,200,66,0.12)", borderWidth: 1,
    borderColor: "rgba(245,200,66,0.3)", alignItems: "center", justifyContent: "center",
  },
  analyzingText: { color: "#E8E0D0", fontSize: 18, fontWeight: "700", marginTop: 16, textAlign: "center" },
  analyzingSubtext: { color: "rgba(232,224,208,0.45)", fontSize: 13, marginTop: 6, textAlign: "center" },
  errorTitle: { color: "#E8E0D0", fontSize: 20, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  errorBody: { color: "rgba(232,224,208,0.55)", fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  retryBtn: { backgroundColor: "#F5C842", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginBottom: 12 },
  retryText: { color: "#1C1612", fontWeight: "800", fontSize: 15 },
  tryAgainBtn: { paddingVertical: 10 },
  tryAgainText: { color: "rgba(232,224,208,0.5)", fontWeight: "600", fontSize: 14 },

  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(232,224,208,0.45)", textTransform: "uppercase", letterSpacing: 0.8 },

  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tagChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "rgba(232,224,208,0.07)", borderWidth: 1, borderColor: "rgba(232,224,208,0.1)",
  },
  tagChipActive: { backgroundColor: "rgba(245,200,66,0.15)", borderColor: "#F5C842" },
  tagText: { color: "rgba(232,224,208,0.55)", fontSize: 13, fontWeight: "600" },
  tagTextActive: { color: "#F5C842" },

  foodRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(232,224,208,0.05)", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.08)",
    padding: 14,
  },
  foodInfo: { flex: 1 },
  foodName: { color: "#E8E0D0", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  foodMacros: { color: "rgba(232,224,208,0.45)", fontSize: 12, fontWeight: "500" },
  foodRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  gramInput: {
    backgroundColor: "rgba(232,224,208,0.1)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, fontWeight: "700",
    color: "#E8E0D0", width: 56, textAlign: "center",
    borderWidth: 1, borderColor: "rgba(232,224,208,0.15)",
  },
  gramLabel: { color: "rgba(232,224,208,0.45)", fontSize: 13, fontWeight: "500" },
  removeBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.12)", alignItems: "center", justifyContent: "center",
  },
  removeText: { color: "#E07B54", fontSize: 18, fontWeight: "700", lineHeight: 22 },

  totalsCard: {
    backgroundColor: "rgba(245,200,66,0.08)", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(245,200,66,0.2)", padding: 18, gap: 12,
  },
  totalsTitle: { color: "#E8E0D0", fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between" },
  totalItem: { alignItems: "center", gap: 2 },
  totalVal: { color: "#E8E0D0", fontSize: 20, fontWeight: "800" },
  totalLabel: { color: "rgba(232,224,208,0.45)", fontSize: 11, fontWeight: "500" },

  confirmBtn: {
    backgroundColor: "#F5C842", borderRadius: 16, paddingVertical: 16, alignItems: "center",
  },
  confirmText: { color: "#1C1612", fontWeight: "800", fontSize: 16 },
});

const sp = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 16 },
  emojiWrap: {
    width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(245,200,66,0.12)", borderWidth: 1, borderColor: "rgba(245,200,66,0.25)",
  },
  heading: { fontSize: 26, fontWeight: "800", color: "#E8E0D0", letterSpacing: -0.5 },
  sub: { fontSize: 15, color: "rgba(232,224,208,0.55)", fontWeight: "500", marginTop: -6 },
  mealCard: {
    width: "100%", backgroundColor: "rgba(232,224,208,0.06)", borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.1)", padding: 18, gap: 12, marginVertical: 4,
  },
  dishName: { color: "#E8E0D0", fontSize: 17, fontWeight: "700" },
  macroRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  macroItem: { alignItems: "center", flex: 1, gap: 2 },
  macroVal: { color: "#E8E0D0", fontSize: 17, fontWeight: "800" },
  macroLbl: { color: "rgba(232,224,208,0.4)", fontSize: 11, fontWeight: "500" },
  macroDivider: { width: 1, height: 32, backgroundColor: "rgba(232,224,208,0.08)" },
  ingredientsHint: { color: "rgba(232,224,208,0.3)", fontSize: 12, fontWeight: "500" },
  postBtn: {
    width: "100%", backgroundColor: "#F5C842", borderRadius: 16, paddingVertical: 16, alignItems: "center",
  },
  postBtnText: { color: "#1C1612", fontWeight: "800", fontSize: 16 },
  privateBtn: { paddingVertical: 12 },
  privateBtnText: { color: "rgba(232,224,208,0.4)", fontSize: 15, fontWeight: "600" },
});
