import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { useFocusEffect } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { consumePendingCommunityPost } from "@/lib/communityStore";

// ── Types ────────────────────────────────────────────────────────────────────
interface Ingredient { name: string; grams: number; calories: number; }

interface Post {
  id: string;
  userName: string;
  userInitial: string;
  userColor: string;
  timeAgo: string;
  mealName: string;
  mealEmoji: string;
  mealBg: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bumps: number;
  ingredients?: Ingredient[];
  isOwn?: boolean;
}

interface Group {
  id: string;
  name: string;
  emoji: string;
  description: string;
  memberCount: number;
}

interface CommunityUser {
  id: string;
  name: string;
  initial: string;
  color: string;
  goal: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    userName: "Marcus T.",
    userInitial: "M",
    userColor: "#4C7DFF",
    timeAgo: "2m ago",
    mealName: "Post-run protein bowl",
    mealEmoji: "🥗",
    mealBg: "rgba(16,185,129,0.12)",
    calories: 520,
    protein: 48,
    carbs: 42,
    fat: 14,
    bumps: 12,
  },
  {
    id: "2",
    userName: "Layla K.",
    userInitial: "L",
    userColor: "#F97316",
    timeAgo: "18m ago",
    mealName: "Overnight oats + berries",
    mealEmoji: "🫐",
    mealBg: "rgba(99,102,241,0.12)",
    calories: 380,
    protein: 24,
    carbs: 58,
    fat: 8,
    bumps: 7,
  },
  {
    id: "3",
    userName: "James O.",
    userInitial: "J",
    userColor: "#10B981",
    timeAgo: "1h ago",
    mealName: "Chicken & sweet potato",
    mealEmoji: "🍠",
    mealBg: "rgba(249,115,22,0.12)",
    calories: 610,
    protein: 55,
    carbs: 65,
    fat: 12,
    bumps: 24,
  },
  {
    id: "4",
    userName: "Priya N.",
    userInitial: "P",
    userColor: "#A78BFA",
    timeAgo: "3h ago",
    mealName: "Greek yoghurt parfait",
    mealEmoji: "🍯",
    mealBg: "rgba(167,139,250,0.12)",
    calories: 290,
    protein: 28,
    carbs: 30,
    fat: 6,
    bumps: 18,
  },
];

const MOCK_GROUPS: Group[] = [
  { id: "g1", name: "Morning Runners", emoji: "🏃", description: "Daily runs, weekly goals", memberCount: 284 },
  { id: "g2", name: "Muscle Builders", emoji: "💪", description: "Lifting logs & protein tips", memberCount: 512 },
  { id: "g3", name: "Plant-Based Crew", emoji: "🌿", description: "Vegan & veggie meal ideas", memberCount: 193 },
  { id: "g4", name: "Cyclists United", emoji: "🚴", description: "Rides, routes & fuelling", memberCount: 341 },
  { id: "g5", name: "Weight Loss Squad", emoji: "🔥", description: "Deficit tracking & support", memberCount: 678 },
  { id: "g6", name: "Meal Preppers", emoji: "📦", description: "Batch cook & macro planning", memberCount: 421 },
];

const MOCK_USERS: CommunityUser[] = [
  { id: "u1", name: "Sofia R.", initial: "S", color: "#F97316", goal: "Build Muscle" },
  { id: "u2", name: "Noah B.", initial: "N", color: "#4C7DFF", goal: "Performance" },
  { id: "u3", name: "Aisha M.", initial: "A", color: "#10B981", goal: "Lose Weight" },
  { id: "u4", name: "Ethan C.", initial: "E", color: "#A78BFA", goal: "Stay Healthy" },
  { id: "u5", name: "Zara D.", initial: "Z", color: "#F59E0B", goal: "Build Muscle" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function MacroChip({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={[styles.macroChip, { backgroundColor: color + "1A" }]}>
      <Text style={[styles.macroChipVal, { color }]}>{value}g</Text>
      <Text style={[styles.macroChipLabel, { color }]}>{label}</Text>
    </View>
  );
}

function PostCard({
  post,
  bumped,
  expanded,
  onBump,
  onToggleExpand,
}: {
  post: Post;
  bumped: boolean;
  expanded: boolean;
  onBump: (id: string) => void;
  onToggleExpand: (id: string) => void;
}) {
  const bumpCount = post.bumps + (bumped ? 1 : 0);
  return (
    <View style={[styles.postCard, post.isOwn && styles.postCardOwn]}>
      {/* User row */}
      <View style={styles.postUserRow}>
        <View style={[styles.avatar, { backgroundColor: post.userColor + "22" }]}>
          <Text style={[styles.avatarInitial, { color: post.userColor }]}>{post.userInitial}</Text>
        </View>
        <View style={styles.postUserInfo}>
          <Text style={styles.postUserName}>{post.userName}{post.isOwn ? " · You" : ""}</Text>
          <Text style={styles.postTime}>{post.timeAgo}</Text>
        </View>
        {post.isOwn && (
          <View style={styles.yourPostBadge}>
            <Text style={styles.yourPostBadgeText}>Just posted</Text>
          </View>
        )}
      </View>

      {/* Meal display — tappable if has ingredients */}
      <TouchableOpacity
        activeOpacity={post.ingredients?.length ? 0.75 : 1}
        onPress={() => post.ingredients?.length && onToggleExpand(post.id)}
      >
        <View style={[styles.mealDisplay, { backgroundColor: post.mealBg }]}>
          <Text style={styles.mealEmoji}>{post.mealEmoji}</Text>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{post.mealName}</Text>
            <Text style={styles.mealCal}>{post.calories} kcal</Text>
          </View>
          {post.ingredients?.length ? (
            <View style={styles.expandHint}>
              <Text style={styles.expandHintText}>{expanded ? "▲" : "▼"}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Ingredients — shown when expanded */}
      {expanded && post.ingredients?.length ? (
        <View style={styles.ingredientsList}>
          <Text style={styles.ingredientsTitle}>Ingredients</Text>
          {post.ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <Text style={styles.ingredientName}>{ing.name}</Text>
              <Text style={styles.ingredientMeta}>{ing.grams}g · {ing.calories} kcal</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Macro row */}
      <View style={styles.macroRow}>
        <MacroChip value={post.protein} label="protein" color="#10B981" />
        <MacroChip value={post.carbs} label="carbs" color="#F59E0B" />
        <MacroChip value={post.fat} label="fat" color="#6366F1" />
      </View>

      {/* Bump action */}
      <View style={styles.postFooter}>
        <TouchableOpacity
          style={[styles.bumpBtn, bumped && styles.bumpBtnActive]}
          activeOpacity={0.75}
          onPress={() => onBump(post.id)}
        >
          <SymbolView
            name={{ ios: "arrow.up.circle.fill", android: "arrow_upward", web: "arrow_upward" }}
            tintColor={bumped ? "#20C7B7" : "#9CA3AF"}
            size={18}
          />
          <Text style={[styles.bumpLabel, bumped && styles.bumpLabelActive]}>
            Bump up · {bumpCount}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function GroupCard({
  group,
  joined,
  onToggle,
}: {
  group: Group;
  joined: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.groupCard}>
      <View style={styles.groupEmoji}>
        <Text style={{ fontSize: 24 }}>{group.emoji}</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupDesc}>{group.description}</Text>
        <Text style={styles.groupMembers}>{group.memberCount.toLocaleString()} members</Text>
      </View>
      <TouchableOpacity
        style={[styles.joinBtn, joined && styles.joinBtnActive]}
        activeOpacity={0.8}
        onPress={() => onToggle(group.id)}
      >
        <Text style={[styles.joinBtnText, joined && styles.joinBtnTextActive]}>
          {joined ? "Joined" : "Join"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function UserCard({
  user,
  following,
  onToggle,
}: {
  user: CommunityUser;
  following: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.userCard}>
      <View style={[styles.avatar, { backgroundColor: user.color + "22" }]}>
        <Text style={[styles.avatarInitial, { color: user.color }]}>{user.initial}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userGoal}>{user.goal}</Text>
      </View>
      <TouchableOpacity
        style={[styles.followBtn, following && styles.followBtnActive]}
        activeOpacity={0.8}
        onPress={() => onToggle(user.id)}
      >
        <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
          {following ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
type TabKey = "feed" | "groups" | "following";
const TABS: { key: TabKey; label: string }[] = [
  { key: "feed", label: "Feed" },
  { key: "groups", label: "Groups" },
  { key: "following", label: "Following" },
];

export default function CommunityScreen() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("feed");
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [bumpedIds, setBumpedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set(["g1"]));
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set(["u2"]));
  const [refreshing, setRefreshing] = useState(false);

  // Consume any pending post from photo-confirm on focus
  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingCommunityPost();
      if (!pending) return;
      const firstName = userProfile?.full_name?.split(" ")[0] ?? "You";
      const initial = (userProfile?.full_name ?? "Y")[0].toUpperCase();
      const newPost: Post = {
        id: pending.id,
        userName: firstName,
        userInitial: initial,
        userColor: "#20C7B7",
        timeAgo: "Just now",
        mealName: pending.dishName,
        mealEmoji: pending.mealEmoji,
        mealBg: "rgba(32,199,183,0.12)",
        calories: pending.calories,
        protein: Math.round(pending.protein),
        carbs: Math.round(pending.carbs),
        fat: Math.round(pending.fat),
        bumps: 0,
        ingredients: pending.ingredients,
        isOwn: true,
      };
      setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== pending.id)]);
      setActiveTab("feed");
    }, [userProfile])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleBump = (id: string) => {
    setBumpedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleJoin = (id: string) => {
    setJoinedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleFollow = (id: string) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Screen style={{ backgroundColor: "#EEF4FA" }}>
      <LinearGradient
        colors={["#EEF4FA", "#F5F8FC"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7}>
          <SymbolView
            name={{ ios: "magnifyingglass", android: "search", web: "search" }}
            tintColor="#6B7280"
            size={20}
          />
        </TouchableOpacity>
      </View>

      {/* Tab chips */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabChip, activeTab === t.key && styles.tabChipActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabChipText, activeTab === t.key && styles.tabChipTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#35C7B8" />
        }
      >
        {/* ── Feed ── */}
        {activeTab === "feed" && (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                bumped={bumpedIds.has(post.id)}
                expanded={expandedIds.has(post.id)}
                onToggleExpand={toggleExpand}
                onBump={toggleBump}
              />
            ))}
          </>
        )}

        {/* ── Groups ── */}
        {activeTab === "groups" && (
          <>
            <Text style={styles.sectionLabel}>Discover Groups</Text>
            {MOCK_GROUPS.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                joined={joinedIds.has(group.id)}
                onToggle={toggleJoin}
              />
            ))}
          </>
        )}

        {/* ── Following ── */}
        {activeTab === "following" && (
          <>
            <Text style={styles.sectionLabel}>People you may know</Text>
            {MOCK_USERS.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                following={followingIds.has(user.id)}
                onToggle={toggleFollow}
              />
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.6, color: "#111827" },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  tabChipActive: { backgroundColor: "#20C7B7", borderColor: "#20C7B7" },
  tabChipText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  tabChipTextActive: { color: "#FFFFFF" },

  scroll: { paddingHorizontal: 20, paddingTop: 4, gap: 12 },

  // Share card
  shareCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  shareAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  shareInput: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  shareInputText: { color: "#9CA3AF", fontSize: 14, fontWeight: "500" },
  shareIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(32,199,183,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Post card
  postCard: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    gap: 12,
  },
  postCardOwn: { borderColor: "rgba(32,199,183,0.35)", borderWidth: 1.5 },
  yourPostBadge: { backgroundColor: "rgba(32,199,183,0.12)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  yourPostBadgeText: { fontSize: 11, fontWeight: "700", color: "#20C7B7" },

  postUserRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 16, fontWeight: "700" },
  postUserInfo: { flex: 1, gap: 1 },
  postUserName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  postTime: { fontSize: 12, fontWeight: "500", color: "#9CA3AF" },

  mealDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 12,
  },
  mealEmoji: { fontSize: 28 },
  mealInfo: { flex: 1, gap: 2 },
  mealName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  mealCal: { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  expandHint: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  expandHintText: { fontSize: 11, color: "#9CA3AF", fontWeight: "700" },

  ingredientsList: {
    backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 12, padding: 12, gap: 6,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(0,0,0,0.06)",
  },
  ingredientsTitle: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  ingredientRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ingredientName: { fontSize: 13, fontWeight: "600", color: "#374151", flex: 1 },
  ingredientMeta: { fontSize: 12, fontWeight: "500", color: "#9CA3AF" },

  macroRow: { flexDirection: "row", gap: 6 },
  macroChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  macroChipVal: { fontSize: 13, fontWeight: "700" },
  macroChipLabel: { fontSize: 10, fontWeight: "600" },

  postFooter: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.06)", paddingTop: 10 },
  bumpBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F4F5F7",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  bumpBtnActive: { backgroundColor: "rgba(32,199,183,0.1)", borderColor: "#20C7B7" },
  bumpLabel: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
  bumpLabelActive: { color: "#20C7B7" },

  // Section label
  sectionLabel: { fontSize: 13, fontWeight: "700", color: "#9CA3AF", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 },

  // Group card
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  groupEmoji: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F4F5F7",
    alignItems: "center",
    justifyContent: "center",
  },
  groupInfo: { flex: 1, gap: 2 },
  groupName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  groupDesc: { fontSize: 12, fontWeight: "500", color: "#6B7280" },
  groupMembers: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", marginTop: 2 },
  joinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#20C7B7",
  },
  joinBtnActive: { backgroundColor: "#20C7B7", borderColor: "#20C7B7" },
  joinBtnText: { fontSize: 13, fontWeight: "700", color: "#20C7B7" },
  joinBtnTextActive: { color: "#FFFFFF" },

  // User card
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  userGoal: { fontSize: 12, fontWeight: "500", color: "#6B7280" },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#4C7DFF",
  },
  followBtnActive: { backgroundColor: "#4C7DFF", borderColor: "#4C7DFF" },
  followBtnText: { fontSize: 13, fontWeight: "700", color: "#4C7DFF" },
  followBtnTextActive: { color: "#FFFFFF" },
});
