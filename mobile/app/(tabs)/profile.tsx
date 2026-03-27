import React from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const TEAL   = "#2BB6A6";
const TEAL2  = "rgba(43,182,166,0.12)";
const BG     = "#F4F5F7";
const WHITE  = "#FFFFFF";
const BORDER = "#E5E7EB";

const MENU_ITEMS = [
  { key: "personal",     label: "My Profile",   sub: "Name, weight, height & body metrics",       emoji: "👤", bg: "rgba(43,182,166,0.12)",  route: "/profile/personal"      },
  { key: "personalise",  label: "Personalise",  sub: "Goals, diet type, allergies & preferences", emoji: "🎯", bg: "rgba(99,102,241,0.10)",  route: "/profile/personalise"   },
  { key: "integrations", label: "Integrations", sub: "Strava, Apple Health & more",               emoji: "🔗", bg: "rgba(249,115,22,0.10)",  route: "/profile/integrations"  },
  { key: "settings",     label: "Settings",     sub: "Units, notifications & preferences",        emoji: "⚙️", bg: "rgba(107,114,128,0.10)", route: "/profile/settings-page" },
];

const LEGAL_ITEMS = [
  { key: "terms",   label: "Terms & Conditions", route: "/profile/terms"   },
  { key: "privacy", label: "Privacy Policy",      route: "/profile/privacy" },
];

export default function ProfileScreen() {
  const { userProfile, session } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const name     = userProfile?.full_name ?? "Athlete";
  const email    = session?.user?.email ?? userProfile?.email ?? "";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const goalLabel: Record<string, string> = {
    lose_weight: "Lose Weight 🔥", build_muscle: "Build Muscle 💪",
    performance: "Performance ⚡",  maintain: "Stay Healthy 🌿",
  };

  const accentColors = isDark
    ? ["#E8E0D0", "#E07B54", "#F5C842", "#8B9E6E"]
    : ["#1C1C1E", "#1C1C1E", "#1C1C1E", "#1C1C1E"];

  return (
    <SafeAreaView style={[s.safe, isDark && { backgroundColor: "#0D0A07" }]} edges={["top"]}>
      <View style={s.pageHeader}>
        <Text style={[s.pageTitle, isDark && { color: "#E8E0D0" }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Avatar hero ── */}
        <View style={[s.hero, isDark && { backgroundColor: "#1C1410", borderColor: "rgba(255,220,150,0.12)" }]}>
          <View style={[s.avatarRing, isDark && { borderColor: "#F5C842" }]}>
            <View style={[s.avatar, isDark && { backgroundColor: "#F5C842" }]}>
              <Text style={[s.avatarText, isDark && { color: "#1C1410" }]}>{initials}</Text>
            </View>
          </View>
          <View style={s.heroInfo}>
            <Text style={[s.heroName, isDark && { color: "#E8E0D0" }]}>{name}</Text>
            <Text style={[s.heroEmail, isDark && { color: "rgba(232,224,208,0.4)" }]}>{email}</Text>
            {userProfile?.fitness_goal && (
              <View style={[s.goalPill, isDark && { backgroundColor: "rgba(245,200,66,0.10)" }]}>
                <Text style={[s.goalPillText, isDark && { color: "#F5C842" }]}>
                  {goalLabel[userProfile.fitness_goal] ?? userProfile.fitness_goal}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Quick stats ── */}
        <View style={s.statsRow}>
          {[
            { label: "Calories", value: String(userProfile?.calorie_goal ?? 2000), unit: "kcal" },
            { label: "Protein",  value: String(userProfile?.protein_goal ?? 120),  unit: "g" },
            { label: "Carbs",    value: String(userProfile?.carbs_goal ?? 250),    unit: "g" },
            { label: "Fat",      value: String(userProfile?.fat_goal ?? 70),       unit: "g" },
          ].map((item, i) => (
            <View key={item.label} style={[s.statCard, isDark && { backgroundColor: "#1C1410", borderColor: "rgba(255,220,150,0.12)" }]}>
              <Text style={[s.statValue, { color: accentColors[i] }]}>
                {item.value}<Text style={[s.statUnit, isDark && { color: "rgba(232,224,208,0.4)" }]}>{item.unit}</Text>
              </Text>
              <Text style={[s.statLabel, isDark && { color: "rgba(232,224,208,0.4)" }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Appearance ── */}
        <Text style={[s.sectionLabel, isDark && { color: "rgba(232,224,208,0.4)" }]}>Appearance</Text>
        <View style={[s.menuCard, isDark && { backgroundColor: "#1C1410", borderColor: "rgba(255,220,150,0.12)" }]}>
          <View style={s.menuRow}>
            <View style={[s.menuIcon, { backgroundColor: isDark ? "rgba(245,200,66,0.12)" : "rgba(245,200,66,0.10)" }]}>
              <Text style={s.menuEmoji}>{isDark ? "🌙" : "☀️"}</Text>
            </View>
            <View style={s.menuMid}>
              <Text style={[s.menuLabel, isDark && { color: "#E8E0D0" }]}>Dark Mode</Text>
              <Text style={[s.menuSub, isDark && { color: "rgba(232,224,208,0.4)" }]}>{isDark ? "Warm dark theme" : "Light theme"}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#E5E7EB", true: "rgba(245,200,66,0.35)" }}
              thumbColor={isDark ? "#F5C842" : "#FFFFFF"}
            />
          </View>
        </View>

        {/* ── Account menu ── */}
        <Text style={[s.sectionLabel, isDark && { color: "rgba(232,224,208,0.4)" }]}>Account</Text>
        <View style={[s.menuCard, isDark && { backgroundColor: "#1C1410", borderColor: "rgba(255,220,150,0.12)" }]}>
          {MENU_ITEMS.map((item, i) => (
            <React.Fragment key={item.key}>
              {i > 0 && <View style={[s.divider, isDark && { backgroundColor: "rgba(255,220,150,0.06)" }]} />}
              <TouchableOpacity
                style={s.menuRow}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[s.menuIcon, { backgroundColor: item.bg }]}>
                  <Text style={s.menuEmoji}>{item.emoji}</Text>
                </View>
                <View style={s.menuMid}>
                  <Text style={[s.menuLabel, isDark && { color: "#E8E0D0" }]}>{item.label}</Text>
                  <Text style={[s.menuSub, isDark && { color: "rgba(232,224,208,0.4)" }]}>{item.sub}</Text>
                </View>
                <Text style={[s.chevron, isDark && { color: "rgba(232,224,208,0.25)" }]}>›</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* ── Legal ── */}
        <Text style={[s.sectionLabel, isDark && { color: "rgba(232,224,208,0.4)" }]}>Legal</Text>
        <View style={[s.menuCard, isDark && { backgroundColor: "#1C1410", borderColor: "rgba(255,220,150,0.12)" }]}>
          {LEGAL_ITEMS.map((item, i) => (
            <React.Fragment key={item.key}>
              {i > 0 && <View style={[s.divider, isDark && { backgroundColor: "rgba(255,220,150,0.06)" }]} />}
              <TouchableOpacity
                style={s.menuRow}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={s.menuMid}>
                  <Text style={[s.menuLabel, isDark && { color: "#E8E0D0" }]}>{item.label}</Text>
                </View>
                <Text style={[s.chevron, isDark && { color: "rgba(232,224,208,0.25)" }]}>›</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <Text style={[s.version, isDark && { color: "rgba(232,224,208,0.2)" }]}>MacroClaw v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: BG },
  pageHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  pageTitle:  { fontSize: 28, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.5 },
  content:    { padding: 16, gap: 10, paddingBottom: 60 },

  hero: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: WHITE, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: BORDER,
  },
  avatarRing: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2.5, borderColor: TEAL,
    justifyContent: "center", alignItems: "center",
  },
  avatar:     { width: 63, height: 63, borderRadius: 32, backgroundColor: TEAL, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 24, fontWeight: "900", color: WHITE },
  heroInfo:   { flex: 1, gap: 2 },
  heroName:   { fontSize: 18, fontWeight: "800", color: "#1C1C1E" },
  heroEmail:  { fontSize: 12, color: "#9CA3AF" },
  goalPill:   { marginTop: 4, alignSelf: "flex-start", backgroundColor: TEAL2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  goalPillText:{ fontSize: 12, fontWeight: "700", color: TEAL },

  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1, backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    paddingVertical: 12, alignItems: "center", gap: 2,
  },
  statValue: { fontSize: 15, fontWeight: "800", color: "#1C1C1E", letterSpacing: -0.3 },
  statUnit:  { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },
  statLabel: { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#9CA3AF",
    textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginTop: 4,
  },

  menuCard:  { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  menuRow:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuEmoji: { fontSize: 18 },
  menuMid:   { flex: 1, gap: 1 },
  menuLabel: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  menuSub:   { fontSize: 12, color: "#9CA3AF" },
  chevron:   { fontSize: 22, color: "#C4C4C4", fontWeight: "300" },
  divider:   { height: 1, backgroundColor: BG, marginHorizontal: 16 },

  version: { textAlign: "center", fontSize: 11, color: "#C4C4C4", marginTop: 8 },
});
