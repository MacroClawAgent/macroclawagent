import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingStep2() {
  const params = useLocalSearchParams<{ full_name: string; sport?: string }>();
  const { refreshProfile } = useAuth();

  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [calorieGoal, setCalorieGoal] = useState("2000");
  const [proteinGoal, setProteinGoal] = useState("120");
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    try {
      await apiPost("/api/profile/update", {
        full_name: params.full_name,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        calorie_goal: parseInt(calorieGoal) || 2000,
        protein_goal: parseInt(proteinGoal) || 120,
        profile_complete: true,
      });
      await refreshProfile();
      router.replace("/(tabs)");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      Alert.alert("Error", message);
      setLoading(false);
    }
  }

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
          <View style={[styles.progressDot, styles.progressActive]} />
        </View>

        <Text style={styles.step}>Step 2 of 2</Text>
        <Text style={styles.title}>Your body & goals</Text>
        <Text style={styles.subtitle}>
          This lets Jonno calculate accurate macro targets for you. All optional — you can update later.
        </Text>

        <View style={styles.form}>
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

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily targets</Text>
            <Text style={styles.sectionHint}>Jonno will adjust these based on your training</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Calories (kcal)</Text>
              <TextInput
                style={styles.input}
                value={calorieGoal}
                onChangeText={setCalorieGoal}
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                value={proteinGoal}
                onChangeText={setProteinGoal}
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
              ? <ActivityIndicator color="#fff" />
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
  progressDone: { backgroundColor: "#D4FF00" },
  progressActive: { backgroundColor: "#D4FF00" },
  progressLine: { flex: 1, height: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 6 },
  progressLineDone: { backgroundColor: "#D4FF00" },
  step: { fontSize: 12, fontWeight: "600", color: "#D4FF00", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#F5F5F7", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "rgba(245,245,247,0.55)", marginBottom: 32, lineHeight: 22 },
  form: { gap: 16 },
  row: { flexDirection: "row", gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: "rgba(245,245,247,0.55)", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#F5F5F7",
  },
  sectionHeader: { gap: 2, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#F5F5F7" },
  sectionHint: { fontSize: 12, color: "rgba(245,245,247,0.35)" },
  button: { backgroundColor: "#D4FF00", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#0B0B0B", fontWeight: "800", fontSize: 16 },
});
