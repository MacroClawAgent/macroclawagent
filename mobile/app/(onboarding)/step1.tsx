import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { router } from "expo-router";

const SPORTS = ["Running", "Cycling", "Gym / Strength", "Swimming", "Triathlon", "Other"];

export default function OnboardingStep1() {
  const [fullName, setFullName] = useState("");
  const [sport, setSport] = useState("");

  function handleNext() {
    if (!fullName.trim()) return;
    router.push({
      pathname: "/(onboarding)/step2",
      params: { full_name: fullName.trim(), sport },
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.step}>Step 1 of 2</Text>
        <Text style={styles.title}>Let's get to know you</Text>
        <Text style={styles.subtitle}>Tell us your name and what you train for.</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              style={styles.input}
              placeholder="Alex Johnson"
              placeholderTextColor="rgba(245,245,247,0.35)"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>What do you train for?</Text>
            <View style={styles.sportGrid}>
              {SPORTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sportChip, sport === s && styles.sportChipActive]}
                  onPress={() => setSport(s)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.sportChipText, sport === s && styles.sportChipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, !fullName.trim() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!fullName.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  inner: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 48 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 32, gap: 0 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.1)" },
  progressActive: { backgroundColor: "#D4FF00" },
  progressLine: { flex: 1, height: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 6 },
  step: { fontSize: 12, fontWeight: "600", color: "#D4FF00", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#F5F5F7", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "rgba(245,245,247,0.55)", marginBottom: 32, lineHeight: 22 },
  form: { gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: "600", color: "rgba(245,245,247,0.55)", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#F5F5F7",
  },
  sportGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sportChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.07)",
  },
  sportChipActive: { backgroundColor: "rgba(212,255,0,0.12)", borderColor: "#D4FF00" },
  sportChipText: { fontSize: 13, color: "rgba(245,245,247,0.55)", fontWeight: "600" },
  sportChipTextActive: { color: "#D4FF00" },
  button: { backgroundColor: "#D4FF00", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#0B0B0B", fontWeight: "800", fontSize: 16 },
});
