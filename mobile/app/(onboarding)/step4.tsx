import { useCallback, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const BG = "#1C1612";
const CARD = "#252018";
const GOLD = "#F5C842";
const SAGE = "#8B9E6E";
const CORAL = "#E07B54";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

const BASE_URL: string = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://jonnoai.com");

const BLOCKED_WORDS = [
  'fuck','shit','ass','dick','cock','pussy','bitch','slut','whore',
  'nigger','nigga','fag','faggot','cunt','bastard','porn','sex','nude',
  'penis','vagina','anal','rape','cum','dildo','boob','tits',
];

function validateUsername(u: string): string | null {
  if (u.length < 3) return "At least 3 characters";
  if (u.length > 20) return "Max 20 characters";
  if (!/^[a-z0-9_]+$/.test(u)) return "Letters, numbers and underscores only";
  const lower = u.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) return "Username contains inappropriate language";
  }
  return null;
}

export default function OnboardingStep4() {
  const params = useLocalSearchParams<{
    first_name: string; last_name: string; dob?: string; sport?: string;
    weight_kg?: string; height_cm?: string; metabolism?: string; unit?: string;
    goal: string; calorie_goal?: string; protein_goal?: string; carbs_goal?: string; fat_goal?: string;
  }>();
  const { refreshProfile } = useAuth();

  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const validationError = username ? validateUsername(username) : null;

  const checkAvailability = useCallback(async (value: string) => {
    if (validateUsername(value)) { setAvailable(null); return; }
    setChecking(true);
    setAvailable(null);
    try {
      const res = await fetch(`${BASE_URL}/api/users/check-username?username=${encodeURIComponent(value)}`);
      const json = await res.json();
      setAvailable(json.available ?? false);
    } catch { setAvailable(null); }
    finally { setChecking(false); }
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(clean);
    setAvailable(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (clean.length >= 3 && !validateUsername(clean)) {
      debounceRef.current = setTimeout(() => checkAvailability(clean), 500);
    }
  }

  async function handleFinish() {
    setLoading(true);
    try {
      // Save all onboarding data in one call
      await apiPost("/api/profile/update", {
        full_name: `${params.first_name} ${params.last_name}`.trim(),
        date_of_birth: params.dob && params.dob.length === 10
          ? `${params.dob.slice(6, 10)}-${params.dob.slice(3, 5)}-${params.dob.slice(0, 2)}`
          : undefined,
        fitness_goal: params.goal,
        weight_kg: params.weight_kg ? parseFloat(params.weight_kg) : undefined,
        height_cm: params.height_cm ? parseFloat(params.height_cm) : undefined,
        unit_preference: params.unit ?? "metric",
        calorie_goal: parseInt(params.calorie_goal ?? "2000"),
        protein_goal: parseInt(params.protein_goal ?? "120"),
        carbs_goal: parseInt(params.carbs_goal ?? "250"),
        fat_goal: parseInt(params.fat_goal ?? "70"),
        username: username || undefined,
        is_public: true,
        profile_complete: true,
      });
      await refreshProfile();
      router.replace("/(tabs)/home");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      if (msg.toLowerCase().includes("username")) {
        setAvailable(false);
      } else {
        Alert.alert("Error", msg);
      }
      setLoading(false);
    }
  }

  // Username required and must be available
  const canContinue = !loading && username.length >= 3 && available === true && !validationError;

  function getStatus() {
    if (!username || username.length < 3) return null;
    if (validationError) return { text: validationError, color: CORAL };
    if (checking) return { text: "Checking...", color: MUTED };
    if (available === true) return { text: `@${username} is available`, color: SAGE };
    if (available === false) return { text: "Already taken", color: CORAL };
    return null;
  }
  const status = getStatus();

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={TEXT_C} />
        </TouchableOpacity>

        {/* Progress */}
        <View style={s.progressRow}>
          <View style={[s.dot, s.dotDone]} />
          <View style={[s.line, s.lineDone]} />
          <View style={[s.dot, s.dotDone]} />
          <View style={[s.line, s.lineDone]} />
          <View style={[s.dot, s.dotDone]} />
          <View style={[s.line, s.lineDone]} />
          <View style={[s.dot, s.dotActive]} />
        </View>

        <Text style={s.step}>Step 4 of 4</Text>
        <Text style={s.title}>Almost there</Text>
        <Text style={s.subtitle}>Pick a username for the community. You can change it later.</Text>

        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.label}>Username</Text>
            <View style={s.inputRow}>
              <Text style={s.atSign}>@</Text>
              <TextInput
                style={s.inputWithAt}
                placeholder="your_handle"
                placeholderTextColor={DIM}
                value={username}
                onChangeText={handleChange}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                autoFocus
              />
              {checking && <ActivityIndicator size="small" color={MUTED} style={{ paddingRight: 12 }} />}
            </View>
            {status && <Text style={[s.statusText, { color: status.color }]}>{status.text}</Text>}
            <Text style={s.hint}>3-20 characters, letters, numbers, underscores</Text>
          </View>

          {/* Summary */}
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Your profile</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Name</Text>
              <Text style={s.summaryVal}>{params.first_name} {params.last_name}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Goal</Text>
              <Text style={s.summaryVal}>{params.goal?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Daily target</Text>
              <Text style={s.summaryVal}>{params.calorie_goal} kcal · {params.protein_goal}g protein</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[s.btn, !canContinue && s.btnDisabled]}
            onPress={handleFinish}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color={BG} /> : <Text style={s.btnText}>Start using Jonno</Text>}
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
  dotDone: { backgroundColor: GOLD },
  line: { flex: 1, height: 2, backgroundColor: "rgba(232,224,208,0.1)", marginHorizontal: 6 },
  lineDone: { backgroundColor: GOLD },
  step: { fontSize: 12, fontWeight: "600", color: GOLD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: TEXT_C, marginBottom: 8 },
  subtitle: { fontSize: 15, color: MUTED, marginBottom: 28, lineHeight: 22 },
  form: { gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(232,224,208,0.06)", borderWidth: 1, borderColor: "rgba(232,224,208,0.1)", borderRadius: 12,
  },
  atSign: { paddingLeft: 16, fontSize: 15, color: MUTED, fontWeight: "600" },
  inputWithAt: { flex: 1, paddingHorizontal: 4, paddingVertical: 14, fontSize: 15, color: TEXT_C },
  statusText: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  hint: { fontSize: 11, color: DIM },

  summaryCard: {
    backgroundColor: "rgba(232,224,208,0.04)", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.08)", padding: 16, gap: 10,
  },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: GOLD, letterSpacing: 0.5 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 13, color: DIM },
  summaryVal: { fontSize: 13, fontWeight: "600", color: TEXT_C },

  btn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: BG, fontWeight: "800", fontSize: 16 },
});
