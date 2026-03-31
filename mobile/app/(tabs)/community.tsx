import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { getPostImage } from '@/data/communityMockData';
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

type ActiveTab = 'foryou' | 'following' | 'challenges' | 'profile';

const TAB_LABELS: Record<ActiveTab, string> = { foryou: 'For You', following: 'Following', challenges: 'Challenges', profile: 'My Posts' };

const FILTER_OPTIONS: { key: CommunityFilter; label: string; emoji: string }[] = [
  { key: 'build_muscle', label: 'Muscle',      emoji: '💪' },
  { key: 'fat_loss',     label: 'Fat Loss',    emoji: '🔥' },
  { key: 'home_cooked',  label: 'Home Cooked', emoji: '🏠' },
  { key: 'eating_out',   label: 'Restaurant',  emoji: '🍽️' },
  { key: 'meal_prep',    label: 'Meal Prep',   emoji: '📦' },
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

  const [activeTab, setActiveTab] = useState<ActiveTab>('foryou');
  const [followingPosts, setFollowingPosts] = useState<CommunityPost[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [trendingVisible, setTrendingVisible] = useState(true);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CommunityFilter[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<Record<string, boolean>>({});

  // Search
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    loadPosts();
    AsyncStorage.getItem('trending_dismissed').then(v => { if (v === '1') setTrendingVisible(false); });
  }, []);

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

  const filteredPosts = activeFilters.length > 0
    ? posts.filter(p => activeFilters.some(f => {
        if (f === 'home_cooked' || f === 'eating_out' || f === 'meal_prep') return p.postType === f;
        return (p as any).fitnessGoal === f;
      }))
    : posts;
  const displayedPosts = activeTab === 'following' ? followingPosts : filteredPosts;
  const isLoading = activeTab === 'following' ? followingLoading : (loading && posts.length === 0);

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

  // ── Tab bar ──────────────────────────────────────────────────────────────────
  function TabBar() {
    return (
      <View style={tb.row}>
        {(Object.keys(TAB_LABELS) as ActiveTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={tb.tab}
            activeOpacity={0.75}
            onPress={() => {
              setActiveTab(tab);
              if (tab === 'following') loadFollowingPosts();
            }}
          >
            <Text style={[tb.tabText, activeTab === tab && tb.tabTextActive]}>
              {TAB_LABELS[tab]}
            </Text>
            {activeTab === tab && <View style={tb.indicator} />}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={tb.filterBtn} onPress={() => setFilterSheetOpen(true)} activeOpacity={0.7}>
          <SymbolView
            name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }}
            tintColor={activeFilters.length > 0 ? GOLD : MUTED}
            size={18}
          />
          {activeFilters.length > 0 && <View style={tb.filterDot} />}
        </TouchableOpacity>
      </View>
    );
  }

  // ── Trending strip ────────────────────────────────────────────────────────────
  function TrendingStrip() {
    if (!trendingVisible) return null;
    return (
      <View style={ts.strip}>
        <Text style={ts.fireLabel}>🔥</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, gap: 0 }}>
            {TRENDING.map((dish, i) => (
              <View key={dish} style={ts.chip}>
                <Text style={ts.rank}>#{i + 1}</Text>
                <Text style={ts.name}>{dish}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity
          onPress={() => { setTrendingVisible(false); AsyncStorage.setItem('trending_dismissed', '1'); }}
          style={ts.dismiss}
        >
          <Text style={ts.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── My Posts tab ───────────────────────────────────────────────────────────────
  const myPosts = posts.filter(p => p.userId === currentUserId);
  const totalLikes = myPosts.reduce((sum, p) => sum + p.likes, 0);

  function MyPostsTab() {
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
        {/* Stats row */}
        <View style={mp.statsCard}>
          {[
            { label: 'Posts', value: String(myPosts.length) },
            { label: 'Likes', value: String(totalLikes) },
            { label: 'Streak', value: '\u2014' },
          ].map((stat, i) => (
            <View key={stat.label} style={[mp.statCell, i > 0 && mp.statBorder]}>
              <Text style={mp.statVal}>{stat.value}</Text>
              <Text style={mp.statLbl}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {myPosts.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🍽️</Text>
            <Text style={s.emptyTitle}>No posts yet</Text>
            <Text style={s.emptySub}>Share a meal in the For You tab to see it here</Text>
          </View>
        ) : (
          myPosts.map(post => {
            const localImg = getPostImage(post.id);
            return (
              <View key={post.id} style={mp.postCard}>
                <View style={mp.thumb}>
                  {localImg ? (
                    <Image source={localImg} style={mp.thumbImg} resizeMode="cover" />
                  ) : post.imageUri ? (
                    <Image source={{ uri: post.imageUri }} style={mp.thumbImg} resizeMode="cover" />
                  ) : (
                    <View style={mp.thumbPlaceholder}><Text style={{ fontSize: 28 }}>🥗</Text></View>
                  )}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={mp.postName} numberOfLines={1}>{post.mealName}</Text>
                  <Text style={mp.postMeta}>{post.timeAgo} · {post.nutrition.calories} cal · ♥ {post.likes}</Text>
                  <View style={mp.macroRow}>
                    <Text style={mp.macroChip}>P {post.nutrition.protein}g</Text>
                    <Text style={mp.macroChip}>C {post.nutrition.carbs}g</Text>
                    <Text style={mp.macroChip}>F {post.nutrition.fat}g</Text>
                  </View>
                </View>
                <TouchableOpacity style={mp.deleteBtn} onPress={() => handleDeletePost(post)} activeOpacity={0.7}>
                  <Text style={mp.deleteTxt}>🗑</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────────
  function EmptyState() {
    if (activeTab === 'following') {
      return (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>👥</Text>
          <Text style={s.emptyTitle}>No posts yet</Text>
          <Text style={s.emptySub}>Follow people to see their meals here</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => setActiveTab('foryou')} activeOpacity={0.8}>
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

  // ── Challenges tab ────────────────────────────────────────────────────────────
  function ChallengesTab() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12, paddingTop: 12 }}
      >
        {CHALLENGES.map((c) => {
          const joined = joinedChallenges[c.id] ?? false;
          return (
            <View key={c.id} style={[chal.card, { borderLeftColor: c.accent }]}>
              <View style={chal.top}>
                <Text style={chal.emoji}>{c.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={chal.title}>{c.title}</Text>
                  <Text style={chal.meta}>{c.members.toLocaleString()} members · {c.daysLeft}d left</Text>
                </View>
                <Text style={[chal.daysTag, { color: c.accent }]}>{c.daysLeft}d</Text>
              </View>
              <View style={chal.track}>
                <View style={[chal.fill, { width: `${Math.round(c.progress * 100)}%` as any, backgroundColor: c.accent }]} />
              </View>
              <View style={chal.bottom}>
                <Text style={chal.progressText}>{Math.round(c.progress * 100)}% complete</Text>
                <TouchableOpacity
                  style={[chal.joinBtn, joined && { backgroundColor: c.accent, borderColor: c.accent }]}
                  activeOpacity={0.8}
                  onPress={() => setJoinedChallenges(prev => ({ ...prev, [c.id]: !joined }))}
                >
                  <Text style={[chal.joinText, joined && { color: '#1C1410' }]}>{joined ? '✓ Joined' : 'Join'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // ── Filter sheet ──────────────────────────────────────────────────────────────
  function FilterSheet() {
    return (
      <Modal visible={filterSheetOpen} transparent animationType="slide" onRequestClose={() => setFilterSheetOpen(false)}>
        <TouchableOpacity style={fs.backdrop} activeOpacity={1} onPress={() => setFilterSheetOpen(false)} />
        <View style={fs.sheet}>
          <View style={fs.handle} />
          <Text style={fs.title}>Filter Feed</Text>
          <View style={fs.options}>
            {FILTER_OPTIONS.map((opt) => {
              const active = activeFilters.includes(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[fs.option, active && fs.optionActive]}
                  activeOpacity={0.75}
                  onPress={() =>
                    setActiveFilters(prev => active ? prev.filter(k => k !== opt.key) : [...prev, opt.key])
                  }
                >
                  <Text style={fs.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[fs.optionLabel, active && fs.optionLabelActive]}>{opt.label}</Text>
                  {active && <Text style={fs.optionCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 12, paddingTop: 8 }}>
            <TouchableOpacity style={fs.clearBtn} onPress={() => setActiveFilters([])} activeOpacity={0.8}>
              <Text style={fs.clearBtnText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={fs.applyBtn} onPress={() => setFilterSheetOpen(false)} activeOpacity={0.8}>
              <Text style={fs.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
        <>
          <TabBar />
          {activeTab === 'profile' ? (
            <MyPostsTab />
          ) : activeTab === 'challenges' ? (
            <ChallengesTab />
          ) : isLoading ? (
            <ActivityIndicator color={GOLD} size="large" style={{ marginTop: 60 }} />
          ) : (
            <FlatList
              data={displayedPosts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100, paddingTop: 12 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={activeTab === 'following' ? loadFollowingPosts : handleRefresh}
                  tintColor={GOLD}
                />
              }
              ListHeaderComponent={<TrendingStrip />}
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
          )}
          <FilterSheet />
        </>
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
  headerTitle: { flex: 1, fontSize: 36, fontWeight: '800', fontFamily: 'BebasNeue_400Regular', letterSpacing: -0.6, color: CREAM },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: CARD,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
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
  empty: { alignItems: 'center', paddingVertical: 80, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: CREAM, fontFamily: 'BebasNeue_400Regular' },
  emptySub: { fontSize: 14, color: MUTED, textAlign: 'center', paddingHorizontal: 24, fontFamily: 'BebasNeue_400Regular' },
  emptyBtn: { marginTop: 8, backgroundColor: GOLD, borderRadius: 28, paddingHorizontal: 28, paddingVertical: 14 },
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
  followBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: GOLD },
  followBtnActive: { backgroundColor: GOLD },
  followBtnText: { fontSize: 13, fontWeight: '700', color: GOLD, fontFamily: 'BebasNeue_400Regular' },
  followBtnTextActive: { color: '#1C1410' },
});

// Tab bar
const tb = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,220,150,0.1)',
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
  tabText: { fontSize: 18, fontWeight: '600', color: MUTED, fontFamily: 'BebasNeue_400Regular', letterSpacing: 0.3 },
  tabTextActive: { color: CREAM },
  indicator: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2, backgroundColor: GOLD, borderRadius: 1,
  },
  filterBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    position: 'relative',
  },
  filterDot: {
    position: 'absolute', top: 6, right: 6,
    width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD,
  },
});

// Trending strip
const ts = StyleSheet.create({
  strip: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 10, marginBottom: 4,
    backgroundColor: 'rgba(245,200,66,0.06)',
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10,
    borderWidth: 1, borderColor: 'rgba(245,200,66,0.12)',
  },
  fireLabel: { fontSize: 14, marginRight: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rank: { fontSize: 12, fontWeight: '800', color: GOLD, fontFamily: 'BebasNeue_400Regular' },
  name: { fontSize: 12, fontWeight: '600', color: CREAM, fontFamily: 'BebasNeue_400Regular', marginRight: 10 },
  dismiss: { paddingHorizontal: 6, paddingVertical: 4 },
  dismissText: { fontSize: 12, color: MUTED },
});

// Filter sheet
const fs = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: '#1C1410',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: BORDER,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(232,224,208,0.2)', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: CREAM, fontFamily: 'BebasNeue_400Regular', marginBottom: 16 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
  },
  optionActive: { backgroundColor: 'rgba(245,200,66,0.12)', borderColor: GOLD },
  optionEmoji: { fontSize: 16 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: MUTED, fontFamily: 'BebasNeue_400Regular' },
  optionLabelActive: { color: GOLD },
  optionCheck: { fontSize: 12, color: GOLD, fontWeight: '700' },
  clearBtn: { flex: 1, paddingVertical: 14, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  clearBtnText: { fontSize: 15, fontWeight: '700', color: MUTED, fontFamily: 'BebasNeue_400Regular' },
  applyBtn: { flex: 2, paddingVertical: 14, borderRadius: 20, alignItems: 'center', backgroundColor: GOLD },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#1C1410', fontFamily: 'BebasNeue_400Regular' },
});

// Challenge cards (Challenges tab)
const chal = StyleSheet.create({
  card: {
    backgroundColor: CARD, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  emoji: { fontSize: 28 },
  title: { fontSize: 17, fontWeight: '800', color: CREAM, fontFamily: 'BebasNeue_400Regular' },
  meta: { fontSize: 12, color: MUTED, marginTop: 2, fontFamily: 'BebasNeue_400Regular' },
  daysTag: { fontSize: 13, fontWeight: '800', fontFamily: 'BebasNeue_400Regular' },
  track: { height: 4, backgroundColor: 'rgba(232,224,208,0.08)', borderRadius: 2, marginBottom: 12 },
  fill: { height: 4, borderRadius: 2 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText: { fontSize: 12, color: MUTED, fontFamily: 'BebasNeue_400Regular' },
  joinBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: GOLD },
  joinText: { fontSize: 14, fontWeight: '700', color: GOLD, fontFamily: 'BebasNeue_400Regular' },
});

// My Posts tab
const mp = StyleSheet.create({
  statsCard: { flexDirection: 'row', backgroundColor: CARD, borderRadius: 16, marginHorizontal: 16, marginBottom: 12, paddingVertical: 16, borderWidth: 1, borderColor: BORDER },
  statCell: { flex: 1, alignItems: 'center', gap: 2 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,220,150,0.08)' },
  statVal: { fontSize: 20, fontWeight: '800', color: CREAM },
  statLbl: { fontSize: 11, fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.4 },
  postCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 16, padding: 12, marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: BORDER },
  thumb: { width: 60, height: 60, borderRadius: 12, overflow: 'hidden', backgroundColor: '#252018' },
  thumbImg: { width: 60, height: 60 },
  thumbPlaceholder: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: '#252018' },
  postName: { fontSize: 14, fontWeight: '700', color: CREAM },
  postMeta: { fontSize: 11, color: MUTED },
  macroRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  macroChip: { fontSize: 10, fontWeight: '600', color: GOLD, backgroundColor: 'rgba(245,200,66,0.10)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  deleteBtn: { padding: 8 },
  deleteTxt: { fontSize: 18 },
});
