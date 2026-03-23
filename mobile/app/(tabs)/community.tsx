import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { CommunityPostCard } from '@/components/Community/CommunityPostCard';
import { CreatePostSheet } from '@/components/Community/CreatePostSheet';
import { useCommunity } from '@/hooks/useCommunity';
import { getFollowingFeedPosts } from '@/services/profileService';
import type { CommunityFilter, CommunityPost } from '@/types/community';

const TEAL = '#2DD4BF';
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

  useEffect(() => { loadPosts(); }, []);

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

  const isFollowing = activePill === 'following';
  const displayedPosts = isFollowing ? followingPosts : posts;
  const isLoading = isFollowing ? followingLoading : (loading && posts.length === 0);

  function PillRow() {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pillRow}
      >
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
    if (isFollowing) {
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
        <Text style={s.headerTitle}>Community</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}>
            <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              tintColor="#374151" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}
            onPress={() => router.push('/profile/current-user' as any)}>
            <SymbolView name={{ ios: 'person.circle', android: 'account_circle', web: 'account_circle' }}
              tintColor="#374151" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
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
              onRefresh={isFollowing ? loadFollowingPosts : handleRefresh}
              tintColor={TEAL}
            />
          }
          ListHeaderComponent={<PillRow />}
          ListEmptyComponent={<EmptyState />}
          renderItem={({ item }) => (
            <CommunityPostCard post={item} onLike={handleLike} />
          )}
        />
      )}

      <CreatePostSheet visible={showCreatePost} onClose={closeCreatePost} onSubmit={submitPost} />
    </Screen>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, color: '#111827' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },

  pillRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: {
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
  },
  pillActive: { backgroundColor: TEAL, borderColor: TEAL },
  pillText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  pillTextActive: { color: '#fff', fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 80, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },
  emptyBtn: {
    marginTop: 8, backgroundColor: TEAL,
    borderRadius: 28, paddingHorizontal: 28, paddingVertical: 14,
  },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
