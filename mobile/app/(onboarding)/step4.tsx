import { useCallback, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const BASE_URL: string = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://jonnoai.com");

function validateUsername(u: string): string | null {
  if (u.length < 3) return "At least 3 characters";
  if (u.length > 20) return "Max 20 characters";
  if (!/^[a-z0-9_]+$/.test(u)) return "Letters, numbers and underscores only";
  return null;
}

export default function OnboardingStep4() {
  const params = useLocalSearchParams<{ full_name: string; goal: string }>();
  const { refreshProfile } = useAuth();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validationError = username ? validateUsername(username) : null;

  const checkAvailability = useCallback(async (value: string) => {
    if (validateUsername(value)) { setAvailable(null); return; }
    setChecking(true);
    setAvailable(null);
    setCheckError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/users/check-username?username=${encodeURIComponent(value)}`);
      const json = await res.json();
      setAvailable(json.available);
      if (json.error) setCheckError(json.error);
    } catch {
      setCheckError("Couldn't check availability");
    } finally {
      setChecking(false);
    }
  }, []);

  function handleChange(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(clean);
    setAvailable(null);
    if (clean.length >= 3) {
      const timer = setTimeout(() => checkAvailability(clean), 600);
      return () => clearTimeout(timer);
    }
  }

  async function handleFinish() {
    if (!username || available !== true) return;
    setLoading(true);
    try {
      await apiPost("/api/profile/update", {
        username,
        bio: bio.trim() || undefined,
        is_public: true,
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

  function getStatusText() {
    if (!username || username.length < 3) return null;
    if (validationError) return { text: validationError, color: "#FF453A" };
    if (checking) return { text: "Checking...", color: "#9CA3AF" };
    if (checkError) return { text: checkError, color: "#FF453A" };
    if (available === true) return { text: `@${username} is available ✓`, color: "#34C759" };
    if (available === false) return { text: "Username already taken", color: "#FF453A" };
    return null;
  }

  const status = getStatusText();
  const canContinue = !loading && available === true && !validationError;

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
          <View style={[styles.progressDot, styles.progressDone]} />
          <View style={[styles.progressLine, styles.progressLineDone]} />
          <View style={[styles.progressDot, styles.progressActive]} />
        </View>

        <Text style={styles.step}>Step 4 of 4</Text>
        <Text style={styles.title}>Choose your username</Text>
        <Text style={styles.subtitle}>
          This is how others find you in the community. You can change it later.
        </Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputRow}>
              <Text style={styles.atSign}>@</Text>
              <TextInput
                style={[styles.input, styles.inputWithAt]}
                placeholder="your_handle"
                placeholderTextColor="rgba(245,245,247,0.35)"
                value={username}
                onChangeText={handleChange}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
              {checking && (
                <ActivityIndicator size="small" color="#9CA3AF" style={styles.inputIcon} />
              )}
            </View>
            {status && (
              <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
            )}
            <Text style={styles.hint}>3–20 characters · letters, numbers, underscores</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bio <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell the community a bit about yourself..."
              placeholderTextColor="rgba(245,245,247,0.35)"
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={150}
              numberOfLines={3}
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            onPress={handleFinish}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#1C1612" />
              : <Text style={styles.buttonText}>Start using Jonno 🎉</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={async () => {
            setLoading(true);
            try {
              await apiPost("/api/profile/update", { profile_complete: true });
              await refreshProfile();
              router.replace("/(tabs)/home");
            } catch { router.replace("/(tabs)/home"); }
          }} activeOpacity={0.7}>
            <Text style={styles.skip}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1C1612" },
  inner: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 48 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.1)" },
  progressActive: { backgroundColor: "#F5C842" },
  progressDone: { backgroundColor: "#F5C842" },
  progressLine: { flex: 1, height: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 6 },
  progressLineDone: { backgroundColor: "#F5C842" },
  step: { fontSize: 12, fontWeight: "600", color: "#F5C842", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#E8E0D0", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "rgba(245,245,247,0.55)", marginBottom: 32, lineHeight: 22 },
  form: { gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: "rgba(245,245,247,0.55)", textTransform: "uppercase", letterSpacing: 0.5 },
  optional: { fontWeight: "400", textTransform: "none" },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12 },
  atSign: { paddingLeft: 16, fontSize: 15, color: "rgba(245,245,247,0.55)", fontWeight: "600" },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#E8E0D0",
  },
  inputWithAt: {
    flex: 1, backgroundColor: "transparent", borderWidth: 0,
    paddingLeft: 4,
  },
  inputIcon: { paddingRight: 12 },
  bioInput: { minHeight: 80, textAlignVertical: "top", paddingTop: 14 },
  statusText: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  hint: { fontSize: 11, color: "rgba(245,245,247,0.3)", marginTop: 2 },
  charCount: { fontSize: 11, color: "rgba(245,245,247,0.3)", alignSelf: "flex-end" },
  button: { backgroundColor: "#F5C842", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#1C1612", fontWeight: "800", fontSize: 16 },
  skip: { textAlign: "center", color: "rgba(245,245,247,0.35)", fontSize: 14, fontWeight: "500", marginTop: 4 },
});
