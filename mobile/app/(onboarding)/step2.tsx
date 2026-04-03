import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const GOALS = [
  {
    id: "lose_weight",
    emoji: "🔥",
    label: "Lose Weight",
    desc: "Burn fat while preserving muscle through smart nutrition",
  },
  {
    id: "build_muscle",
    emoji: "💪",
    label: "Build Muscle",
    desc: "Fuel growth with the right surplus and protein targets",
  },
  {
    id: "performance",
    emoji: "🏃",
    label: "Performance",
    desc: "Optimise fuelling and recovery around your training",
  },
  {
    id: "maintain",
    emoji: "✅",
    label: "Stay Healthy",
    desc: "Balanced nutrition and sustainable energy every day",
  },
];

export default function OnboardingStep2() {
  const params = useLocalSearchParams<{ full_name: string; sport?: string }>();
  const [goal, setGoal] = useState("");

  function handleNext() {
    if (!goal) return;
    router.push({
      pathname: "/(onboarding)/step3",
      params: { full_name: params.full_name, sport: params.sport ?? "", goal },
    });
  }

  const firstName = (params.full_name ?? "").split(" ")[0] || "there";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.inner}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={24} color="#E8E0D0" />
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={[styles.progressDot, styles.progressDone]} />
        <View style={[styles.progressLine, styles.progressLineDone]} />
        <View style={[styles.progressDot, styles.progressActive]} />
        <View style={styles.progressLine} />
        <View style={styles.progressDot} />
        <View style={styles.progressLine} />
        <View style={styles.progressDot} />
      </View>

      <Text style={styles.step}>Step 2 of 4</Text>
      <Text style={styles.title}>What's your goal, {firstName}?</Text>
      <Text style={styles.subtitle}>
        Jonno uses this to personalise every meal plan and nutrition recommendation for you.
      </Text>

      <View style={styles.goalList}>
        {GOALS.map((g) => {
          const active = goal === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              onPress={() => setGoal(g.id)}
              activeOpacity={0.8}
              style={[styles.goalCard, active && styles.goalCardActive]}
            >
              <View style={styles.goalLeft}>
                <Text style={styles.goalEmoji}>{g.emoji}</Text>
                <View style={styles.goalText}>
                  <Text style={[styles.goalLabel, active && styles.goalLabelActive]}>{g.label}</Text>
                  <Text style={[styles.goalDesc, active && styles.goalDescActive]}>{g.desc}</Text>
                </View>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.button, !goal && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!goal}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Continue →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1C1612" },
  inner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.1)" },
  progressActive: { backgroundColor: "#F5C842" },
  progressDone: { backgroundColor: "#F5C842" },
  progressLine: { flex: 1, height: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 6 },
  progressLineDone: { backgroundColor: "#F5C842" },

  step: { fontSize: 12, fontWeight: "600", color: "#F5C842", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#E8E0D0", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "rgba(245,245,247,0.55)", marginBottom: 28, lineHeight: 22 },

  goalList: { gap: 12, marginBottom: 28 },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  goalCardActive: {
    backgroundColor: "rgba(212,255,0,0.08)",
    borderColor: "#F5C842",
  },
  goalLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  goalEmoji: { fontSize: 28 },
  goalText: { flex: 1, gap: 2 },
  goalLabel: { fontSize: 16, fontWeight: "700", color: "rgba(245,245,247,0.7)" },
  goalLabelActive: { color: "#F5C842" },
  goalDesc: { fontSize: 12, color: "rgba(245,245,247,0.35)", lineHeight: 17 },
  goalDescActive: { color: "rgba(245,245,247,0.6)" },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  radioActive: { borderColor: "#F5C842" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#F5C842" },

  button: { backgroundColor: "#F5C842", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#1C1612", fontWeight: "800", fontSize: 16 },
});
