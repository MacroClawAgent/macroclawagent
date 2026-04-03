import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const BG = "#1C1612";
const CARD = "#252018";
const GOLD = "#F5C842";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

const BASE_URL: string = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://jonnoai.com");

export default function EmailSignInScreen() {
  const { signIn } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSignIn() {
    if (!emailOrUsername || !password) { Alert.alert("Required", "Please enter your email and password."); return; }
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
      <View style={s.inner}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={TEXT_C} />
        </TouchableOpacity>

        <Text style={s.title}>Sign in</Text>
        <Text style={s.subtitle}>Welcome back — enter your email and password.</Text>

        <View style={s.form}>
          <TextInput
            style={s.input}
            placeholder="Email or username"
            placeholderTextColor={DIM}
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            autoFocus
          />
          <View style={s.pwWrap}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={DIM}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
              <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={20} color={DIM} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color={BG} /> : <Text style={s.submitTxt}>Sign In</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  backBtn: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "900", color: TEXT_C, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: MUTED, lineHeight: 22, marginTop: 8, marginBottom: 28 },
  form: { gap: 14 },
  input: {
    backgroundColor: "rgba(232,224,208,0.06)", borderWidth: 1, borderColor: "rgba(232,224,208,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: TEXT_C,
  },
  pwWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 8 },
  submitBtn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  submitTxt: { color: BG, fontWeight: "800", fontSize: 16 },
});
