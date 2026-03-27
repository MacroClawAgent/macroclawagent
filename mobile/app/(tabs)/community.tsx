import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/context/ThemeContext';
import { CommunityPostCard } from '@/components/Community/CommunityPostCard';
import { CreatePostSheet } from '@/components/Community/CreatePostSheet';
import { useCommunity } from '@/hooks/useCommunity';
import { consumePendingCommunityPost } from '@/lib/communityStore';
import { deletePost, deletePostWithFoodLog } from '@/services/communityService';
import { getFollowingFeedPosts } from '@/services/profileService';
import { MOCK_PROFILES, setFollowing } from '@/data/profileMockData';
import type { CommunityFilter, CommunityPost, UserProfile } from '@/types/community';

const GOLD   = '#F5C842';
const CORAL  = '#E07B54';
const CARD   = '#1C1410';
const BORDER = 'rgba(255,220,150,0.12)';
const CREAM  = '#E8E0D0';
const MUTED  = 'rgba(232,224,208,0.4)';
const BG     = '#0D0A07';

type ActivePill = 'following' | CommunityFilter;

const PILLS: { key: ActivePill; label: string }[] = [
  { key: 'following',    label: 'Following' },
  { key: 'all',          label: 'All' },
  { key: 'build_muscle', label: 'Muscle' },
  { key: 'fat_loss',     label: 'Fat Loss' },
  { key: 'home_cooked',  label: 'Home Cooked' },
  { key: 'eating_out',   label: 'Eating Out' },
  { key: 'meal_prep',    label: 'Meal Prep' },
];

const CHALLENGES = [
  { id: '1', emoji: '🔥', title: 'High Protein Week',  members: 1240, daysLeft: 3, progress: 0.72, accent: '#E07B54' },
  { id: '2', emoji: '🥗', title: 'Clean Eating',        members: 843,  daysLeft: 5, progress: 0.45, accent: '#8B9E6E' },
  { id: '3', emoji: '💪', title: 'Muscle Build',        members: 2100, daysLeft: 2, progress: 0.88, accent: '#F5C842' },
  { id: '4', emoji: '🏃', title: '10k Steps Daily',     members: 567,  daysLeft: 7, progress: 0.30, accent: '#E8E0D0' },
];

const TRENDING = ['Teriyaki Bowl', 'Overnight Oats', 'Greek Chicken', 'Protein Pancakes', 'Quinoa Salad'];

// Search through mock profiles by name or username
function searchProfiles(query: string): UserProfile[] {
  const q = query.toLowerCase().replace('@', '').trim();
  if (!q) return [];
  return MOCK_PROFILES.filter(
    (p) =>
      !p.isCurrentUser &&
      (p.username.toLowerCase().replace('@', '').includes(q) ||
        p.name.toLowerCase().includes(q))
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const {
    posts,
    loading,
    refreshing,
    showCreatePost,
    currentUserId,
    loadPosts,
    handleLike,
    handleRefresh,
    setFilter,
    openCreatePost,
    closeCreatePost,
    submitPost,
    removePost,
  } = useCommunity();

  const [activePill, setActivePill] = useState<ActivePill>('all');
  const [followingPosts, setFollowingPosts] = useState<CommunityPost[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [challengesOpen, setChallengesOpen] = useState(true);

  // Search
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const searchRef = useRef<TextInput>(null);

  useEffect(() => { loadPosts(); }, []);

  // Auto-post any meal shared from the photo-confirm scan flow
  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingCommunityPost();
      if (!pending) return;
      submitPost({
        postType: 'home_cooked',
        mealName: pending.dishName,
        caption: `${pending.mealEmoji} ${pending.dishName}`,
        nutrition: {
          calories: pending.calories,
          protein: pending.protein,
          carbs: pending.carbs,
          fat: pending.fat,
        },
        ingredients: pending.ingredients.map((i) => i.name),
        imageUri: pending.imageUri ?? null,
        imageBase64: pending.imageBase64 ?? null,
      });
    }, [submitPost])
  );

  // Initialise follow states from mock data
  useEffect(() => {
    const states: Record<string, boolean> = {};
    MOCK_PROFILES.forEach((p) => { states[p.id] = p.isFollowing; });
    setFollowStates(states);
  }, []);

  function openSearch() {
    setSearchActive(true);
    setSearchQuery('');
    setSearchResults([]);
    setTimeout(() => searchRef.current?.focus(), 100);
  }

  function closeSearch() {
    setSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  function handleSearchChange(text: string) {
    setSearchQuery(text);
    setSearchResults(searchProfiles(text));
  }

  function handleToggleFollow(userId: string) {
    const nowFollowing = !followStates[userId];
    setFollowStates((prev) => ({ ...prev, [userId]: nowFollowing }));
    setFollowing(userId, nowFollowing);
    // TODO: sync to backend
  }

  async function loadFollowingPosts() {
    setFollowingLoading(true);
    try {
      const data = await getFollowingFeedPosts();
      setFollowingPosts(data);
    } finally {
      setFollowingLoading(false);
    }
  }

  function handleDeletePost(post: CommunityPost) {
    const logDate = post.createdAt.split('T')[0];
    Alert.alert(
      'Delete post',
      'Do you also want to delete this meal from your food log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Post only',
          onPress: async () => {
            await deletePost(post.id);
            removePost(post.id);
          },
        },
        {
          text: 'Post + food log',
          style: 'destructive',
          onPress: async () => {
            await deletePostWithFoodLog(post.id, post.mealName, logDate);
            removePost(post.id);
          },
        },
      ]
    );
  }

  function handlePillPress(key: ActivePill) {
    setActivePill(key);
    if (key === 'following') {
      loadFollowingPosts();
    } else {
      setFilter(key as CommunityFilter);
    }
  }

  const isFollowingMode = activePill === 'following';
  const displayedPosts = isFollowingMode ? followingPosts : posts;
  const isLoading = isFollowingMode ? followingLoading : (loading && posts.length === 0);

  // ── Search result row ────────────────────────────────────────────────────────
  function SearchResultRow({ profile }: { profile: UserProfile }) {
    const following = followStates[profile.id] ?? profile.isFollowing;
    return (
      <TouchableOpacity
        style={sr.row}
        activeOpacity={0.75}
        onPress={() => { closeSearch(); router.push(`/profile/${profile.id}` as any); }}
      >
        <View style={sr.avatar}>
          <Text style={sr.avatarText}>{profile.initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={sr.name}>{profile.name}</Text>
          <Text style={sr.username}>{profile.username}</Text>
        </View>
        <TouchableOpacity
          style={[sr.followBtn, following && sr.followBtnActive]}
          activeOpacity={0.8}
          onPress={(e) => { e.stopPropagation?.(); handleToggleFollow(profile.id); }}
        >
          <Text style={[sr.followBtnText, following && sr.followBtnTextActive]}>
            {following ? 'Following ✓' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // ── Filter pills ─────────────────────────────────────────────────────────────
  function PillRow() {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
        {PILLS.map((p) => {
          const active = activePill === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[s.pill, active && s.pillActive]}
              activeOpacity={0.75}
              onPress={() => handlePillPress(p.key)}
            >
              <Text style={[s.pillText, active && s.pillTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  function EmptyState() {
    if (isFollowingMode) {
      return (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>👥</Text>
          <Text style={s.emptyTitle}>No posts yet</Text>
          <Text style={s.emptySub}>Follow people to see their meals here</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => handlePillPress('all')} activeOpacity={0.8}>
            <Text style={s.emptyBtnText}>Browse All →</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={s.empty}>
        <Text style={s.emptyEmoji}>🍽️</Text>
        <Text style={s.emptyTitle}>No posts yet</Text>
        <Text style={s.emptySub}>Be the first to share a meal with the community</Text>
        <TouchableOpacity style={s.emptyBtn} onPress={openCreatePost} activeOpacity={0.8}>
          <Text style={s.emptyBtnText}>Share a Meal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function ChallengesSection() {
    return (
      <View>
        <TouchableOpacity style={ch.headerRow} onPress={() => setChallengesOpen(o => !o)} activeOpacity={0.7}>
          <Text style={ch.heading}>This Week's Challenges</Text>
          <Text style={ch.chevron}>{challengesOpen ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        {challengesOpen && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ch.row}>
            {CHALLENGES.map((c) => (
              <View key={c.id} style={[ch.card, { borderLeftColor: c.accent }]}>
                <View style={ch.cardTop}>
                  <Text style={ch.emoji}>{c.emoji}</Text>
                  <Text style={[ch.daysLeft, { color: c.accent }]}>{c.daysLeft}d left</Text>
                </View>
                <Text style={ch.title}>{c.title}</Text>
                <Text style={ch.meta}>{c.members.toLocaleString()} members</Text>
                <View style={ch.track}>
                  <View style={[ch.fill, { width: `${Math.round(c.progress * 100)}%` as any, backgroundColor: c.accent }]} />
                </View>
                <TouchableOpacity style={[ch.joinBtn, { borderColor: c.accent }]} activeOpacity={0.8}>
                  <Text style={[ch.joinText, { color: c.accent }]}>Join</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  function TrendingSection() {
    return (
      <View style={{ marginBottom: 4 }}>
        <Text style={tr.heading}>Trending Today</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tr.row}>
          {TRENDING.map((dish, i) => (
            <View key={dish} style={tr.chip}>
              <Text style={tr.rank}>#{i + 1}</Text>
              <Text style={tr.name}>{dish}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <Screen style={{ backgroundColor: BG }}>
      <LinearGradient
        colors={['#000000', '#080603', '#120D08', '#1C1410', '#2E1A0A']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} pointerEvents="none" />

      {/* Header */}
      <View style={s.header}>
        {searchActive ? (
          // ── Search mode header ──
          <>
            <View style={s.searchBar}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                tintColor={MUTED} size={16} />
              <TextInput
                ref={searchRef}
                style={s.searchInput}
                placeholder="Search by username…"
                placeholderTextColor="rgba(232,224,208,0.35)"
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                  <Text style={s.clearBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={closeSearch} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          // ── Normal header ──
          <>
            <Text style={s.headerTitle}>Community</Text>
            <View style={s.headerRight}>
              <TouchableOpacity style={s.iconBtn} activeOpacity={0.7} onPress={openSearch}>
                <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                  tintColor={CREAM} size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}>
                <SymbolView name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
                  tintColor={CREAM} size={20} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Search results */}
      {searchActive ? (
        <View style={{ flex: 1 }}>
          {searchQuery.length === 0 ? (
            <View style={s.searchHint}>
              <Text style={s.searchHintText}>Search by name or @username</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={s.searchHint}>
              <Text style={s.searchHintText}>No users found for "{searchQuery}"</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 10 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <SearchResultRow profile={item} />}
            />
          )}
        </View>
      ) : (
        // ── Normal feed ──
        isLoading ? (
          <ActivityIndicator color={GOLD} size="large" style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={displayedPosts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={isFollowingMode ? loadFollowingPosts : handleRefresh}
                tintColor={GOLD}
              />
            }
            ListHeaderComponent={<><ChallengesSection /><TrendingSection /><PillRow /></>}
            ListEmptyComponent={<EmptyState />}
            renderItem={({ item }) => (
              <CommunityPostCard
                post={item}
                onLike={handleLike}
                isOwn={!!currentUserId && item.userId === currentUserId}
                onDelete={() => handleDeletePost(item)}
              />
            )}
          />
        )
      )}

      <CreatePostSheet visible={showCreatePost} onClose={closeCreatePost} onSubmit={submitPost} />
    </Screen>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, gap: 10,
  },
  headerTitle: { flex: 1, fontSize: 28, fontWeight: '800', fontFamily: 'BebasNeue_400Regular', letterSpacing: -0.6, color: CREAM },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: CARD,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: BORDER,
  },

  // Search bar
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: CARD,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1.5, borderColor: GOLD,
  },
  searchInput: { flex: 1, fontSize: 15, color: CREAM, fontWeight: '500', fontFamily: 'BebasNeue_400Regular' },
  clearBtn: { fontSize: 14, color: MUTED, paddingHorizontal: 2, fontFamily: 'BebasNeue_400Regular' },
  cancelBtn: { paddingHorizontal: 4 },
  cancelText: { fontSize: 15, color: GOLD, fontWeight: '600', fontFamily: 'BebasNeue_400Regular' },

  searchHint: { flex: 1, alignItems: 'center', paddingTop: 60 },
  searchHintText: { fontSize: 14, color: MUTED, fontFamily: 'BebasNeue_400Regular' },

  pillRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: {
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER,
  },
  pillActive: { backgroundColor: GOLD, borderColor: GOLD },
  pillText: { fontSize: 13, fontWeight: '500', color: MUTED, fontFamily: 'BebasNeue_400Regular' },
  pillTextActive: { color: '#1C1410', fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 80, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: CREAM, fontFamily: 'BebasNeue_400Regular' },
  emptySub: { fontSize: 14, color: MUTED, textAlign: 'center', paddingHorizontal: 24, fontFamily: 'BebasNeue_400Regular' },
  emptyBtn: {
    marginTop: 8, backgroundColor: GOLD,
    borderRadius: 28, paddingHorizontal: 28, paddingVertical: 14,
  },
  emptyBtnText: { color: '#1C1410', fontSize: 15, fontWeight: '700', fontFamily: 'BebasNeue_400Regular' },
});

const sr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CARD,
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: CORAL, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#1C1410', fontFamily: 'BebasNeue_400Regular' },
  name: { fontSize: 15, fontWeight: '700', color: CREAM, fontFamily: 'BebasNeue_400Regular' },
  username: { fontSize: 12, color: MUTED, marginTop: 1, fontFamily: 'BebasNeue_400Regular' },
  followBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: GOLD,
  },
  followBtnActive: { backgroundColor: GOLD },
  followBtnText: { fontSize: 13, fontWeight: '700', color: GOLD, fontFamily: 'BebasNeue_400Regular' },
  followBtnTextActive: { color: '#1C1410' },
});

const ch = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, marginTop: 14 },
  heading: { flex: 1, fontSize: 13, fontWeight: '700', color: CREAM, fontFamily: 'BebasNeue_400Regular', letterSpacing: 0.4 },
  chevron: { fontSize: 14, color: MUTED },
  row: { paddingHorizontal: 16, gap: 10, paddingBottom: 8 },
  card: {
    width: 130, backgroundColor: CARD,
    borderRadius: 12, padding: 10, gap: 3,
    borderWidth: 1, borderColor: BORDER,
    borderLeftWidth: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  emoji: { fontSize: 18 },
  daysLeft: { fontSize: 10, fontWeight: '700', fontFamily: 'BebasNeue_400Regular' },
  title: { fontSize: 12, fontWeight: '700', color: CREAM, fontFamily: 'BebasNeue_400Regular' },
  meta: { fontSize: 10, color: MUTED, fontFamily: 'BebasNeue_400Regular' },
  track: { height: 3, backgroundColor: 'rgba(232,224,208,0.1)', borderRadius: 2, marginTop: 3 },
  fill: { height: 3, borderRadius: 2 },
  joinBtn: { marginTop: 6, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1 },
  joinText: { fontSize: 10, fontWeight: '700', fontFamily: 'BebasNeue_400Regular' },
});

const tr = StyleSheet.create({
  heading: { fontSize: 16, fontWeight: '700', color: CREAM, paddingHorizontal: 16, marginBottom: 10, marginTop: 16, fontFamily: 'BebasNeue_400Regular' },
  row: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CARD, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: BORDER },
  rank: { fontSize: 13, fontWeight: '800', color: GOLD, fontFamily: 'BebasNeue_400Regular' },
  name: { fontSize: 13, fontWeight: '600', color: CREAM, fontFamily: 'BebasNeue_400Regular' },
});
