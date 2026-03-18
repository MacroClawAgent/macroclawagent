import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import { consumePendingCommunityPost } from "@/lib/communityStore";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Ingredient { name: string; grams: number; calories: number; }
interface Post {
  id: string; userName: string; userInitial: string; userColor: string;
  timeAgo: string; mealName: string; mealEmoji: string; mealBg: string;
  calories: number; protein: number; carbs: number; fat: number;
  bumps: number; ingredients?: Ingredient[]; isOwn?: boolean;
}
interface CommunityUser {
  id: string; username: string; full_name: string;
  bio?: string; fitness_goal?: string; is_public?: boolean;
}

type MainTab = "feed" | "people";
type PeopleTab = "following" | "followers";

const TEAL = "#20C7B7";
const BG = "#EEF4FA";

// ── Avatar chip ───────────────────────────────────────────────────────────────
function AvatarChip({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initial = (name || "?")[0].toUpperCase();
  return (
    <View style={[s.avatarChip, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + "22" }]}>
      <Text style={[s.avatarInitial, { color, fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

// ── Macro chip ────────────────────────────────────────────────────────────────
function MacroChip({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={[s.macroChip, { backgroundColor: color + "1A" }]}>
      <Text style={[s.macroVal, { color }]}>{value}g</Text>
      <Text style={[s.macroLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, bumped, expanded, onBump, onExpand }: {
  post: Post; bumped: boolean; expanded: boolean;
  onBump: (id: string) => void; onExpand: (id: string) => void;
}) {
  return (
    <View style={[s.postCard, post.isOwn && s.postCardOwn]}>
      <View style={s.postHeader}>
        <AvatarChip name={post.userInitial} color={post.userColor} />
        <View style={s.postMeta}>
          <Text style={s.postName}>{post.userName}{post.isOwn ? " · You" : ""}</Text>
          <Text style={s.postTime}>{post.timeAgo}</Text>
        </View>
        {post.isOwn && <View style={s.ownBadge}><Text style={s.ownBadgeText}>Just posted</Text></View>}
      </View>

      <TouchableOpacity activeOpacity={post.ingredients?.length ? 0.75 : 1}
        onPress={() => post.ingredients?.length && onExpand(post.id)}>
        <View style={[s.mealBox, { backgroundColor: post.mealBg }]}>
          <Text style={s.mealEmoji}>{post.mealEmoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.mealName}>{post.mealName}</Text>
            <Text style={s.mealCal}>{post.calories} kcal</Text>
          </View>
          {post.ingredients?.length ? (
            <Text style={s.expandIcon}>{expanded ? "▲" : "▼"}</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {expanded && post.ingredients?.length ? (
        <View style={s.ingredBox}>
          <Text style={s.ingredTitle}>Ingredients</Text>
          {post.ingredients.map((ing, i) => (
            <View key={i} style={s.ingredRow}>
              <Text style={s.ingredName}>{ing.name}</Text>
              <Text style={s.ingredMeta}>{ing.grams}g · {ing.calories} kcal</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={s.macroRow}>
        <MacroChip value={post.protein} label="protein" color="#10B981" />
        <MacroChip value={post.carbs} label="carbs" color="#F59E0B" />
        <MacroChip value={post.fat} label="fat" color="#6366F1" />
      </View>

      <View style={s.postFooter}>
        <TouchableOpacity style={[s.bumpBtn, bumped && s.bumpBtnOn]} activeOpacity={0.75}
          onPress={() => onBump(post.id)}>
          <Text style={s.bumpIcon}>↑</Text>
          <Text style={[s.bumpText, bumped && s.bumpTextOn]}>
            Bump · {post.bumps + (bumped ? 1 : 0)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Person row ────────────────────────────────────────────────────────────────
function PersonRow({ user, isFollowing, onToggle, onPress }: {
  user: CommunityUser; isFollowing: boolean;
  onToggle: (id: string) => void; onPress: (username: string) => void;
}) {
  const initial = (user.full_name || user.username || "?")[0].toUpperCase();
  return (
    <TouchableOpacity style={s.personRow} activeOpacity={0.75}
      onPress={() => user.username && onPress(user.username)}>
      <AvatarChip name={initial} color={TEAL} size={46} />
      <View style={{ flex: 1 }}>
        <Text style={s.personName}>{user.full_name || `@${user.username}`}</Text>
        <Text style={s.personHandle}>@{user.username}{user.bio ? `  ·  ${user.bio}` : ""}</Text>
      </View>
      <TouchableOpacity
        style={[s.followBtn, isFollowing && s.followBtnOn]}
        activeOpacity={0.8}
        onPress={(e) => { e.stopPropagation?.(); onToggle(user.id); }}
      >
        <Text style={[s.followBtnText, isFollowing && s.followBtnTextOn]}>
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function Empty({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyEmoji}>{emoji}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptySub}>{sub}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function CommunityScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // Main state
  const [mainTab, setMainTab] = useState<MainTab>("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [bumpedIds, setBumpedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // People tab state
  const [peopleTab, setPeopleTab] = useState<PeopleTab>("following");
  const [followingList, setFollowingList] = useState<CommunityUser[]>([]);
  const [followersList, setFollowersList] = useState<CommunityUser[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [peopleLoading, setPeopleLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CommunityUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<TextInput>(null);

  // Load people when tab becomes active
  useFocusEffect(useCallback(() => {
    if (mainTab === "people") loadPeople();
  }, [mainTab]));

  // Consume pending community post
  useFocusEffect(useCallback(() => {
    const pending = consumePendingCommunityPost();
    if (!pending) return;
    const firstName = userProfile?.full_name?.split(" ")[0] ?? "You";
    const initial = (userProfile?.full_name ?? "Y")[0].toUpperCase();
    const newPost: Post = {
      id: pending.id, userName: firstName, userInitial: initial,
      userColor: TEAL, timeAgo: "Just now",
      mealName: pending.dishName, mealEmoji: pending.mealEmoji,
      mealBg: "rgba(32,199,183,0.12)", calories: pending.calories,
      protein: Math.round(pending.protein), carbs: Math.round(pending.carbs),
      fat: Math.round(pending.fat), bumps: 0,
      ingredients: pending.ingredients, isOwn: true,
    };
    setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== pending.id)]);
    setMainTab("feed");
  }, [userProfile]));

  async function loadPeople() {
    setPeopleLoading(true);
    try {
      const [fwing, fwers] = await Promise.all([
        apiGet<{ users: CommunityUser[]; ids: string[] }>("/api/follows?type=following"),
        apiGet<{ users: CommunityUser[] }>("/api/follows?type=followers"),
      ]);
      setFollowingList(fwing.users ?? []);
      setFollowersList(fwers.users ?? []);
      setFollowingIds(new Set(fwing.ids ?? []));
    } catch { /* silently fail */ }
    finally { setPeopleLoading(false); }
  }

  async function toggleFollow(userId: string) {
    const was = followingIds.has(userId);
    setFollowingIds((prev) => { const n = new Set(prev); was ? n.delete(userId) : n.add(userId); return n; });
    try {
      if (was) await apiDelete(`/api/follows?following_id=${userId}`);
      else await apiPost("/api/follows", { following_id: userId });
    } catch {
      setFollowingIds((prev) => { const n = new Set(prev); was ? n.add(userId) : n.delete(userId); return n; });
    }
  }

  function handleSearch(q: string) {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await apiGet<{ users: CommunityUser[] }>(`/api/users/search?q=${encodeURIComponent(q.trim())}`);
        setSearchResults(res.users ?? []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 400);
  }

  function openSearch() {
    setMainTab("people");
    setTimeout(() => searchRef.current?.focus(), 200);
  }

  const showSearchResults = searchFocused || searchQuery.length > 0;

  return (
    <Screen style={{ backgroundColor: BG }}>
      <LinearGradient colors={[BG, "#F5F8FC"]} style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Community</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7} onPress={openSearch}>
            <SymbolView name={{ ios: "magnifyingglass", android: "search", web: "search" }}
              tintColor="#374151" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}
            onPress={() => router.push("/profile/community-profile" as any)}>
            <SymbolView name={{ ios: "person.circle", android: "account_circle", web: "account_circle" }}
              tintColor="#374151" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main tabs ── */}
      <View style={s.mainTabRow}>
        {(["feed", "people"] as MainTab[]).map((t) => (
          <TouchableOpacity key={t} style={[s.mainTab, mainTab === t && s.mainTabActive]}
            activeOpacity={0.8} onPress={() => { setMainTab(t); if (t === "people") loadPeople(); }}>
            <Text style={[s.mainTabText, mainTab === t && s.mainTabTextActive]}>
              {t === "feed" ? "Feed" : "People"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Feed ── */}
      {mainTab === "feed" && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
            tintColor={TEAL} />}>
          {posts.length === 0
            ? <Empty emoji="🍽️" title="No posts yet" sub="Be the first to share a meal with the community." />
            : posts.map((post) => (
              <PostCard key={post.id} post={post}
                bumped={bumpedIds.has(post.id)} expanded={expandedIds.has(post.id)}
                onBump={(id) => setBumpedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                onExpand={(id) => setExpandedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; })}
              />
            ))
          }
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* ── People ── */}
      {mainTab === "people" && (
        <View style={{ flex: 1 }}>
          {/* Search bar */}
          <View style={s.searchWrap}>
            <View style={[s.searchBar, searchFocused && s.searchBarFocused]}>
              <SymbolView name={{ ios: "magnifyingglass", android: "search", web: "search" }}
                tintColor={searchFocused ? TEAL : "#9CA3AF"} size={16} />
              <TextInput
                ref={searchRef}
                style={s.searchInput}
                placeholder="Search by username..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchLoading
                ? <ActivityIndicator size="small" color={TEAL} />
                : searchQuery.length > 0
                  ? <TouchableOpacity onPress={() => { setSearchQuery(""); setSearchResults([]); }}>
                      <Text style={s.clearBtn}>✕</Text>
                    </TouchableOpacity>
                  : null
              }
            </View>
          </View>

          {showSearchResults ? (
            /* ── Search results ── */
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {searchResults.length > 0
                ? searchResults.map((u) => (
                  <PersonRow key={u.id} user={u} isFollowing={followingIds.has(u.id)}
                    onToggle={toggleFollow}
                    onPress={(username) => router.push(`/community/${username}` as any)} />
                ))
                : searchQuery.length >= 2 && !searchLoading
                  ? <Empty emoji="🔍" title="No users found" sub="Try a different username." />
                  : null
              }
              <View style={{ height: 32 }} />
            </ScrollView>
          ) : (
            /* ── Following / Followers sub-tabs ── */
            <View style={{ flex: 1 }}>
              <View style={s.subTabRow}>
                {(["following", "followers"] as PeopleTab[]).map((t) => (
                  <TouchableOpacity key={t} style={[s.subTab, peopleTab === t && s.subTabActive]}
                    activeOpacity={0.8} onPress={() => setPeopleTab(t)}>
                    <Text style={[s.subTabText, peopleTab === t && s.subTabTextActive]}>
                      {t === "following" ? `Following${followingList.length ? ` · ${followingList.length}` : ""}` : `Followers${followersList.length ? ` · ${followersList.length}` : ""}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {peopleLoading ? (
                <ActivityIndicator color={TEAL} size="large" style={{ marginTop: 60 }} />
              ) : (
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                  {peopleTab === "following" && (
                    followingList.length === 0
                      ? <Empty emoji="👥" title="Not following anyone yet" sub="Search for users above to find people to follow." />
                      : followingList.map((u) => (
                        <PersonRow key={u.id} user={u} isFollowing={true}
                          onToggle={toggleFollow}
                          onPress={(username) => router.push(`/community/${username}` as any)} />
                      ))
                  )}
                  {peopleTab === "followers" && (
                    followersList.length === 0
                      ? <Empty emoji="🌱" title="No followers yet" sub="Share your meals and build your community presence." />
                      : followersList.map((u) => (
                        <PersonRow key={u.id} user={u} isFollowing={followingIds.has(u.id)}
                          onToggle={toggleFollow}
                          onPress={(username) => router.push(`/community/${username}` as any)} />
                      ))
                  )}
                  <View style={{ height: 80 }} />
                </ScrollView>
              )}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.6, color: "#111827" },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.75)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },

  mainTabRow: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 10, gap: 6 },
  mainTab: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.65)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  mainTabActive: { backgroundColor: TEAL, borderColor: TEAL },
  mainTabText: { fontSize: 14, fontWeight: "700", color: "#6B7280" },
  mainTabTextActive: { color: "#fff" },

  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },

  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.06)" },
  searchBarFocused: { borderColor: TEAL, backgroundColor: "#fff" },
  searchInput: { flex: 1, fontSize: 15, color: "#111827", fontWeight: "500" },
  clearBtn: { fontSize: 14, color: "#9CA3AF", paddingHorizontal: 4 },

  subTabRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.07)", marginHorizontal: 20, marginBottom: 4 },
  subTab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  subTabActive: { borderBottomColor: TEAL },
  subTabText: { fontSize: 14, fontWeight: "600", color: "#9CA3AF" },
  subTabTextActive: { color: TEAL, fontWeight: "700" },

  postCard: { backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, gap: 12 },
  postCardOwn: { borderColor: "rgba(32,199,183,0.35)", borderWidth: 1.5 },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  postMeta: { flex: 1 },
  postName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  postTime: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },
  ownBadge: { backgroundColor: "rgba(32,199,183,0.12)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  ownBadgeText: { fontSize: 11, fontWeight: "700", color: TEAL },

  mealBox: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 12 },
  mealEmoji: { fontSize: 28 },
  mealName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  mealCal: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  expandIcon: { fontSize: 11, color: "#9CA3AF", fontWeight: "700" },

  ingredBox: { backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 12, padding: 12, gap: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(0,0,0,0.06)" },
  ingredTitle: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  ingredRow: { flexDirection: "row", justifyContent: "space-between" },
  ingredName: { fontSize: 13, fontWeight: "600", color: "#374151", flex: 1 },
  ingredMeta: { fontSize: 12, color: "#9CA3AF" },

  macroRow: { flexDirection: "row", gap: 6 },
  macroChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  macroVal: { fontSize: 13, fontWeight: "700" },
  macroLabel: { fontSize: 10, fontWeight: "600" },

  postFooter: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.06)", paddingTop: 10 },
  bumpBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#F4F5F7", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  bumpBtnOn: { backgroundColor: "rgba(32,199,183,0.1)", borderColor: TEAL },
  bumpIcon: { fontSize: 14, fontWeight: "700", color: "#9CA3AF" },
  bumpText: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
  bumpTextOn: { color: TEAL },

  personRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  personName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  personHandle: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

  followBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: TEAL },
  followBtnOn: { backgroundColor: TEAL, borderColor: TEAL },
  followBtnText: { fontSize: 13, fontWeight: "700", color: TEAL },
  followBtnTextOn: { color: "#fff" },

  avatarChip: { alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontWeight: "700" },

  empty: { alignItems: "center", paddingVertical: 80, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  emptySub: { fontSize: 14, color: "#9CA3AF", textAlign: "center", paddingHorizontal: 24 },
});
