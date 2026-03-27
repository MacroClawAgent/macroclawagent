import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useCommunity } from "@/hooks/useCommunity";
import { deletePost, deletePostWithFoodLog } from "@/services/communityService";
import { getPostImage } from "@/data/communityMockData";

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
    key: "community",
    label: "Community Profile",
    sub: "Username, bio & privacy settings",
    emoji: "🌐",
    bg: "rgba(43,182,166,0.10)",
    route: "/profile/community-profile",
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
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { posts, currentUserId, loadPosts, removePost } = useCommunity();

  useEffect(() => { loadPosts(); }, []);

  const myPosts = posts.filter(p => p.userId === currentUserId);
  const totalLikes = myPosts.reduce((sum, p) => sum + p.likes, 0);

  const name     = userProfile?.full_name ?? "Athlete";
  const email    = session?.user?.email ?? userProfile?.email ?? "";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const goalLabel: Record<string, string> = {
    lose_weight: "Lose Weight", build_muscle: "Build Muscle",
    performance: "Performance",  maintain: "Stay Healthy",
  };

  const GOAL_EMOJI: Record<string, string> = {
    lose_weight: "🔥", build_muscle: "💪", performance: "⚡", maintain: "🌿",
  };
  const goal = userProfile?.fitness_goal ?? "maintain";

  // Badges: goal, activity source, nutrition
  const badges = [
    { emoji: GOAL_EMOJI[goal] ?? "🌿",                      pos: { bottom: -5, right: -5 } },
    { emoji: userProfile?.strava_athlete_id ? "🏃" : "🥗",  pos: { top: -5, right: -5 } },
    { emoji: "📊",                                           pos: { top: -5, left: -5 } },
  ];

  function handleDeletePost(post: typeof myPosts[0]) {
    const logDate = post.createdAt.split("T")[0];
    Alert.alert("Delete post", "Also delete this meal from your food log?", [
      { text: "Cancel", style: "cancel" },
      { text: "Post only", onPress: async () => { await deletePost(post.id); removePost(post.id); } },
      { text: "Post + log", style: "destructive", onPress: async () => { await deletePostWithFoodLog(post.id, post.mealName, logDate); removePost(post.id); } },
    ]);
  }

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
            <View style={s.avatarRing}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
            </View>
            {badges.map((b, i) => (
              <View key={i} style={[s.badge, b.pos as any]}>
                <Text style={s.badgeEmoji}>{b.emoji}</Text>
              </View>
            ))}
          </View>

          <View style={s.heroInfo}>
            <Text style={s.heroName}>{name}</Text>
            <Text style={s.heroEmail}>{email}</Text>
            {userProfile?.fitness_goal && (
              <View style={s.goalPill}>
                <Text style={s.goalPillText}>
                  {GOAL_EMOJI[goal]}  {goalLabel[goal]}
                </Text>
              </View>
            )}
          </View>
        </View>


        {/* Appearance */}
        <Text style={s.sectionLabel}>Appearance</Text>
        <View style={s.menuCard}>
          <View style={s.menuRow}>
            <View style={[s.menuIcon, { backgroundColor: 'rgba(245,200,66,0.12)' }]}>
              <Text style={s.menuEmoji}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <View style={s.menuMid}>
              <Text style={s.menuLabel}>Dark Mode</Text>
              <Text style={s.menuSub}>{isDark ? 'Warm dark theme' : 'Light theme'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E5E7EB', true: 'rgba(245,200,66,0.35)' }}
              thumbColor={isDark ? '#F5C842' : '#FFFFFF'}
            />
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

        {/* My Community Posts */}
        <Text style={s.sectionLabel}>My Community Posts</Text>
        {/* Stats row */}
        <View style={s.menuCard}>
          <View style={[s.menuRow, { paddingVertical: 16 }]}>
            {[
              { label: "Posts",  value: String(myPosts.length) },
              { label: "Likes",  value: String(totalLikes) },
              { label: "Streak", value: "—" },
            ].map((stat, i) => (
              <View key={stat.label} style={[cp.statCell, i > 0 && cp.statCellBorder]}>
                <Text style={cp.statVal}>{stat.value}</Text>
                <Text style={cp.statLbl}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {myPosts.length === 0 ? (
          <View style={cp.empty}>
            <Text style={cp.emptyEmoji}>🍽️</Text>
            <Text style={cp.emptyText}>No community posts yet</Text>
            <Text style={cp.emptySub}>Share a meal in the Community tab</Text>
          </View>
        ) : (
          myPosts.map((post) => {
            const localImg = getPostImage(post.id);
            return (
              <View key={post.id} style={cp.postCard}>
                {/* Thumbnail */}
                <View style={cp.thumb}>
                  {localImg ? (
                    <Image source={localImg} style={cp.thumbImg} resizeMode="cover" />
                  ) : post.imageUri ? (
                    <Image source={{ uri: post.imageUri }} style={cp.thumbImg} resizeMode="cover" />
                  ) : (
                    <View style={cp.thumbPlaceholder}><Text style={{ fontSize: 28 }}>🥗</Text></View>
                  )}
                </View>
                {/* Info */}
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={cp.postName} numberOfLines={1}>{post.mealName}</Text>
                  <Text style={cp.postMeta}>{post.timeAgo} · {post.nutrition.calories} cal · ♥ {post.likes}</Text>
                  <View style={cp.macroRow}>
                    <Text style={cp.macroChip}>P {post.nutrition.protein}g</Text>
                    <Text style={cp.macroChip}>C {post.nutrition.carbs}g</Text>
                    <Text style={cp.macroChip}>F {post.nutrition.fat}g</Text>
                  </View>
                </View>
                {/* Delete */}
                <TouchableOpacity style={cp.deleteBtn} onPress={() => handleDeletePost(post)} activeOpacity={0.7}>
                  <Text style={cp.deleteTxt}>🗑</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <Text style={s.version}>MacroClaw v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: BG },
  pageHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, gap: 10 },
  backBtn:  { padding: 4 },
  backArrow:{ fontSize: 24, color: "#E8E0D0", fontWeight: "400" },
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
  badgeEmoji: { fontSize: 13 },
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
  menuEmoji:{ fontSize: 18 },
  menuMid:  { flex: 1, gap: 1 },
  menuLabel:{ fontSize: 15, fontWeight: "700", color: "#E8E0D0" },
  menuSub:  { fontSize: 12, color: "rgba(232,224,208,0.4)" },
  chevron:  { fontSize: 22, color: "rgba(232,224,208,0.25)", fontWeight: "300" },
  divider:  { height: 1, backgroundColor: "rgba(255,220,150,0.06)", marginHorizontal: 16 },

  version: { textAlign: "center", fontSize: 11, color: "rgba(232,224,208,0.2)", marginTop: 8 },
});

const cp = StyleSheet.create({
  statCell:       { flex: 1, alignItems: "center", gap: 2 },
  statCellBorder: { borderLeftWidth: 1, borderLeftColor: "rgba(255,220,150,0.08)" },
  statVal:        { fontSize: 20, fontWeight: "800", color: "#E8E0D0" },
  statLbl:        { fontSize: 11, fontWeight: "600", color: "rgba(232,224,208,0.4)", textTransform: "uppercase", letterSpacing: 0.4 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 6 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 15, fontWeight: "700", color: "#E8E0D0" },
  emptySub:  { fontSize: 12, color: "rgba(232,224,208,0.4)" },
  postCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#1C1410", borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: "rgba(255,220,150,0.12)",
  },
  thumb:        { width: 60, height: 60, borderRadius: 12, overflow: "hidden", backgroundColor: "#252018" },
  thumbImg:     { width: 60, height: 60 },
  thumbPlaceholder: { width: 60, height: 60, alignItems: "center", justifyContent: "center", backgroundColor: "#252018" },
  postName: { fontSize: 14, fontWeight: "700", color: "#E8E0D0" },
  postMeta: { fontSize: 11, color: "rgba(232,224,208,0.4)" },
  macroRow: { flexDirection: "row", gap: 6, marginTop: 2 },
  macroChip: { fontSize: 10, fontWeight: "600", color: "#F5C842", backgroundColor: "rgba(245,200,66,0.10)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  deleteBtn: { padding: 8 },
  deleteTxt: { fontSize: 18 },
});
