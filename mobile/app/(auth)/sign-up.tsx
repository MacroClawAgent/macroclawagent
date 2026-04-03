import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const BG = "#1C1612";
const GOLD = "#F5C842";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleAppleSignUp() {
    try {
      setAppleLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        if (error) throw error;
        router.replace("/");
      }
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Apple Sign In failed", e.message ?? "Please try again.");
      }
    } finally {
      setAppleLoading(false);
    }
  }

  async function handleSignUp() {
    if (!email || !password) { Alert.alert("Required", "Please enter your email and password."); return; }
    if (password.length < 6) { Alert.alert("Weak password", "Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert("Sign up failed", error);
    else router.replace("/");
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoDot} />
          <Text style={s.logoText}>Jonno</Text>
        </View>

        <Text style={s.title}>Create your account</Text>
        <Text style={s.subtitle}>Start your AI nutrition journey — personalised meals, smart tracking, and community.</Text>

        {/* Apple Sign Up */}
        {Platform.OS === "ios" && (
          <TouchableOpacity style={s.appleBtn} onPress={handleAppleSignUp} disabled={appleLoading} activeOpacity={0.85}>
            {appleLoading ? <ActivityIndicator color="#000" /> : (
              <>
                <Ionicons name="logo-apple" size={20} color="#000" />
                <Text style={s.appleBtnText}>Sign up with Apple</Text>
              </>
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
          <TextInput
            style={s.input}
            placeholder="Email address"
            placeholderTextColor={DIM}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <View style={s.pwWrap}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Password (min. 6 characters)"
              placeholderTextColor={DIM}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={s.eyeBtn}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={DIM} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color={BG} /> : <Text style={s.submitBtnText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <Text style={s.legal}>
          By creating an account you agree to our Terms of Service and Privacy Policy. No credit card required.
        </Text>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity><Text style={s.footerLink}>Sign in</Text></TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40, gap: 16 },

  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  logoDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: GOLD },
  logoText: { fontSize: 22, fontWeight: "900", color: TEXT_C, letterSpacing: 1 },

  title: { fontSize: 28, fontWeight: "900", color: TEXT_C, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: MUTED, lineHeight: 22 },

  appleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 16,
  },
  appleBtnText: { fontSize: 16, fontWeight: "700", color: "#000" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(232,224,208,0.1)" },
  dividerText: { fontSize: 13, color: DIM, fontWeight: "500" },

  form: { gap: 12 },
  input: {
    backgroundColor: "rgba(232,224,208,0.06)", borderWidth: 1, borderColor: "rgba(232,224,208,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: TEXT_C,
  },
  pwWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 8 },
  submitBtn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: BG, fontWeight: "800", fontSize: 16 },

  legal: { fontSize: 11, color: DIM, textAlign: "center", lineHeight: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { color: MUTED, fontSize: 14 },
  footerLink: { color: GOLD, fontWeight: "700", fontSize: 14 },
});
