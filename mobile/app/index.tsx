import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthGate() {
  const { session, userProfile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace("/(auth)/sign-in");
    } else if (!userProfile?.profile_complete) {
      router.replace("/(onboarding)/step1");
    } else {
      router.replace("/(tabs)/home");
    }
  }, [loading, session, userProfile]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#20C7B7" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F5F7" },
});
