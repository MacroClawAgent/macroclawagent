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
              placeholderTextColor="#9CA3AF"
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
  container: { flex: 1, backgroundColor: "#F4F5F7" },
  inner: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 48 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 32, gap: 0 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#E5E7EB" },
  progressActive: { backgroundColor: "#20C7B7" },
  progressLine: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginHorizontal: 6 },
  step: { fontSize: 12, fontWeight: "600", color: "#20C7B7", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#1C1C1E", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#6B7280", marginBottom: 32, lineHeight: 22 },
  form: { gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#1C1C1E",
  },
  sportGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sportChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#FFFFFF",
  },
  sportChipActive: { backgroundColor: "rgba(32,199,183,0.12)", borderColor: "#20C7B7" },
  sportChipText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  sportChipTextActive: { color: "#20C7B7" },
  button: { backgroundColor: "#20C7B7", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
