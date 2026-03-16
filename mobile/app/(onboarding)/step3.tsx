import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Lose Weight 🔥",
  build_muscle: "Build Muscle 💪",
  performance: "Performance 🏃",
  maintain: "Stay Healthy ✅",
};

function calcTargets(goal: string, weightKg: number): { calories: number; protein: number } {
  const w = weightKg > 0 ? weightKg : 70;
  switch (goal) {
    case "lose_weight":  return { calories: Math.round(w * 28 - 350), protein: Math.round(w * 2.0) };
    case "build_muscle": return { calories: Math.round(w * 32 + 200), protein: Math.round(w * 2.2) };
    case "performance":  return { calories: Math.round(w * 35),       protein: Math.round(w * 2.2) };
    default:             return { calories: Math.round(w * 30),       protein: Math.round(w * 1.8) };
  }
}

export default function OnboardingStep3() {
  const params = useLocalSearchParams<{ full_name: string; sport?: string; goal: string }>();
  const { refreshProfile } = useAuth();

  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [calorieGoal, setCalorieGoal] = useState("2000");
  const [proteinGoal, setProteinGoal] = useState("120");
  const [loading, setLoading] = useState(false);
  const [autoCalced, setAutoCalced] = useState(false);

  // Auto-calculate when both weight and goal are present
  useEffect(() => {
    const w = parseFloat(weightKg);
    if (w > 0 && params.goal) {
      const t = calcTargets(params.goal, w);
      setCalorieGoal(String(t.calories));
      setProteinGoal(String(t.protein));
      setAutoCalced(true);
    }
  }, [weightKg, params.goal]);

  async function handleFinish() {
    setLoading(true);
    try {
      await apiPost("/api/profile/update", {
        full_name: params.full_name,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        calorie_goal: parseInt(calorieGoal) || 2000,
        protein_goal: parseInt(proteinGoal) || 120,
        fitness_goal: params.goal,
        profile_complete: true,
      });
      await refreshProfile();
      router.replace("/(tabs)/home");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      Alert.alert("Error", message);
      setLoading(false);
    }
  }

  const goalLabel = GOAL_LABELS[params.goal] ?? "Your goal";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDone]} />
          <View style={[styles.progressLine, styles.progressLineDone]} />
          <View style={[styles.progressDot, styles.progressDone]} />
          <View style={[styles.progressLine, styles.progressLineDone]} />
          <View style={[styles.progressDot, styles.progressActive]} />
        </View>

        <Text style={styles.step}>Step 3 of 3</Text>
        <Text style={styles.title}>Your body stats</Text>
        <Text style={styles.subtitle}>
          Jonno will calculate accurate targets for{" "}
          <Text style={styles.goalHighlight}>{goalLabel}</Text>.
          {" "}All optional — update anytime.
        </Text>

        <View style={styles.form}>
          {/* Body stats */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                placeholderTextColor="rgba(245,245,247,0.35)"
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                placeholderTextColor="rgba(245,245,247,0.35)"
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Macro targets */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily targets</Text>
            <Text style={styles.sectionHint}>
              {autoCalced
                ? "Calculated for your goal & weight — you can adjust below"
                : "Jonno will adjust these based on your training"}
            </Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Calories (kcal)</Text>
              <TextInput
                style={[styles.input, autoCalced && styles.inputHighlighted]}
                value={calorieGoal}
                onChangeText={(v) => { setCalorieGoal(v); setAutoCalced(false); }}
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={[styles.input, autoCalced && styles.inputHighlighted]}
                value={proteinGoal}
                onChangeText={(v) => { setProteinGoal(v); setAutoCalced(false); }}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleFinish}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#0B0B0B" />
              : <Text style={styles.buttonText}>Start using Jonno 🎉</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  inner: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 48 },

  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.1)" },
  progressActive: { backgroundColor: "#D4FF00" },
  progressDone: { backgroundColor: "#D4FF00" },
  progressLine: { flex: 1, height: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 6 },
  progressLineDone: { backgroundColor: "#D4FF00" },

  step: { fontSize: 12, fontWeight: "600", color: "#D4FF00", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#F5F5F7", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "rgba(245,245,247,0.55)", marginBottom: 28, lineHeight: 22 },
  goalHighlight: { color: "#D4FF00", fontWeight: "700" },

  form: { gap: 16 },
  row: { flexDirection: "row", gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: "rgba(245,245,247,0.55)", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#F5F5F7",
  },
  inputHighlighted: {
    borderColor: "rgba(212,255,0,0.4)",
    backgroundColor: "rgba(212,255,0,0.05)",
  },
  sectionHeader: { gap: 2, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#F5F5F7" },
  sectionHint: { fontSize: 12, color: "rgba(245,245,247,0.35)" },
  button: { backgroundColor: "#D4FF00", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#0B0B0B", fontWeight: "800", fontSize: 16 },
});
