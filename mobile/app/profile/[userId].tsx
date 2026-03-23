import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { EditProfileSheet } from '@/components/Profile/EditProfileSheet';
import { useProfile } from '@/hooks/useProfile';
import { MOCK_PROFILES } from '@/data/profileMockData';
import { getPostImage } from '@/data/communityMockData';
import type { UserProfile, UserGoal } from '@/types/community';
import { updateAvatar } from '@/services/profileService';

const TEAL = '#2DD4BF';
const BLUE = '#3B6FD4';
const BG = '#EEF4FA';
const SCREEN_W = Dimensions.get('window').width;
const GRID_ITEM_W = (SCREEN_W - 48) / 2;

type ActiveTab = 'posts' | 'stats' | 'about';

function goalStyle(goal: UserGoal): { bg: string; color: string; label: string } {
  switch (goal) {
    case 'build_muscle': return { bg: 'rgba(34,197,94,0.1)',   color: '#16A34A', label: '💪 Build Muscle' };
    case 'fat_loss':     return { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626', label: '🔥 Fat Loss' };
    case 'performance':  return { bg: 'rgba(245,158,11,0.1)',  color: '#D97706', label: '⚡ Performance' };
    default:             return { bg: 'rgba(59,130,246,0.1)',  color: '#2563EB', label: '⚖️ Maintenance' };
  }
}

function mealEmoji(postType: string): string {
  if (postType === 'eating_out') return '🍽️';
  if (postType === 'meal_prep') return '📦';
  return '🥗';
}

function gridGradient(postType: string): [string, string] {
  if (postType === 'eating_out') return ['#DBEAFE', '#60A5FA'];
  if (postType === 'meal_prep')  return ['#EDE9FE', '#A78BFA'];
  return ['#D1FAE5', '#34D399'];
}

function Avatar({ profile, editable, onPress, size = 80 }: {
  profile: UserProfile; editable?: boolean; onPress?: () => void; size?: number;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={!editable} activeOpacity={0.8} style={{ position: 'relative' }}>
      {profile.avatarUri ? (
        <Image source={{ uri: profile.avatarUri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[s.avatarText, { fontSize: size * 0.38 }]}>{profile.initial}</Text>
        </View>
      )}
      {editable && (
        <View style={s.cameraOverlay}>
          <Text style={{ fontSize: 12 }}>📷</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function FollowListModal({ visible, title, profiles, onClose }: {
  visible: boolean; title: string; profiles: UserProfile[]; onClose: () => void;
}) {
  const router = useRouter();
  const [followStates, setFollowStates] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    profiles.forEach((p) => { state[p.id] = p.isFollowing; });
    return state;
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={fl.container}>
        <View style={fl.header}>
          <Text style={fl.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={fl.closeBtn}>
            <Text style={fl.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={profiles}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 12 }}
          renderItem={({ item }) => {
            const following = followStates[item.id] ?? item.isFollowing;
            return (
              <TouchableOpacity style={fl.row} activeOpacity={0.75}
                onPress={() => { onClose(); router.push(`/profile/${item.id}` as any); }}>
                <View style={fl.avatar}>
                  <Text style={fl.avatarText}>{item.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={fl.name}>{item.name}</Text>
                  <Text style={fl.username}>{item.username}</Text>
                </View>
                {!item.isCurrentUser && (
                  <TouchableOpacity
                    style={[fl.followBtn, following && fl.followBtnActive]}
                    activeOpacity={0.75}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setFollowStates((prev) => ({ ...prev, [item.id]: !following }));
                    }}
                  >
                    <Text style={[fl.followBtnText, following && fl.followBtnTextActive]}>
                      {following ? 'Following ✓' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { profile, loading, isFollowLoading, loadProfile, handleFollow } = useProfile();
  const [showEdit, setShowEdit] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('posts');

  const displayed = localProfile ?? profile;

  useEffect(() => {
    loadProfile(userId);
  }, [userId]);

  useEffect(() => {
    setLocalProfile(null);
  }, [profile]);

  async function handleAvatarPress() {
    if (!displayed?.isCurrentUser) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      await updateAvatar(uri);
      setLocalProfile((prev) => prev ? { ...prev, avatarUri: uri } : null);
    }
  }

  function handleUnfollow() {
    if (!displayed) return;
    Alert.alert(
      `Unfollow ${displayed.username}?`,
      'You will no longer see their posts in your Following feed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unfollow', style: 'destructive', onPress: handleFollow },
      ]
    );
  }

  const followerProfiles = MOCK_PROFILES.filter((p) => !p.isCurrentUser).slice(0, 6);
  const followingProfiles = MOCK_PROFILES.filter((p) => p.isFollowing || p.id === 'user-2');

  if (loading || !displayed) {
    return (
      <Screen style={{ backgroundColor: BG }}>
        <ActivityIndicator color={TEAL} size="large" style={{ marginTop: 80 }} />
      </Screen>
    );
  }

  const gs = goalStyle(displayed.goal);
  const isOwn = displayed.isCurrentUser;

  const memberSince = (() => {
    const ms = Date.now() - displayed.weeksOnJonno * 7 * 24 * 60 * 60 * 1000;
    return new Date(ms).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  })();

  // ── Posts tab ────────────────────────────────────────────────────────────────
  function PostsTab() {
    if (displayed!.posts.length === 0) {
      return (
        <View style={t.emptyState}>
          <Text style={t.emptyEmoji}>📷</Text>
          <Text style={t.emptyTitle}>No posts yet</Text>
          <Text style={t.emptySub}>
            {isOwn ? 'Scan a meal and share it with the community' : `${displayed!.username} hasn't posted yet`}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={t.gridScroll}>
        <View style={t.grid}>
          {displayed!.posts.map((post) => {
            const img = getPostImage(post.id);
            return (
              <View key={post.id} style={t.gridItem}>
                {img ? (
                  <Image source={img} style={t.gridImg} resizeMode="cover" />
                ) : post.imageUri ? (
                  <Image source={{ uri: post.imageUri }} style={t.gridImg} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={gridGradient(post.postType)} style={t.gridImg}>
                    <Text style={t.gridEmoji}>{mealEmoji(post.postType)}</Text>
                  </LinearGradient>
                )}
                <View style={t.gridOverlay}>
                  <Text style={t.gridMealName} numberOfLines={1}>{post.mealName}</Text>
                  <Text style={t.gridCal}>{post.nutrition.calories} kcal</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // ── Stats tab ────────────────────────────────────────────────────────────────
  function StatsTab() {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={t.tabScroll}>
        {/* This Week card */}
        <View style={t.glassCard}>
          <Text style={t.cardLabel}>THIS WEEK</Text>
          <View style={t.statsRow3}>
            <View style={t.stat3}>
              <Text style={t.stat3Val}>{displayed!.mealsLogged}</Text>
              <Text style={t.stat3Label}>meals logged</Text>
            </View>
            <View style={t.stat3Divider} />
            <View style={t.stat3}>
              <Text style={t.stat3Val}>{displayed!.weeksOnJonno}</Text>
              <Text style={t.stat3Label}>weeks on Jonno</Text>
            </View>
            <View style={t.stat3Divider} />
            <View style={t.stat3}>
              <Text style={t.stat3Val}>73%</Text>
              <Text style={t.stat3Label}>goals hit</Text>
            </View>
          </View>
        </View>

        {/* Current Goal card */}
        <View style={[t.glassCard, { marginTop: 12 }]}>
          <Text style={t.cardLabel}>CURRENT GOAL</Text>
          <View style={t.goalRow}>
            <View style={[t.goalBadgeSm, { backgroundColor: gs.bg }]}>
              <Text style={[t.goalBadgeSmText, { color: gs.color }]}>{gs.label}</Text>
            </View>
            <View style={t.activeBadge}>
              <Text style={t.activeBadgeText}>Active</Text>
            </View>
          </View>
          <Text style={t.goalSub}>Week {displayed!.weeksOnJonno} of your {displayed!.goalLabel} journey</Text>
        </View>

        {/* Top Cuisines card */}
        <View style={[t.glassCard, { marginTop: 12 }]}>
          <Text style={t.cardLabel}>TOP CUISINES</Text>
          <Text style={t.cuisineSubtitle}>Based on your meal history</Text>
          <View style={t.cuisineWrap}>
            {displayed!.topCuisines.map((c) => (
              <View key={c} style={t.cuisinePill}>
                <Text style={t.cuisineText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── About tab ────────────────────────────────────────────────────────────────
  function AboutTab() {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={t.tabScroll}>
        <View style={t.glassCard}>
          {/* Name */}
          <View style={t.aboutRow}>
            <Text style={t.aboutLabel}>Name</Text>
            <Text style={t.aboutValue}>{displayed!.name}</Text>
          </View>
          <View style={t.aboutDivider} />
          {/* Username */}
          <View style={t.aboutRow}>
            <Text style={t.aboutLabel}>Username</Text>
            <Text style={[t.aboutValue, { color: TEAL }]}>{displayed!.username}</Text>
          </View>
          <View style={t.aboutDivider} />
          {/* Goal */}
          <View style={t.aboutRow}>
            <Text style={t.aboutLabel}>Goal</Text>
            <View style={[t.goalBadgeSm, { backgroundColor: gs.bg }]}>
              <Text style={[t.goalBadgeSmText, { color: gs.color }]}>{gs.label}</Text>
            </View>
          </View>
          {/* Instagram */}
          {displayed!.instagramHandle ? (
            <>
              <View style={t.aboutDivider} />
              <TouchableOpacity
                style={t.aboutRow}
                activeOpacity={0.75}
                onPress={() => Linking.openURL(`https://instagram.com/${displayed!.instagramHandle}`).catch(() => {})}
              >
                <Text style={t.aboutLabel}>Instagram</Text>
                <Text style={[t.aboutValue, { color: TEAL }]}>@{displayed!.instagramHandle}</Text>
              </TouchableOpacity>
            </>
          ) : null}
          <View style={t.aboutDivider} />
          {/* Member since */}
          <View style={t.aboutRow}>
            <Text style={t.aboutLabel}>Member since</Text>
            <Text style={t.aboutValue}>{memberSince}</Text>
          </View>
        </View>

        {/* Edit Profile button — own profile only */}
        {isOwn && (
          <TouchableOpacity style={t.editProfileBtn} onPress={() => setShowEdit(true)} activeOpacity={0.8}>
            <Text style={t.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'posts',  label: 'Posts'  },
    { key: 'stats',  label: 'Stats'  },
    { key: 'about',  label: 'About'  },
  ];

  return (
    <Screen style={{ backgroundColor: BG, flex: 1 }}>
      <LinearGradient colors={[BG, '#F5F8FC']} style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} pointerEvents="none" />

      {/* ── Navbar ── */}
      <View style={s.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={s.navBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Profile</Text>
        {isOwn ? (
          <TouchableOpacity onPress={() => setShowEdit(true)} style={s.navBtnRight} activeOpacity={0.7}>
            <Text style={s.editText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.navBtnRight} />
        )}
      </View>

      {/* ── Zone 1: Hero ── */}
      <View style={s.hero}>
        <Avatar profile={displayed} editable={isOwn} onPress={handleAvatarPress} />

        <Text style={s.name}>{displayed.name}</Text>
        <Text style={s.username}>{displayed.username}</Text>

        <View style={[s.goalBadge, { backgroundColor: gs.bg }]}>
          <Text style={[s.goalBadgeText, { color: gs.color }]}>{gs.label}</Text>
        </View>

        {displayed.bio ? (
          <Text style={s.bio} numberOfLines={2}>{displayed.bio}</Text>
        ) : null}

        {displayed.instagramHandle ? (
          <TouchableOpacity
            style={s.igPill}
            onPress={() => Linking.openURL(`https://instagram.com/${displayed.instagramHandle}`).catch(() => {})}
            activeOpacity={0.75}
          >
            <View style={s.igDot} />
            <Text style={s.igText}>@{displayed.instagramHandle}</Text>
            <Text style={s.igArrow}>→</Text>
          </TouchableOpacity>
        ) : null}

        {!isOwn && (
          <TouchableOpacity
            style={[s.followBtn, displayed.isFollowing && s.followBtnFollowing]}
            onPress={displayed.isFollowing ? handleUnfollow : handleFollow}
            disabled={isFollowLoading}
            activeOpacity={0.8}
          >
            {isFollowLoading ? (
              <ActivityIndicator color={displayed.isFollowing ? TEAL : '#fff'} size="small" />
            ) : (
              <Text style={[s.followBtnText, displayed.isFollowing && s.followBtnTextFollowing]}>
                {displayed.isFollowing ? 'Following ✓' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Zone 2: Stats bar ── */}
      <View style={s.statsBar}>
        <TouchableOpacity style={s.statItem} activeOpacity={1}>
          <Text style={s.statValue}>{displayed.postsCount}</Text>
          <Text style={s.statLabel}>Posts</Text>
        </TouchableOpacity>
        <View style={s.statDivider} />
        <TouchableOpacity style={s.statItem} onPress={() => setShowFollowers(true)} activeOpacity={0.7}>
          <Text style={s.statValue}>{displayed.followersCount}</Text>
          <Text style={s.statLabel}>Followers</Text>
        </TouchableOpacity>
        <View style={s.statDivider} />
        <TouchableOpacity style={s.statItem} onPress={() => setShowFollowing(true)} activeOpacity={0.7}>
          <Text style={s.statValue}>{displayed.followingCount}</Text>
          <Text style={s.statLabel}>Following</Text>
        </TouchableOpacity>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{displayed.streak}🔥</Text>
          <Text style={s.statLabel}>Streak</Text>
        </View>
      </View>

      {/* ── Zone 3: Tab bar ── */}
      <View style={s.tabBar}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabItem, active && s.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Zone 3: Tab content ── */}
      <View style={{ flex: 1 }}>
        {activeTab === 'posts'  && <PostsTab />}
        {activeTab === 'stats'  && <StatsTab />}
        {activeTab === 'about'  && <AboutTab />}
      </View>

      {/* Edit sheet */}
      {isOwn && (
        <EditProfileSheet
          visible={showEdit}
          profile={displayed}
          onClose={() => setShowEdit(false)}
          onSaved={(updates) => setLocalProfile({ ...displayed, ...updates })}
        />
      )}

      <FollowListModal
        visible={showFollowers}
        title="Followers"
        profiles={followerProfiles}
        onClose={() => setShowFollowers(false)}
      />
      <FollowListModal
        visible={showFollowing}
        title="Following"
        profiles={followingProfiles}
        onClose={() => setShowFollowing(false)}
      />
    </Screen>
  );
}

// ── Main screen styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8,
  },
  navBtn: { width: 56, alignItems: 'flex-start' },
  navBtnRight: { width: 56, alignItems: 'flex-end' },
  backArrow: { fontSize: 22, color: '#1E293B' },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  editText: { fontSize: 15, fontWeight: '600', color: TEAL },

  // Zone 1 — Hero
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 4, paddingBottom: 12, gap: 5 },
  avatar: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: '#fff' },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 12, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  name: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginTop: 8 },
  username: { fontSize: 14, color: '#94A3B8' },
  goalBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  goalBadgeText: { fontSize: 13, fontWeight: '600' },
  bio: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginHorizontal: 40 },

  // Instagram pill
  igPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 12, paddingVertical: 5,
  },
  igDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E1306C' },
  igText: { fontSize: 13, color: '#6B7280' },
  igArrow: { fontSize: 13, color: '#94A3B8' },

  // Follow button
  followBtn: {
    marginTop: 4, width: '80%', backgroundColor: TEAL, borderRadius: 24,
    paddingVertical: 12, alignItems: 'center',
    shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  followBtnFollowing: {
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: TEAL, shadowOpacity: 0,
  },
  followBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  followBtnTextFollowing: { color: TEAL },

  // Zone 2 — Stats bar
  statsBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: '#E2E8F0' },

  // Zone 3 — Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 2, borderBottomColor: '#F1F5F9',
  },
  tabItem: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -2,
  },
  tabItemActive: { borderBottomColor: TEAL },
  tabLabel: { fontSize: 14, fontWeight: '500', color: '#94A3B8' },
  tabLabelActive: { fontWeight: '600', color: '#1E293B' },
});

// ── Tab content styles ────────────────────────────────────────────────────────
const t = StyleSheet.create({
  // Posts tab
  gridScroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: {
    width: GRID_ITEM_W, height: GRID_ITEM_W,
    borderRadius: 16, overflow: 'hidden',
  },
  gridImg: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  gridEmoji: { fontSize: 36 },
  gridOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 44, backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 8, paddingVertical: 6, justifyContent: 'flex-end',
  },
  gridMealName: { fontSize: 11, fontWeight: '600', color: '#fff' },
  gridCal: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 },

  emptyState: { flex: 1, alignItems: 'center', paddingTop: 48, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  emptySub: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 32 },
  emptyBtn: {
    marginTop: 8, backgroundColor: TEAL, borderRadius: 24,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Shared tab scroll
  tabScroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  // Glass card (Stats + About)
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#B0C4D8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 3,
  },
  cardLabel: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 0.8, marginBottom: 14,
  },

  // Stats tab — 3-col row
  statsRow3: { flexDirection: 'row', alignItems: 'center' },
  stat3: { flex: 1, alignItems: 'center' },
  stat3Val: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  stat3Label: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4 },
  stat3Divider: { width: 1, height: 36, backgroundColor: '#E2E8F0' },

  // Stats tab — goal card
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  goalBadgeSm: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  goalBadgeSmText: { fontSize: 13, fontWeight: '600' },
  activeBadge: {
    backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '600', color: '#16A34A' },
  goalSub: { fontSize: 13, color: '#64748B' },

  // Stats tab — cuisines
  cuisineSubtitle: { fontSize: 12, color: '#94A3B8', marginBottom: 12, marginTop: -8 },
  cuisineWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cuisinePill: {
    backgroundColor: 'rgba(45,212,191,0.08)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)',
    margin: 2,
  },
  cuisineText: { fontSize: 13, fontWeight: '500', color: TEAL },

  // About tab rows
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
  },
  aboutDivider: { height: 1, backgroundColor: '#F1F5F9' },
  aboutLabel: { fontSize: 14, color: '#94A3B8' },
  aboutValue: { fontSize: 14, color: '#1E293B', fontWeight: '500' },

  editProfileBtn: {
    marginTop: 16, backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
  },
  editProfileBtnText: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
});

// ── Follow list modal styles ──────────────────────────────────────────────────
const fl = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFCFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 16, color: '#94A3B8' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 16,
    padding: 12, borderWidth: 1, borderColor: '#F1F5F9',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  name: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  username: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  followBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: BLUE,
  },
  followBtnActive: { backgroundColor: BLUE },
  followBtnText: { fontSize: 12, fontWeight: '700', color: BLUE },
  followBtnTextActive: { color: '#fff' },
});
