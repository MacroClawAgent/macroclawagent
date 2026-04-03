import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, AppState, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";

const BG = "#1C1612";
const CARD = "#252018";
const GOLD = "#F5C842";
const SAGE = "#8B9E6E";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

export default function ConfirmEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [checking, setChecking] = useState(false);
  const [resent, setResent] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for session every 3 seconds (user confirmed email in browser)
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace("/(onboarding)/step1");
        }
      } catch {}
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Also check when app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace("/(onboarding)/step1");
        }
      }
    });
    return () => sub.remove();
  }, []);

  async function handleResend() {
    if (!email) return;
    setChecking(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not resend email.");
    } finally {
      setChecking(false);
    }
  }

  async function handleCheckNow() {
    setChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        router.replace("/(onboarding)/step1");
      } else {
        Alert.alert("Not yet", "Your email hasn't been confirmed yet. Check your inbox and click the link.");
      }
    } catch {} finally { setChecking(false); }
  }

  return (
    <View style={s.container}>
      <View style={s.content}>
        {/* Icon */}
        <View style={s.iconWrap}>
          <Ionicons name="mail-outline" size={40} color={GOLD} />
        </View>

        <Text style={s.title}>Check your email</Text>
        <Text style={s.subtitle}>
          We've sent a confirmation link to
        </Text>
        <Text style={s.email}>{email ?? "your email"}</Text>
        <Text style={s.body}>
          Click the link in the email to verify your account. This page will update automatically once confirmed.
        </Text>

        {/* Info card */}
        <View style={s.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={GOLD} />
          <Text style={s.infoText}>
            The email is sent by Supabase (noreply@mail.app.supabase.io). Check your spam folder if you don't see it.
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={handleCheckNow}
          disabled={checking}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnText}>{checking ? "Checking..." : "I've confirmed my email"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryBtn}
          onPress={handleResend}
          disabled={checking || resent}
          activeOpacity={0.7}
        >
          <Text style={s.secondaryBtnText}>
            {resent ? "Email resent" : "Resend confirmation email"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 8 }}
          onPress={() => router.replace("/(auth)/sign-in")}
          activeOpacity={0.7}
        >
          <Text style={s.backText}>Back to sign in</Text>
        </TouchableOpacity>
      </View>

      {/* Pulsing dot indicator */}
      <View style={s.footer}>
        <View style={s.pulseWrap}>
          <View style={s.pulseDot} />
        </View>
        <Text style={s.footerText}>Waiting for confirmation...</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, justifyContent: "space-between" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },

  iconWrap: {
    width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(245,200,66,0.1)", borderWidth: 1, borderColor: "rgba(245,200,66,0.2)",
    marginBottom: 24,
  },

  title: { fontSize: 26, fontWeight: "800", color: TEXT_C, marginBottom: 8 },
  subtitle: { fontSize: 15, color: MUTED, textAlign: "center" },
  email: { fontSize: 15, fontWeight: "700", color: GOLD, marginTop: 4, marginBottom: 12 },
  body: { fontSize: 14, color: MUTED, textAlign: "center", lineHeight: 21, marginBottom: 20 },

  infoCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "rgba(245,200,66,0.06)", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(245,200,66,0.12)",
    padding: 14, marginBottom: 24, width: "100%",
  },
  infoText: { fontSize: 13, color: MUTED, flex: 1, lineHeight: 19 },

  primaryBtn: {
    backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", width: "100%",
  },
  primaryBtnText: { color: BG, fontWeight: "800", fontSize: 16 },

  secondaryBtn: { paddingVertical: 12 },
  secondaryBtnText: { fontSize: 14, fontWeight: "600", color: MUTED },

  backText: { fontSize: 14, color: DIM },

  footer: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingBottom: 40,
  },
  pulseWrap: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(139,158,110,0.3)", alignItems: "center", justifyContent: "center" },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: SAGE },
  footerText: { fontSize: 13, color: DIM },
});
