import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

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
            <Text style={styles.stravaHint}>Connect Strava at jonnoai.com to sync your training data.</Text>
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
  safe: { flex: 1, backgroundColor: "#F4F5F7" },
  content: { padding: 20, gap: 20, paddingBottom: 48 },
  avatarSection: { alignItems: "center", gap: 8, paddingVertical: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#20C7B7", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  name: { fontSize: 20, fontWeight: "800", color: "#1C1C1E" },
  email: { fontSize: 13, color: "#6B7280" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, paddingLeft: 4 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  infoLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  infoValue: { fontSize: 14, color: "#1C1C1E", fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F4F5F7", marginHorizontal: 16 },
  integrationLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  integrationIcon: { fontSize: 18 },
  badge: { fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeConnected: { backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981" },
  badgeOff: { backgroundColor: "#F4F5F7", color: "#9CA3AF" },
  stravaHint: { fontSize: 11, color: "#9CA3AF", paddingHorizontal: 4, lineHeight: 16 },
  signOutButton: {
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 16,
    alignItems: "center", borderWidth: 1, borderColor: "#FCA5A5", marginTop: 8,
  },
  signOutText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
});
