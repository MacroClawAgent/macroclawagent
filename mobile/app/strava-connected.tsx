import { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

/**
 * jonno://strava-connected
 * Opened when the Strava OAuth callback redirects back to the app.
 * Triggers a background activity sync, then navigates to home.
 */
export default function StravaConnectedScreen() {
  const { refreshProfile } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        await apiPost("/api/strava/sync", {});
      } catch {
        // Best-effort — tokens already saved server-side
      }

      // Re-fetch user profile so strava_athlete_id updates in context
      await refreshProfile();

      router.replace("/(tabs)/home");
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FC4C02" />
      <Text style={styles.label}>Connecting Strava...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  label: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
});
