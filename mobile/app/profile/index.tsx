import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const TEAL   = "#2BB6A6";
const TEAL2  = "rgba(43,182,166,0.12)";
const BG     = "#F4F5F7";
const WHITE  = "#FFFFFF";
const BORDER = "#E5E7EB";

const MENU_ITEMS = [
  {
    key: "personal",
    label: "My Profile",
    sub: "Name, weight, height & body metrics",
    emoji: "👤",
    bg: "rgba(43,182,166,0.12)",
    route: "/profile/personal",
  },
  {
    key: "personalise",
    label: "Personalise",
    sub: "Goals, diet type, allergies & preferences",
    emoji: "🎯",
    bg: "rgba(99,102,241,0.10)",
    route: "/profile/personalise",
  },
  {
    key: "integrations",
    label: "Integrations",
    sub: "Strava, Apple Health & more",
    emoji: "🔗",
    bg: "rgba(249,115,22,0.10)",
    route: "/profile/integrations",
  },
  {
    key: "settings",
    label: "Settings",
    sub: "Units, notifications & preferences",
    emoji: "⚙️",
    bg: "rgba(107,114,128,0.10)",
    route: "/profile/settings-page",
  },
];

const LEGAL_ITEMS = [
  { key: "terms",   label: "Terms & Conditions", route: "/profile/terms" },
  { key: "privacy", label: "Privacy Policy",      route: "/profile/privacy" },
];

export default function ProfileScreen() {
  const { userProfile, session } = useAuth();
  const router = useRouter();

  const name     = userProfile?.full_name ?? "Athlete";
  const email    = session?.user?.email ?? userProfile?.email ?? "";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const goalLabel: Record<string, string> = {
    lose_weight: "Lose Weight", build_muscle: "Build Muscle",
    performance: "Performance",  maintain: "Stay Healthy",
  };

  const GOAL_META: Record<string, { emoji: string; colors: [string, string] }> = {
    lose_weight:  { emoji: "🔥", colors: ["#FB923C", "#EF4444"] },
    build_muscle: { emoji: "💪", colors: ["#C084FC", "#7C3AED"] },
    performance:  { emoji: "⚡", colors: ["#60A5FA", "#2563EB"] },
    maintain:     { emoji: "🌿", colors: ["#4ADE80", "#16A34A"] },
  };
  const goal     = userProfile?.fitness_goal ?? "maintain";
  const goalMeta = GOAL_META[goal] ?? { emoji: "🌿", colors: ["#34D399", "#2BB6A6"] as [string,string] };

  // Extra badges: activity, nutrition
  const badges = [
    { emoji: goalMeta.emoji,                         pos: { bottom: -4, right: -4 },  bg: goalMeta.colors[0] },
    { emoji: userProfile?.strava_athlete_id ? "🏃" : "🥗", pos: { top: -4, right: -4 },   bg: "#F4F5F7" },
    { emoji: "✦",                                    pos: { top: -4, left: -4 },   bg: "#2BB6A6" },
  ];

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.pageTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Avatar hero */}
        <View style={s.hero}>
          {/* Avatar with gradient ring + floating badges */}
          <View style={s.avatarWrap}>
            <LinearGradient
              colors={goalMeta.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.gradientRing}
            >
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
            </LinearGradient>
            {badges.map((b, i) => (
              <View key={i} style={[s.badge, { backgroundColor: b.bg }, b.pos as any]}>
                <Text style={s.badgeEmoji}>{b.emoji}</Text>
              </View>
            ))}
          </View>

          <View style={s.heroInfo}>
            <Text style={s.heroName}>{name}</Text>
            <Text style={s.heroEmail}>{email}</Text>
            {userProfile?.fitness_goal && (
              <View style={[s.goalPill, { backgroundColor: goalMeta.colors[0] + "22" }]}>
                <Text style={[s.goalPillText, { color: goalMeta.colors[1] }]}>
                  {goalMeta.emoji}  {goalLabel[goal]}
                </Text>
              </View>
            )}
          </View>
        </View>


        {/* Main menu */}
        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <React.Fragment key={item.key}>
              {i > 0 && <View style={s.divider} />}
              <TouchableOpacity
                style={s.menuRow}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[s.menuIcon, { backgroundColor: item.bg }]}>
                  <Text style={s.menuEmoji}>{item.emoji}</Text>
                </View>
                <View style={s.menuMid}>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <Text style={s.menuSub}>{item.sub}</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Legal */}
        <Text style={s.sectionLabel}>Legal</Text>
        <View style={s.menuCard}>
          {LEGAL_ITEMS.map((item, i) => (
            <React.Fragment key={item.key}>
              {i > 0 && <View style={s.divider} />}
              <TouchableOpacity
                style={s.menuRow}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={s.menuMid}>
                  <Text style={s.menuLabel}>{item.label}</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <Text style={s.version}>MacroClaw v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: BG },
  pageHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, gap: 10 },
  backBtn:  { padding: 4 },
  backArrow:{ fontSize: 24, color: "#1C1C1E", fontWeight: "400" },
  pageTitle:  { fontSize: 28, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.5 },
  content: { padding: 16, gap: 10, paddingBottom: 60 },

  hero: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: WHITE, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: BORDER,
  },
  avatarWrap:  { width: 84, height: 84, position: "relative" },
  gradientRing: {
    width: 84, height: 84, borderRadius: 42,
    padding: 3, justifyContent: "center", alignItems: "center",
  },
  avatar:     { width: 76, height: 76, borderRadius: 38, backgroundColor: WHITE, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 26, fontWeight: "900", color: "#1C1C1E" },
  badge: {
    position: "absolute", width: 26, height: 26, borderRadius: 13,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: WHITE,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  badgeEmoji: { fontSize: 12 },
  heroInfo:   { flex: 1, gap: 2 },
  heroName:   { fontSize: 18, fontWeight: "800", color: "#1C1C1E" },
  heroEmail:  { fontSize: 12, color: "#9CA3AF" },
  goalPill: {
    marginTop: 6, alignSelf: "flex-start",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  goalPillText: { fontSize: 13, fontWeight: "700" },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#9CA3AF",
    textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginTop: 4,
  },

  menuCard: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  menuRow:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuEmoji:{ fontSize: 18 },
  menuMid:  { flex: 1, gap: 1 },
  menuLabel:{ fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  menuSub:  { fontSize: 12, color: "#9CA3AF" },
  chevron:  { fontSize: 22, color: "#C4C4C4", fontWeight: "300" },
  divider:  { height: 1, backgroundColor: BG, marginHorizontal: 16 },

  version: { textAlign: "center", fontSize: 11, color: "#C4C4C4", marginTop: 8 },
});
