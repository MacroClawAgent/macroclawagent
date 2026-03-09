import { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiGet, apiDelete } from "@/lib/api";
import { AppColors } from "@/theme/colors";

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 20, paddingBottom: 48 },
    avatarSection: { alignItems: "center", gap: 8, paddingVertical: 12 },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: c.primary, justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 28, fontWeight: "800", color: c.primaryText },
    name: { fontSize: 20, fontWeight: "800", color: c.text },
    email: { fontSize: 13, color: c.muted },
    section: { gap: 8 },
    sectionTitle: { fontSize: 12, fontWeight: "700", color: c.muted, textTransform: "uppercase", letterSpacing: 0.5, paddingLeft: 4 },
    card: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
    rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    rowLabel: { fontSize: 14, color: c.muted, fontWeight: "500" },
    rowValue: { fontSize: 14, color: c.text, fontWeight: "700" },
    divider: { height: 1, backgroundColor: c.bg, marginHorizontal: 16 },
    badgeConnected: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981", overflow: "hidden" },
    stravaConnectCard: {
      backgroundColor: "#FC4C02", borderRadius: 18, padding: 18,
      flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12,
    },
    stravaLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
    stravaIcon: { fontSize: 28 },
    stravaTitle: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
    stravaSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2, lineHeight: 16 },
    stravaArrow: { fontSize: 20, color: "#FFFFFF", fontWeight: "700" },
    disconnectBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.12)" },
    disconnectText: { fontSize: 13, fontWeight: "700", color: "#EF4444" },
    signOutButton: {
      backgroundColor: c.card, borderRadius: 14, paddingVertical: 16,
      alignItems: "center", borderWidth: 1, borderColor: "#FCA5A5", marginTop: 8,
    },
    signOutText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
  });
}

export default function SettingsScreen() {
  const { userProfile, signOut, session, refreshProfile } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [connectingStrava, setConnectingStrava] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const name = userProfile?.full_name ?? "Athlete";
  const email = session?.user?.email ?? userProfile?.email ?? "";
  const isStravaConnected = !!userProfile?.strava_athlete_id;

  async function handleConnectStrava() {
    try {
      setConnectingStrava(true);
      const { url } = await apiGet<{ url: string }>("/api/strava/mobile-init");
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Could not start Strava connection. Please try again.");
    } finally {
      setConnectingStrava(false);
    }
  }

  async function handleDisconnectStrava() {
    Alert.alert(
      "Disconnect Strava",
      "Your training data will no longer sync. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              setDisconnecting(true);
              await apiDelete("/api/strava/disconnect");
              await refreshProfile();
            } catch {
              Alert.alert("Error", "Could not disconnect Strava. Please try again.");
            } finally {
              setDisconnecting(false);
            }
          },
        },
      ]
    );
  }

  async function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }

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

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text>{isDark ? "🌙" : "☀️"}</Text>
                <Text style={styles.rowLabel}>{isDark ? "Dark mode" : "Light mode"}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: "#E5E7EB", true: colors.primary }}
                thumbColor={isDark ? colors.primaryText : "#FFFFFF"}
              />
            </View>
          </View>
        </View>

        {/* Integrations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integrations</Text>
          {!isStravaConnected ? (
            <TouchableOpacity
              style={styles.stravaConnectCard}
              onPress={handleConnectStrava}
              disabled={connectingStrava}
              activeOpacity={0.85}
            >
              <View style={styles.stravaLeft}>
                <Text style={styles.stravaIcon}>🏃</Text>
                <View>
                  <Text style={styles.stravaTitle}>Connect Strava</Text>
                  <Text style={styles.stravaSub}>Sync your training data to personalise your nutrition</Text>
                </View>
              </View>
              {connectingStrava
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Text style={styles.stravaArrow}>→</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={{ fontSize: 20 }}>🏃</Text>
                  <View>
                    <Text style={styles.rowValue}>Strava</Text>
                    <Text style={styles.badgeConnected}>Connected</Text>
                  </View>
                </View>
                {disconnecting
                  ? <ActivityIndicator size="small" color="#EF4444" />
                  : (
                    <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnectStrava}>
                      <Text style={styles.disconnectText}>Disconnect</Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>
          )}
        </View>

        {/* Daily Targets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Targets</Text>
          <View style={styles.card}>
            {[
              { label: "Calories", value: `${userProfile?.calorie_goal ?? 2000} kcal` },
              { label: "Protein",  value: `${userProfile?.protein_goal ?? 120} g` },
              { label: "Carbs",    value: `${userProfile?.carbs_goal ?? 250} g` },
              { label: "Fat",      value: `${userProfile?.fat_goal ?? 70} g` },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowValue}>{item.value}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Body Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Metrics</Text>
          <View style={styles.card}>
            {[
              { label: "Weight", value: userProfile?.weight_kg ? `${userProfile.weight_kg} kg` : "Not set" },
              { label: "Height", value: userProfile?.height_cm ? `${userProfile.height_cm} cm` : "Not set" },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowValue}>{item.value}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
