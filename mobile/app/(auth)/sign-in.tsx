import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert("Sign in failed", error);
    } else {
      router.replace("/");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoDot} />
          <Text style={styles.logoText}>Jonno</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue fuelling your training.</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="rgba(245,245,247,0.35)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="rgba(245,245,247,0.35)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 32 },
  logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#D4FF00" },
  logoText: { fontSize: 20, fontWeight: "800", color: "#F5F5F7" },
  title: { fontSize: 30, fontWeight: "800", color: "#F5F5F7", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "rgba(245,245,247,0.55)", marginBottom: 32, lineHeight: 22 },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: "rgba(245,245,247,0.55)", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#F5F5F7",
  },
  button: {
    backgroundColor: "#D4FF00", borderRadius: 14, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#0B0B0B", fontWeight: "800", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "rgba(245,245,247,0.55)", fontSize: 14 },
  footerLink: { color: "#D4FF00", fontWeight: "700", fontSize: 14 },
});
