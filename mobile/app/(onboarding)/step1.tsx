import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { router } from "expo-router";

const BG = "#1C1612";
const GOLD = "#F5C842";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

const SPORTS = ["Running", "Cycling", "Gym / Strength", "Swimming", "Triathlon", "Other"];

// Auto-format DOB as DD/MM/YYYY
function formatDOB(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function OnboardingStep1() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [sport, setSport] = useState("");

  const dobValid = dob.length === 10; // DD/MM/YYYY
  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0 && dobValid;

  function handleNext() {
    if (!canContinue) return;
    router.push({
      pathname: "/(onboarding)/step2",
      params: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        dob,
        sport,
      },
    });
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        {/* Progress */}
        <View style={s.progressRow}>
          <View style={[s.dot, s.dotActive]} />
          <View style={s.line} />
          <View style={s.dot} />
          <View style={s.line} />
          <View style={s.dot} />
          <View style={s.line} />
          <View style={s.dot} />
        </View>

        <Text style={s.step}>Step 1 of 4</Text>
        <Text style={s.title}>Let's get to know you</Text>
        <Text style={s.subtitle}>Tell us about yourself so Jonno can personalise everything for you.</Text>

        <View style={s.form}>
          {/* Name row */}
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>First name</Text>
              <TextInput
                style={s.input}
                placeholder="Alex"
                placeholderTextColor={DIM}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoFocus
              />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Last name</Text>
              <TextInput
                style={s.input}
                placeholder="Johnson"
                placeholderTextColor={DIM}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* DOB */}
          <View style={s.field}>
            <Text style={s.label}>Date of birth</Text>
            <TextInput
              style={s.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={DIM}
              value={dob}
              onChangeText={(v) => setDob(formatDOB(v))}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>

          {/* Sport */}
          <View style={s.field}>
            <Text style={s.label}>What do you train for?</Text>
            <View style={s.chipGrid}>
              {SPORTS.map((sp) => (
                <TouchableOpacity
                  key={sp}
                  style={[s.chip, sport === sp && s.chipActive]}
                  onPress={() => setSport(sp)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.chipText, sport === sp && s.chipTextActive]}>{sp}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[s.btn, !canContinue && s.btnDisabled]}
            onPress={handleNext}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(232,224,208,0.1)" },
  dotActive: { backgroundColor: GOLD },
  line: { flex: 1, height: 2, backgroundColor: "rgba(232,224,208,0.1)", marginHorizontal: 6 },
  step: { fontSize: 12, fontWeight: "600", color: GOLD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: TEXT_C, marginBottom: 8 },
  subtitle: { fontSize: 15, color: MUTED, marginBottom: 28, lineHeight: 22 },
  form: { gap: 18 },
  row: { flexDirection: "row", gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "rgba(232,224,208,0.06)", borderWidth: 1, borderColor: "rgba(232,224,208,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: TEXT_C,
  },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.1)", backgroundColor: "rgba(232,224,208,0.06)",
  },
  chipActive: { backgroundColor: "rgba(245,200,66,0.12)", borderColor: GOLD },
  chipText: { fontSize: 13, color: MUTED, fontWeight: "600" },
  chipTextActive: { color: GOLD },
  btn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: BG, fontWeight: "800", fontSize: 16 },
});
