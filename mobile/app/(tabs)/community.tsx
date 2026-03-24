import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { CommunityPostCard } from '@/components/Community/CommunityPostCard';
import { CreatePostSheet } from '@/components/Community/CreatePostSheet';
import { useCommunity } from '@/hooks/useCommunity';
import { consumePendingCommunityPost } from '@/lib/communityStore';
import { getFollowingFeedPosts } from '@/services/profileService';
import { MOCK_PROFILES, setFollowing } from '@/data/profileMockData';
import type { CommunityFilter, CommunityPost, UserProfile } from '@/types/community';

const TEAL = '#2DD4BF';
const BLUE = '#3B6FD4';
const BG = '#EEF4FA';

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
  const {
    posts,
    loading,
    refreshing,
    showCreatePost,
    loadPosts,
    handleLike,
    handleRefresh,
    setFilter,
    openCreatePost,
    closeCreatePost,
    submitPost,
  } = useCommunity();

  const [activePill, setActivePill] = useState<ActivePill>('all');
  const [followingPosts, setFollowingPosts] = useState<CommunityPost[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);

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

  return (
    <Screen style={{ backgroundColor: BG }}>
      <LinearGradient colors={[BG, '#F5F8FC']} style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} pointerEvents="none" />

      {/* Header */}
      <View style={s.header}>
        {searchActive ? (
          // ── Search mode header ──
          <>
            <View style={s.searchBar}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                tintColor="#94A3B8" size={16} />
              <TextInput
                ref={searchRef}
                style={s.searchInput}
                placeholder="Search by username…"
                placeholderTextColor="#94A3B8"
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
                  tintColor="#374151" size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}
                onPress={() => router.push('/profile/current-user' as any)}>
                <SymbolView name={{ ios: 'person.circle', android: 'account_circle', web: 'account_circle' }}
                  tintColor="#374151" size={22} />
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
          <ActivityIndicator color={TEAL} size="large" style={{ marginTop: 60 }} />
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
                tintColor={TEAL}
              />
            }
            ListHeaderComponent={<PillRow />}
            ListEmptyComponent={<EmptyState />}
            renderItem={({ item }) => (
              <CommunityPostCard post={item} onLike={handleLike} />
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
  headerTitle: { flex: 1, fontSize: 28, fontWeight: '800', letterSpacing: -0.6, color: '#111827' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },

  // Search bar
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1.5, borderColor: BLUE,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  clearBtn: { fontSize: 14, color: '#94A3B8', paddingHorizontal: 2 },
  cancelBtn: { paddingHorizontal: 4 },
  cancelText: { fontSize: 15, color: BLUE, fontWeight: '600' },

  searchHint: { flex: 1, alignItems: 'center', paddingTop: 60 },
  searchHintText: { fontSize: 14, color: '#94A3B8' },

  pillRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: {
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
  },
  pillActive: { backgroundColor: BLUE, borderColor: BLUE },
  pillText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  pillTextActive: { color: '#fff', fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 80, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },
  emptyBtn: {
    marginTop: 8, backgroundColor: BLUE,
    borderRadius: 28, paddingHorizontal: 28, paddingVertical: 14,
  },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

const sr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#B0C4D8', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  name: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  username: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  followBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: BLUE,
  },
  followBtnActive: { backgroundColor: BLUE },
  followBtnText: { fontSize: 13, fontWeight: '700', color: BLUE },
  followBtnTextActive: { color: '#fff' },
});
