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
                placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
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
  container: { flex: 1, backgroundColor: "#F4F5F7" },
  inner: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 48 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#E5E7EB" },
  progressDone: { backgroundColor: "#20C7B7" },
  progressActive: { backgroundColor: "#20C7B7" },
  progressLine: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginHorizontal: 6 },
  progressLineDone: { backgroundColor: "#20C7B7" },
  step: { fontSize: 12, fontWeight: "600", color: "#20C7B7", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#1C1C1E", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#6B7280", marginBottom: 32, lineHeight: 22 },
  form: { gap: 16 },
  row: { flexDirection: "row", gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#1C1C1E",
  },
  sectionHeader: { gap: 2, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  sectionHint: { fontSize: 12, color: "#9CA3AF" },
  button: { backgroundColor: "#20C7B7", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
