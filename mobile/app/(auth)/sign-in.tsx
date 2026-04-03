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
const CARD = "#252018";
const GOLD = "#F5C842";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

const BASE_URL: string = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://jonnoai.com");

const FEATURES = [
  { icon: "sparkles-outline", text: "AI-powered meal plans tailored to your goals" },
  { icon: "camera-outline", text: "Scan any meal for instant macro tracking" },
  { icon: "cart-outline", text: "Smart Cart with real supermarket prices" },
  { icon: "people-outline", text: "Community of athletes sharing recipes" },
];

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [showEmail, setShowEmail] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  async function handleAppleSignIn() {
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

  async function handleEmailSignIn() {
    if (!emailOrUsername || !password) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    let email = emailOrUsername.trim();
    if (!email.includes("@")) {
      try {
        const res = await fetch(`${BASE_URL}/api/users/by-username?username=${encodeURIComponent(email)}`);
        const json = await res.json();
        if (!res.ok || !json.email) { setLoading(false); Alert.alert("Not found", "No account with that username."); return; }
        email = json.email;
      } catch { setLoading(false); Alert.alert("Error", "Could not reach the server."); return; }
    }
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) Alert.alert("Sign in failed", error);
    else router.replace("/");
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={s.hero}>
          <View style={s.logoWrap}>
            <View style={s.logoDot} />
            <Text style={s.logoText}>Jonno</Text>
          </View>
          <Text style={s.heroTitle}>Your AI{"\n"}Nutrition Coach</Text>
          <Text style={s.heroSub}>
            Personalised meal plans, macro tracking, and smart shopping — powered by AI.
          </Text>
        </View>

        {/* ── Features ── */}
        <View style={s.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <View style={s.featureIcon}>
                <Ionicons name={f.icon as any} size={18} color={GOLD} />
              </View>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Auth buttons ── */}
        <View style={s.authSection}>
          {/* Apple Sign In */}
          {Platform.OS === "ios" && (
            <TouchableOpacity style={s.appleBtn} onPress={handleAppleSignIn} disabled={appleLoading} activeOpacity={0.85}>
              {appleLoading ? <ActivityIndicator color="#000" /> : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#000" />
                  <Text style={s.appleBtnText}>Continue with Apple</Text>
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

          {/* Email sign in */}
          {showEmail ? (
            <View style={s.emailForm}>
              <TextInput
                style={s.input}
                placeholder="Email or username"
                placeholderTextColor={DIM}
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              <TextInput
                style={s.input}
                placeholder="Password"
                placeholderTextColor={DIM}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[s.emailBtn, loading && { opacity: 0.6 }]}
                onPress={handleEmailSignIn}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color={BG} /> : <Text style={s.emailBtnText}>Sign In</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.emailOutlineBtn} onPress={() => setShowEmail(true)} activeOpacity={0.8}>
              <Ionicons name="mail-outline" size={18} color={TEXT_C} />
              <Text style={s.emailOutlineBtnText}>Continue with Email</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity><Text style={s.footerLink}>Sign up</Text></TouchableOpacity>
          </Link>
        </View>

        <Text style={s.legal}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },

  // Hero
  hero: { marginBottom: 32 },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 },
  logoDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: GOLD },
  logoText: { fontSize: 22, fontWeight: "900", color: TEXT_C, letterSpacing: 1 },
  heroTitle: { fontSize: 36, fontWeight: "900", color: TEXT_C, lineHeight: 42, letterSpacing: -1 },
  heroSub: { fontSize: 15, color: MUTED, lineHeight: 22, marginTop: 12 },

  // Features
  features: { gap: 14, marginBottom: 36 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(245,200,66,0.08)", borderWidth: 1, borderColor: "rgba(245,200,66,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  featureText: { fontSize: 14, color: TEXT_C, fontWeight: "500", flex: 1 },

  // Auth
  authSection: { gap: 14 },
  appleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 16,
  },
  appleBtnText: { fontSize: 16, fontWeight: "700", color: "#000" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(232,224,208,0.1)" },
  dividerText: { fontSize: 13, color: DIM, fontWeight: "500" },

  emailOutlineBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "rgba(232,224,208,0.15)", borderRadius: 14, paddingVertical: 16,
  },
  emailOutlineBtnText: { fontSize: 16, fontWeight: "600", color: TEXT_C },

  emailForm: { gap: 12 },
  input: {
    backgroundColor: "rgba(232,224,208,0.06)", borderWidth: 1, borderColor: "rgba(232,224,208,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: TEXT_C,
  },
  emailBtn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  emailBtnText: { color: BG, fontWeight: "800", fontSize: 16 },

  // Footer
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: MUTED, fontSize: 14 },
  footerLink: { color: GOLD, fontWeight: "700", fontSize: 14 },
  legal: { fontSize: 11, color: DIM, textAlign: "center", marginTop: 16, lineHeight: 16 },
});
