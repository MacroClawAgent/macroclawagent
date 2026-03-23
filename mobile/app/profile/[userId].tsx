import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
const BG = '#EEF4FA';

function goalStyle(goal: UserGoal): { bg: string; color: string; label: string } {
  switch (goal) {
    case 'build_muscle': return { bg: 'rgba(34,197,94,0.1)',   color: '#16A34A', label: '💪 Build Muscle' };
    case 'fat_loss':     return { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626', label: '🔥 Fat Loss' };
    case 'performance':  return { bg: 'rgba(245,158,11,0.1)',  color: '#D97706', label: '⚡ Performance' };
    default:             return { bg: 'rgba(59,130,246,0.1)',  color: '#2563EB', label: '⚖️ Maintenance' };
  }
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

function StatItem({ value, label, onPress }: { value: string | number; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={s.statItem} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
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

  return (
    <Screen style={{ backgroundColor: BG }}>
      <LinearGradient colors={[BG, '#F5F8FC']} style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Nav bar */}
        <View style={s.navbar}>
          <TouchableOpacity onPress={() => router.back()} style={s.navBtn} activeOpacity={0.7}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.navTitle}>Profile</Text>
          {isOwn ? (
            <TouchableOpacity onPress={() => setShowEdit(true)} style={s.navBtn} activeOpacity={0.7}>
              <Text style={s.editText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.navBtn} />
          )}
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <Avatar profile={displayed} editable={isOwn} onPress={handleAvatarPress} />

          <Text style={s.name}>{displayed.name}</Text>
          <Text style={s.username}>{displayed.username}</Text>

          <View style={[s.goalBadge, { backgroundColor: gs.bg }]}>
            <Text style={[s.goalBadgeText, { color: gs.color }]}>{gs.label}</Text>
          </View>

          {displayed.bio ? <Text style={s.bio}>{displayed.bio}</Text> : null}

          {displayed.instagramHandle ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://instagram.com/${displayed.instagramHandle}`).catch(() => {})}
              activeOpacity={0.75}
            >
              <Text style={s.instagram}>📷 @{displayed.instagramHandle}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Follow button — other profiles only */}
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

        {/* Stats row */}
        <View style={s.statsRow}>
          <StatItem value={displayed.postsCount} label="Posts" />
          <View style={s.statDivider} />
          <StatItem
            value={displayed.followersCount}
            label="Followers"
            onPress={() => setShowFollowers(true)}
          />
          <View style={s.statDivider} />
          <StatItem
            value={displayed.followingCount}
            label="Following"
            onPress={() => setShowFollowing(true)}
          />
          <View style={s.statDivider} />
          <StatItem value={`${displayed.streak}🔥`} label="Streak" />
        </View>

        {/* Jonno Stats card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Jonno Stats</Text>
          <View style={s.jonnoGrid}>
            <View style={s.jonnoStat}>
              <Text style={s.jonnoEmoji}>🍽️</Text>
              <Text style={s.jonnoVal}>{displayed.mealsLogged}</Text>
              <Text style={s.jonnoLabel}>Meals Logged</Text>
            </View>
            <View style={s.jonnoStat}>
              <Text style={s.jonnoEmoji}>📅</Text>
              <Text style={s.jonnoVal}>{displayed.weeksOnJonno}</Text>
              <Text style={s.jonnoLabel}>Weeks on Jonno</Text>
            </View>
            <View style={s.jonnoStat}>
              <Text style={s.jonnoEmoji}>🎯</Text>
              <Text style={s.jonnoVal}>{displayed.goalLabel}</Text>
              <Text style={s.jonnoLabel}>Current Goal</Text>
            </View>
            <View style={s.jonnoStat}>
              <Text style={s.jonnoEmoji}>✅</Text>
              <Text style={s.jonnoVal}>73%</Text>
              <Text style={s.jonnoLabel}>Goals Hit</Text>
            </View>
          </View>
        </View>

        {/* Top Cuisines */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Top Cuisines</Text>
          <View style={s.cuisineRow}>
            {displayed.topCuisines.map((c) => (
              <View key={c} style={s.cuisinePill}>
                <Text style={s.cuisineText}>{c}</Text>
              </View>
            ))}
          </View>
          <Text style={s.sectionSub}>Based on meal history</Text>
        </View>

        {/* Posts grid */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Posts</Text>
            <View style={s.countBadge}>
              <Text style={s.countBadgeText}>{displayed.posts.length}</Text>
            </View>
          </View>

          {displayed.posts.length === 0 ? (
            <View style={s.noPostsBox}>
              <Text style={s.noPostsText}>No posts yet</Text>
              {isOwn && <Text style={s.noPostsSub}>Share your first meal →</Text>}
            </View>
          ) : (
            <View style={s.grid}>
              {displayed.posts.map((post) => {
                const img = getPostImage(post.id);
                return (
                  <View key={post.id} style={s.gridItem}>
                    {img ? (
                      <Image source={img} style={s.gridImage} resizeMode="cover" />
                    ) : (
                      <LinearGradient
                        colors={post.postType === 'eating_out' ? ['#DBEAFE','#60A5FA'] : post.postType === 'meal_prep' ? ['#EDE9FE','#A78BFA'] : ['#D1FAE5','#34D399']}
                        style={s.gridImage}
                      />
                    )}
                    <View style={s.gridOverlay}>
                      <Text style={s.gridMealName} numberOfLines={1}>{post.mealName}</Text>
                      <Text style={s.gridCal}>{post.nutrition.calories} kcal</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Edit sheet */}
      {isOwn && (
        <EditProfileSheet
          visible={showEdit}
          profile={displayed}
          onClose={() => setShowEdit(false)}
          onSaved={(updates) => setLocalProfile((prev) => prev ? { ...prev, ...updates } : null)}
        />
      )}

      {/* Followers modal */}
      <FollowListModal
        visible={showFollowers}
        title="Followers"
        profiles={followerProfiles}
        onClose={() => setShowFollowers(false)}
      />

      {/* Following modal */}
      <FollowListModal
        visible={showFollowing}
        title="Following"
        profiles={followingProfiles}
        onClose={() => setShowFollowing(false)}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8,
  },
  navBtn: { width: 56, alignItems: 'flex-start' },
  backArrow: { fontSize: 22, color: '#1E293B' },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  editText: { fontSize: 15, fontWeight: '600', color: TEAL, textAlign: 'right', width: 56 },

  hero: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8, gap: 6 },
  avatar: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: '#fff' },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 12, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  name: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginTop: 10 },
  username: { fontSize: 14, color: '#94A3B8' },
  goalBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 2 },
  goalBadgeText: { fontSize: 13, fontWeight: '600' },
  bio: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  instagram: { fontSize: 13, fontWeight: '500', color: TEAL },
  followBtn: {
    marginTop: 8, width: '80%', backgroundColor: TEAL, borderRadius: 24,
    paddingVertical: 12, alignItems: 'center',
    shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  followBtnFollowing: {
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: TEAL,
    shadowOpacity: 0,
  },
  followBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  followBtnTextFollowing: { color: TEAL },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20, marginHorizontal: 16, marginTop: 16,
    paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#B0C4D8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#E2E8F0' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20, marginHorizontal: 16, marginTop: 14,
    padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#B0C4D8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 14 },
  jonnoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  jonnoStat: {
    width: '47%', backgroundColor: '#F8FAFC', borderRadius: 14,
    padding: 12, gap: 3,
  },
  jonnoEmoji: { fontSize: 20 },
  jonnoVal: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 2 },
  jonnoLabel: { fontSize: 11, color: '#94A3B8' },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  sectionSub: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
  countBadge: {
    backgroundColor: TEAL, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, marginBottom: 10,
  },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  cuisineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cuisinePill: {
    backgroundColor: 'rgba(45,212,191,0.08)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)',
  },
  cuisineText: { fontSize: 13, fontWeight: '500', color: TEAL },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  gridItem: { width: '48.5%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', padding: 8,
  },
  gridMealName: { fontSize: 11, fontWeight: '700', color: '#fff' },
  gridCal: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 },

  noPostsBox: { alignItems: 'center', paddingVertical: 32, gap: 6 },
  noPostsText: { fontSize: 15, color: '#94A3B8', fontWeight: '500' },
  noPostsSub: { fontSize: 13, color: TEAL, fontWeight: '600' },
});

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
    borderWidth: 1.5, borderColor: TEAL,
  },
  followBtnActive: { backgroundColor: TEAL },
  followBtnText: { fontSize: 12, fontWeight: '700', color: TEAL },
  followBtnTextActive: { color: '#fff' },
});
