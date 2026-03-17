import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const TABS = ["Profile", "Goals", "Integrations", "Settings"] as const;
type Tab = typeof TABS[number];

const GOAL_OPTIONS = [
  { key: "lose_weight",  label: "Lose Weight",  emoji: "🔥" },
  { key: "build_muscle", label: "Build Muscle",  emoji: "💪" },
  { key: "performance",  label: "Performance",   emoji: "⚡" },
  { key: "maintain",     label: "Stay Healthy",  emoji: "❤️" },
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={s.sectionLabel}>{title}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

function ProfileTab({ userProfile, email }: { userProfile: any; email: string }) {
  const initials = (userProfile?.full_name ?? "A").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <View style={s.profileHero}>
        <View style={s.bigAvatar}>
          <Text style={s.bigAvatarText}>{initials}</Text>
        </View>
        <Text style={s.heroName}>{userProfile?.full_name ?? "Athlete"}</Text>
        <Text style={s.heroEmail}>{email}</Text>
      </View>

      <SectionLabel title="Body Metrics" />
      <Card>
        <Row label="Weight" value={userProfile?.weight_kg ? `${userProfile.weight_kg} kg` : "Not set"} />
        <Divider />
        <Row label="Height" value={userProfile?.height_cm ? `${userProfile.height_cm} cm` : "Not set"} />
        <Divider />
        <Row label="Age" value={userProfile?.age ? `${userProfile.age} yrs` : "Not set"} />
      </Card>
    </ScrollView>
  );
}

function GoalsTab({ userProfile }: { userProfile: any }) {
  const activeGoal = userProfile?.fitness_goal ?? "maintain";
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <SectionLabel title="Fitness Goal" />
      <View style={s.goalGrid}>
        {GOAL_OPTIONS.map((opt) => {
          const active = activeGoal === opt.key;
          return (
            <View key={opt.key} style={[s.goalCard, active && s.goalCardActive]}>
              <Text style={s.goalEmoji}>{opt.emoji}</Text>
              <Text style={[s.goalLabel, active && s.goalLabelActive]}>{opt.label}</Text>
              {active && <View style={s.goalDot} />}
            </View>
          );
        })}
      </View>

      <SectionLabel title="Daily Targets" />
      <Card>
        <Row label="Calories" value={`${userProfile?.calorie_goal ?? 2000} kcal`} />
        <Divider />
        <Row label="Protein"  value={`${userProfile?.protein_goal ?? 120} g`} />
        <Divider />
        <Row label="Carbs"    value={`${userProfile?.carbs_goal ?? 250} g`} />
        <Divider />
        <Row label="Fat"      value={`${userProfile?.fat_goal ?? 70} g`} />
      </Card>
    </ScrollView>
  );
}

function IntegrationsTab({ userProfile }: { userProfile: any }) {
  const stravaConnected = !!userProfile?.strava_athlete_id;
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <SectionLabel title="Connected Services" />
      <Card>
        <View style={s.integrationRow}>
          <View style={s.integrationLeft}>
            <View style={[s.integrationIcon, { backgroundColor: "rgba(252,82,0,0.10)" }]}>
              <Text style={s.integrationEmoji}>🏃</Text>
            </View>
            <View>
              <Text style={s.integrationName}>Strava</Text>
              <Text style={s.integrationSub}>Sync training & activity data</Text>
            </View>
          </View>
          <View style={[s.badge, stravaConnected ? s.badgeOn : s.badgeOff]}>
            <Text style={[s.badgeText, stravaConnected ? s.badgeTextOn : s.badgeTextOff]}>
              {stravaConnected ? "Connected" : "Not connected"}
            </Text>
          </View>
        </View>
      </Card>
      {!stravaConnected && (
        <TouchableOpacity onPress={() => Linking.openURL("https://jonnoai.com")} activeOpacity={0.7}>
          <Text style={s.connectHint}>Connect Strava at jonnoai.com →</Text>
        </TouchableOpacity>
      )}

      <SectionLabel title="Coming Soon" />
      <Card>
        <View style={s.integrationRow}>
          <View style={s.integrationLeft}>
            <View style={[s.integrationIcon, { backgroundColor: "rgba(255,59,48,0.10)" }]}>
              <Text style={s.integrationEmoji}>❤️</Text>
            </View>
            <View>
              <Text style={s.integrationName}>Apple Health</Text>
              <Text style={s.integrationSub}>Steps, heart rate & sleep</Text>
            </View>
          </View>
          <View style={s.badgeOff}>
            <Text style={s.badgeTextOff}>Soon</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

function SettingsTab({ onSignOut }: { onSignOut: () => void }) {
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <SectionLabel title="Legal" />
      <Card>
        <TouchableOpacity style={s.row} onPress={() => Linking.openURL("https://jonnoai.com/terms")} activeOpacity={0.7}>
          <Text style={s.rowLabel}>Terms of Service</Text>
          <Text style={s.rowChevron}>›</Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={s.row} onPress={() => Linking.openURL("https://jonnoai.com/privacy")} activeOpacity={0.7}>
          <Text style={s.rowLabel}>Privacy Policy</Text>
          <Text style={s.rowChevron}>›</Text>
        </TouchableOpacity>
      </Card>

      <SectionLabel title="App" />
      <Card>
        <Row label="Version" value="1.0.0" />
      </Card>

      <TouchableOpacity style={s.signOutBtn} onPress={onSignOut} activeOpacity={0.85}>
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const { userProfile, signOut, session } = useAuth();

  const name  = userProfile?.full_name ?? "Athlete";
  const email = session?.user?.email ?? userProfile?.email ?? "";

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Page title */}
      <View style={s.pageHeader}>
        <Text style={s.pageTitle}>Profile</Text>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
            style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
          >
            <Text style={[s.tabBtnText, activeTab === tab && s.tabBtnTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === "Profile"      && <ProfileTab userProfile={userProfile} email={email} />}
      {activeTab === "Goals"        && <GoalsTab userProfile={userProfile} />}
      {activeTab === "Integrations" && <IntegrationsTab userProfile={userProfile} />}
      {activeTab === "Settings"     && <SettingsTab onSignOut={handleSignOut} />}
    </SafeAreaView>
  );
}

const TEAL = "#20C7B7";
const BORDER = "#E5E7EB";
const BG = "#F4F5F7";

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  pageHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.5 },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
  },
  tabBtnActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  tabBtnText: { fontSize: 11, fontWeight: "700", color: "#6B7280", letterSpacing: 0.1 },
  tabBtnTextActive: { color: "#FFFFFF" },

  // Tab content
  tabContent: { padding: 16, gap: 10, paddingBottom: 48 },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginTop: 6 },

  // Card
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },

  // Row
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  rowValue: { fontSize: 14, color: "#1C1C1E", fontWeight: "700" },
  rowChevron: { fontSize: 20, color: "#C4C4C4", fontWeight: "300" },
  divider: { height: 1, backgroundColor: BG, marginHorizontal: 16 },

  // Profile hero
  profileHero: { alignItems: "center", gap: 6, paddingVertical: 16 },
  bigAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: TEAL, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  bigAvatarText: { fontSize: 30, fontWeight: "900", color: "#FFF" },
  heroName: { fontSize: 22, fontWeight: "800", color: "#1C1C1E" },
  heroEmail: { fontSize: 13, color: "#9CA3AF" },

  // Goal grid
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  goalCard: {
    width: "47%", backgroundColor: "#FFFFFF", borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, padding: 16,
    alignItems: "center", gap: 6,
  },
  goalCardActive: { borderColor: TEAL, backgroundColor: "rgba(32,199,183,0.06)" },
  goalEmoji: { fontSize: 26 },
  goalLabel: { fontSize: 13, fontWeight: "700", color: "#6B7280", textAlign: "center" },
  goalLabelActive: { color: TEAL },
  goalDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },

  // Integrations
  integrationRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  integrationLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  integrationIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  integrationEmoji: { fontSize: 18 },
  integrationName: { fontSize: 14, fontWeight: "700", color: "#1C1C1E" },
  integrationSub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeOn: { backgroundColor: "rgba(16,185,129,0.12)" },
  badgeOff: { backgroundColor: BG, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  badgeTextOn: { color: "#10B981" },
  badgeTextOff: { color: "#9CA3AF" },
  connectHint: { fontSize: 12, color: TEAL, fontWeight: "600", paddingLeft: 4, marginTop: 2 },

  // Settings
  signOutBtn: {
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 16,
    alignItems: "center", borderWidth: 1, borderColor: "#FCA5A5", marginTop: 12,
  },
  signOutText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
});
