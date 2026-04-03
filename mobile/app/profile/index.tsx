import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const TEAL   = "#F5C842";
const TEAL2  = "rgba(245,200,66,0.10)";
const BG     = "#0D0A07";
const WHITE  = "#1C1410";
const BORDER = "rgba(255,220,150,0.12)";

const MENU_ITEMS = [
  {
    key: "personal",
    label: "My Profile",
    sub: "Name, weight, height & body metrics",
    icon: "person-outline" as const,
    iconColor: "#8B9E6E",
    bg: "rgba(139,158,110,0.12)",
    route: "/profile/personal",
  },
  {
    key: "personalise",
    label: "Personalise",
    sub: "Goals, diet type, allergies & preferences",
    icon: "options-outline" as const,
    iconColor: "#F5C842",
    bg: "rgba(245,200,66,0.10)",
    route: "/profile/personalise",
  },
  {
    key: "integrations",
    label: "Integrations",
    sub: "Strava, Apple Health & more",
    icon: "link-outline" as const,
    iconColor: "#E07B54",
    bg: "rgba(224,123,84,0.10)",
    route: "/profile/integrations",
  },
  {
    key: "community",
    label: "Community Profile",
    sub: "Username, bio & privacy settings",
    icon: "people-outline" as const,
    iconColor: "#8B9E6E",
    bg: "rgba(139,158,110,0.10)",
    route: "/profile/community-profile",
  },
  {
    key: "settings",
    label: "Settings",
    sub: "Units, notifications & preferences",
    icon: "settings-outline" as const,
    iconColor: "#E8E0D0",
    bg: "rgba(232,224,208,0.08)",
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

  const GOAL_ICONS: Record<string, { icon: string; color: string }> = {
    lose_weight: { icon: 'flame-outline', color: '#E07B54' },
    build_muscle: { icon: 'barbell-outline', color: '#F5C842' },
    performance: { icon: 'flash-outline', color: '#F5C842' },
    maintain: { icon: 'leaf-outline', color: '#8B9E6E' },
  };
  const goal = userProfile?.fitness_goal ?? "maintain";
  const goalIcon = GOAL_ICONS[goal] ?? GOAL_ICONS.maintain;

  // Badges: goal, activity source, nutrition
  const badges = [
    { icon: goalIcon.icon, color: goalIcon.color,                                          pos: { bottom: -5, right: -5 } },
    { icon: userProfile?.strava_athlete_id ? 'walk-outline' : 'nutrition-outline', color: '#8B9E6E', pos: { top: -5, right: -5 } },
    { icon: 'stats-chart-outline', color: '#F5C842',                                       pos: { top: -5, left: -5 } },
  ];

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#E8E0D0" />
        </TouchableOpacity>
        <Text style={s.pageTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Avatar hero */}
        <View style={s.hero}>
          {/* Avatar with gradient ring + floating badges */}
          <View style={s.avatarWrap}>
            <View style={s.avatarRing}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
            </View>
            {badges.map((b, i) => (
              <View key={i} style={[s.badge, b.pos as any]}>
                <Ionicons name={b.icon as any} size={13} color={b.color} />
              </View>
            ))}
          </View>

          <View style={s.heroInfo}>
            <Text style={s.heroName}>{name}</Text>
            <Text style={s.heroEmail}>{email}</Text>
            {userProfile?.fitness_goal && (
              <View style={s.goalPill}>
                <Text style={s.goalPillText}>
                  {goalLabel[goal]}
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
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
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
  pageTitle:  { fontSize: 28, fontWeight: "900", color: "#E8E0D0", letterSpacing: -0.5 },
  content: { padding: 16, gap: 10, paddingBottom: 60 },

  hero: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: WHITE, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: BORDER,
  },
  avatarWrap: { width: 88, height: 88, position: "relative" },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "rgba(255,220,150,0.06)",
    borderWidth: 3, borderColor: "#F5C842",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#F5C842", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatar:     { width: 78, height: 78, borderRadius: 39, backgroundColor: "#F5C842", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 26, fontWeight: "900", color: "#1C1410" },
  badge: {
    position: "absolute", width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#252018",
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "rgba(255,220,150,0.2)",
    shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  heroInfo:   { flex: 1, gap: 2 },
  heroName:   { fontSize: 18, fontWeight: "800", color: "#E8E0D0" },
  heroEmail:  { fontSize: 12, color: "rgba(232,224,208,0.4)" },
  goalPill: {
    marginTop: 6, alignSelf: "flex-start",
    backgroundColor: TEAL2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  goalPillText: { fontSize: 13, fontWeight: "700", color: TEAL },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "rgba(232,224,208,0.4)",
    textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginTop: 4,
  },

  menuCard: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  menuRow:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuMid:  { flex: 1, gap: 1 },
  menuLabel:{ fontSize: 15, fontWeight: "700", color: "#E8E0D0" },
  menuSub:  { fontSize: 12, color: "rgba(232,224,208,0.4)" },
  chevron:  { fontSize: 22, color: "rgba(232,224,208,0.25)", fontWeight: "300" },
  divider:  { height: 1, backgroundColor: "rgba(255,220,150,0.06)", marginHorizontal: 16 },

  version: { textAlign: "center", fontSize: 11, color: "rgba(232,224,208,0.2)", marginTop: 8 },
});
