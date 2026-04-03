import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const BG = "#1C1612";
const GOLD = "#F5C842";
const CORAL = "#E07B54";
const SAGE = "#8B9E6E";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailValid = isValidEmail(email.trim());
  const pwLong = password.length >= 6;
  const pwMatch = password === confirmPw && confirmPw.length > 0;
  const canSubmit = emailValid && pwLong && pwMatch && !loading;

  // Inline validation hints
  const emailHint = email.length > 0 && !emailValid ? "Enter a valid email address" : null;
  const pwHint = password.length > 0 && !pwLong ? "At least 6 characters" : null;
  const confirmHint = confirmPw.length > 0 && !pwMatch ? "Passwords don't match" : null;

  async function handleApple() {
    try {
      setAppleLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({ provider: "apple", token: credential.identityToken });
        if (error) throw error;
        router.replace("/");
      }
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") Alert.alert("Apple Sign In failed", e.message ?? "Please try again.");
    } finally { setAppleLoading(false); }
  }

  async function handleSignUp() {
    if (!canSubmit) return;
    setSubmitError(null);
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      const lower = error.toLowerCase();
      if (lower.includes("already registered") || lower.includes("already been registered") || lower.includes("already exists")) {
        setSubmitError("This email address is already in use");
      } else {
        setSubmitError(error);
      }
    } else {
      router.replace("/");
    }
  }

  return (
    <View style={s.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={TEXT_C} />
        </TouchableOpacity>

        <Text style={s.title}>Create account</Text>
        <Text style={s.subtitle}>Start your AI nutrition journey — personalised meals, smart tracking, and community.</Text>

        {/* Apple */}
        {Platform.OS === "ios" && (
          <TouchableOpacity style={s.appleBtn} onPress={handleApple} disabled={appleLoading} activeOpacity={0.85}>
            {appleLoading ? <ActivityIndicator color="#000" /> : (
              <><Ionicons name="logo-apple" size={20} color="#000" /><Text style={s.appleTxt}>Sign up with Apple</Text></>
            )}
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Email form */}
        <View style={s.form}>
          <View>
            <TextInput
              style={[s.input, emailHint ? s.inputError : null]}
              placeholder="Email address"
              placeholderTextColor={DIM}
              value={email}
              onChangeText={(v) => { setEmail(v); setSubmitError(null); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            {emailHint && <Text style={s.hint}>{emailHint}</Text>}
          </View>

          <View>
            <View style={s.pwWrap}>
              <TextInput
                style={[s.input, { flex: 1 }, pwHint ? s.inputError : null]}
                placeholder="Password (min. 6 characters)"
                placeholderTextColor={DIM}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={20} color={DIM} />
              </TouchableOpacity>
            </View>
            {pwHint && <Text style={s.hint}>{pwHint}</Text>}
          </View>

          <View>
            <TextInput
              style={[s.input, confirmHint ? s.inputError : null, pwMatch && confirmPw.length > 0 ? s.inputSuccess : null]}
              placeholder="Confirm password"
              placeholderTextColor={DIM}
              value={confirmPw}
              onChangeText={setConfirmPw}
              secureTextEntry={!showPw}
            />
            {confirmHint && <Text style={s.hint}>{confirmHint}</Text>}
            {pwMatch && confirmPw.length > 0 && <Text style={[s.hint, { color: SAGE }]}>Passwords match</Text>}
          </View>

          {/* Inline error */}
          {submitError && (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle" size={16} color={CORAL} />
              <Text style={s.errorText}>{submitError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.submitBtn, !canSubmit && { opacity: 0.4 }]}
            onPress={handleSignUp}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color={BG} /> : <Text style={s.submitTxt}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <Text style={s.legal}>By creating an account you agree to our Terms of Service and Privacy Policy. No credit card required.</Text>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
            <Text style={s.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 60, gap: 16 },
  backBtn: { marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "900", color: TEXT_C, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: MUTED, lineHeight: 22 },
  appleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 16,
  },
  appleTxt: { fontSize: 16, fontWeight: "700", color: "#000" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(232,224,208,0.1)" },
  dividerText: { fontSize: 13, color: DIM, fontWeight: "500" },
  form: { gap: 12 },
  input: {
    backgroundColor: "rgba(232,224,208,0.06)", borderWidth: 1, borderColor: "rgba(232,224,208,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: TEXT_C,
  },
  inputError: { borderColor: "rgba(224,123,84,0.4)" },
  inputSuccess: { borderColor: "rgba(139,158,110,0.4)" },
  pwWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 8 },
  hint: { fontSize: 12, color: CORAL, marginTop: 4, marginLeft: 4 },
  errorRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(224,123,84,0.1)", borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(224,123,84,0.25)",
    paddingHorizontal: 12, paddingVertical: 10,
  },
  errorText: { fontSize: 13, fontWeight: "600", color: CORAL, flex: 1 },
  submitBtn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  submitTxt: { color: BG, fontWeight: "800", fontSize: 16 },
  legal: { fontSize: 11, color: DIM, textAlign: "center", lineHeight: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { color: MUTED, fontSize: 14 },
  footerLink: { color: GOLD, fontWeight: "700", fontSize: 14 },
});
