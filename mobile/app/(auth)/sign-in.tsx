import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/lib/supabase";

const BG = "#1C1612";
const GOLD = "#F5C842";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

const FEATURES = [
  { icon: "sparkles-outline", text: "AI-powered meal plans tailored to your goals" },
  { icon: "camera-outline", text: "Scan any meal for instant macro tracking" },
  { icon: "cart-outline", text: "Smart Cart with real supermarket prices" },
  { icon: "people-outline", text: "Community of athletes sharing recipes" },
];

export default function LandingScreen() {
  const [appleLoading, setAppleLoading] = useState(false);

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
        router.replace("/(tabs)/home");
      }
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") Alert.alert("Apple Sign In failed", e.message ?? "Please try again.");
    } finally { setAppleLoading(false); }
  }

  return (
    <View style={s.container}>
      {/* ── Hero ── */}
      <View style={s.hero}>
        <View style={s.logoWrap}>
          <View style={s.logoDot} />
          <Text style={s.logoText}>Jonno</Text>
        </View>
        <Text style={s.heroTitle}>Your AI{"\n"}Nutrition Coach</Text>
        <Text style={s.heroSub}>Personalised meal plans, macro tracking, and smart shopping — powered by AI.</Text>
      </View>

      {/* ── Features ── */}
      <View style={s.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={s.featureRow}>
            <View style={s.featureIcon}>
              <Ionicons name={f.icon as any} size={16} color={GOLD} />
            </View>
            <Text style={s.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* ── Buttons ── */}
      <View style={s.buttons}>
        {Platform.OS === "ios" && (
          <TouchableOpacity style={s.appleBtn} onPress={handleApple} disabled={appleLoading} activeOpacity={0.85}>
            {appleLoading ? <ActivityIndicator color="#000" /> : (
              <><Ionicons name="logo-apple" size={20} color="#000" /><Text style={s.appleTxt}>Continue with Apple</Text></>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.emailBtn} onPress={() => router.push("/(auth)/email-sign-in")} activeOpacity={0.8}>
          <Ionicons name="mail-outline" size={18} color={TEXT_C} />
          <Text style={s.emailTxt}>Sign in with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.signupBtn} onPress={() => router.push("/(auth)/sign-up")} activeOpacity={0.8}>
          <Text style={s.signupTxt}>Create an Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.legal}>By continuing you agree to our Terms of Service and Privacy Policy.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40, justifyContent: "space-between" },

  hero: { marginBottom: 24 },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 },
  logoDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: GOLD },
  logoText: { fontSize: 22, fontWeight: "900", color: TEXT_C, letterSpacing: 1 },
  heroTitle: { fontSize: 34, fontWeight: "900", color: TEXT_C, lineHeight: 40, letterSpacing: -1 },
  heroSub: { fontSize: 15, color: MUTED, lineHeight: 22, marginTop: 12 },

  features: { gap: 12, marginBottom: 28 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(245,200,66,0.08)", borderWidth: 1, borderColor: "rgba(245,200,66,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  featureText: { fontSize: 13, color: TEXT_C, fontWeight: "500", flex: 1 },

  buttons: { gap: 12 },
  appleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 16,
  },
  appleTxt: { fontSize: 16, fontWeight: "700", color: "#000" },
  emailBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "rgba(232,224,208,0.15)", borderRadius: 14, paddingVertical: 16,
  },
  emailTxt: { fontSize: 16, fontWeight: "600", color: TEXT_C },
  signupBtn: { alignItems: "center", paddingVertical: 14 },
  signupTxt: { fontSize: 15, fontWeight: "600", color: GOLD },

  legal: { fontSize: 11, color: DIM, textAlign: "center", marginTop: 12, lineHeight: 16 },
});
