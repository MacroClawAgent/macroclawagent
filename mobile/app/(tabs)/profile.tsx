import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/lib/api";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { userProfile, signOut, session } = useAuth();
  const [connectingStrava, setConnectingStrava] = useState(false);

  async function handleConnectStrava() {
    try {
      setConnectingStrava(true);
      const { url } = await apiGet<{ url: string }>("/api/strava/mobile-init");
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert("Error", "Could not start Strava connection. Please try again.");
    } finally {
      setConnectingStrava(false);
    }
  }

  async function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }

  const name = userProfile?.full_name ?? "Athlete";
  const email = session?.user?.email ?? userProfile?.email ?? "";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]?.toUpperCase() ?? "A"}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Targets</Text>
          <View style={styles.card}>
            <InfoRow label="Calories" value={`${userProfile?.calorie_goal ?? 2000} kcal`} />
            <View style={styles.divider} />
            <InfoRow label="Protein" value={`${userProfile?.protein_goal ?? 120} g`} />
            <View style={styles.divider} />
            <InfoRow label="Carbs" value={`${userProfile?.carbs_goal ?? 250} g`} />
            <View style={styles.divider} />
            <InfoRow label="Fat" value={`${userProfile?.fat_goal ?? 70} g`} />
          </View>
        </View>

        {/* Body */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Metrics</Text>
          <View style={styles.card}>
            <InfoRow
              label="Weight"
              value={userProfile?.weight_kg ? `${userProfile.weight_kg} kg` : "Not set"}
            />
            <View style={styles.divider} />
            <InfoRow
              label="Height"
              value={userProfile?.height_cm ? `${userProfile.height_cm} cm` : "Not set"}
            />
          </View>
        </View>

        {/* Integrations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integrations</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.integrationLeft}>
                <Text style={styles.integrationIcon}>🏃</Text>
                <Text style={styles.infoLabel}>Strava</Text>
              </View>
              <Text style={[styles.badge, userProfile?.strava_athlete_id ? styles.badgeConnected : styles.badgeOff]}>
                {userProfile?.strava_athlete_id ? "Connected" : "Not connected"}
              </Text>
            </View>
          </View>
          {!userProfile?.strava_athlete_id && (
            <TouchableOpacity
              style={styles.stravaButton}
              onPress={handleConnectStrava}
              disabled={connectingStrava}
              activeOpacity={0.8}
            >
              {connectingStrava ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.stravaButtonText}>Connect Strava</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0B0B" },
  content: { padding: 20, gap: 20, paddingBottom: 48 },
  avatarSection: { alignItems: "center", gap: 8, paddingVertical: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#D4FF00", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#0B0B0B" },
  name: { fontSize: 20, fontWeight: "800", color: "#F5F5F7" },
  email: { fontSize: 13, color: "rgba(245,245,247,0.55)" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "rgba(245,245,247,0.55)", textTransform: "uppercase", letterSpacing: 0.5, paddingLeft: 4 },
  card: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  infoLabel: { fontSize: 14, color: "rgba(245,245,247,0.55)", fontWeight: "500" },
  infoValue: { fontSize: 14, color: "#F5F5F7", fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#0B0B0B", marginHorizontal: 16 },
  integrationLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  integrationIcon: { fontSize: 18 },
  badge: { fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeConnected: { backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981" },
  badgeOff: { backgroundColor: "#0B0B0B", color: "rgba(245,245,247,0.35)" },
  stravaButton: {
    backgroundColor: "#FC4C02",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  stravaButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  signOutButton: {
    backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 14, paddingVertical: 16,
    alignItems: "center", borderWidth: 1, borderColor: "#FCA5A5", marginTop: 8,
  },
  signOutText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
});
