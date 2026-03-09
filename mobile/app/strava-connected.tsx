import { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { apiPost } from "@/lib/api";
import { supabase } from "@/lib/supabase";

/**
 * jonno://strava-connected
 * Opened when the Strava OAuth callback redirects back to the app.
 * Triggers a background activity sync, then navigates to the profile tab.
 */
export default function StravaConnectedScreen() {
  useEffect(() => {
    (async () => {
      try {
        // Sync latest activities in background (non-fatal if it fails)
        await apiPost("/api/strava/sync", {});
      } catch {
        // Best-effort — token was already saved server-side
      }

      try {
        // Refresh local session so strava_athlete_id is visible in profile
        await supabase.auth.refreshSession();
      } catch {
        // Non-fatal
      }

      router.replace("/(tabs)/profile");
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
