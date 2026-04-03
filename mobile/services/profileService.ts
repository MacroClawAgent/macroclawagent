import { supabase } from '@/lib/supabase';
import type { UserProfile, UserGoal, CommunityPost } from '@/types/community';
import { getUserPosts } from '@/services/communityService';
import { getMockProfile } from '@/data/profileMockData';
import { MOCK_POSTS } from '@/data/communityMockData';

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapGoal(raw: string | null): UserGoal {
  if (raw === 'build_muscle')  return 'build_muscle';
  if (raw === 'lose_weight' || raw === 'fat_loss') return 'fat_loss';
  if (raw === 'performance')   return 'performance';
  return 'maintenance';
}

function goalLabel(raw: string | null): string {
  const g = mapGoal(raw);
  if (g === 'build_muscle') return 'Build Muscle';
  if (g === 'fat_loss')     return 'Fat Loss';
  if (g === 'performance')  return 'Performance';
  return 'Maintenance';
}

function weeksOnApp(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / (7 * 86400000)));
}

async function buildProfile(
  row: any,
  currentUserId: string | null,
): Promise<UserProfile> {
  const userId = row.id as string;

  // Fetch counts in parallel
  const [postsResult, followersResult, followingResult, mealsResult, isFollowingResult] =
    await Promise.all([
      supabase.from('community_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId),
      supabase.from('food_log_items').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      currentUserId && currentUserId !== userId
        ? supabase.from('follows').select('follower_id').eq('follower_id', currentUserId).eq('following_id', userId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const postsCount     = postsResult.count    ?? 0;
  const followersCount = followersResult.count ?? 0;
  const followingCount = followingResult.count ?? 0;
  const mealsLogged    = mealsResult.count     ?? 0;
  const isFollowing    = !!isFollowingResult.data;

  const livePosts = await getUserPosts(userId);

  const name = row.full_name ?? 'User';
  return {
    id:             userId,
    name,
    username:       row.username ? `@${row.username}` : `@user${userId.slice(0, 6)}`,
    avatarUri:      row.avatar_url ?? undefined,
    initial:        name[0]?.toUpperCase() ?? 'U',
    bio:            row.bio ?? undefined,
    instagramHandle: row.instagram_handle ?? undefined,
    goal:           mapGoal(row.fitness_goal),
    goalLabel:      goalLabel(row.fitness_goal),
    streak:         0,
    weeksOnJonno:   weeksOnApp(row.created_at),
    mealsLogged,
    postsCount,
    followersCount,
    followingCount,
    isFollowing,
    isCurrentUser:  currentUserId === userId,
    topCuisines:    [],
    posts:          livePosts,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error || !data) throw new Error('Profile not found');

  return buildProfile(data, user.id);
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // Fall back to mock profile for demo accounts that don't exist in Supabase yet
  if (error || !data) {
    const mock = getMockProfile(userId);
    if (mock) {
      const mockPosts = MOCK_POSTS.filter((p) => p.userId === userId);
      return { ...mock, posts: mockPosts, postsCount: mockPosts.length, isCurrentUser: false };
    }
    throw new Error(`Profile ${userId} not found`);
  }

  return buildProfile(data, user?.id ?? null);
}

export async function searchUsers(query: string): Promise<UserProfile[]> {
  const q = query.toLowerCase().replace('@', '').trim();
  if (!q || q.length < 2) return [];

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
    .neq('id', user?.id ?? '')
    .limit(20);

  if (error || !data || data.length === 0) return [];
  return Promise.all(data.map(row => buildProfile(row, user?.id ?? null)));
}

export async function getFollowingIds(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);
  return (data ?? []).map((r: any) => r.following_id);
}

export async function followUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('follows').insert({ follower_id: user.id, following_id: userId });
}

export async function unfollowUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', userId);
}

export async function getFollowing(): Promise<UserProfile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('follows')
    .select('following:users!follows_following_id_fkey(*)')
    .eq('follower_id', user.id);
  if (!data) return [];
  return Promise.all(data.map((r: any) => buildProfile(r.following, user.id)));
}

export async function getFollowers(): Promise<UserProfile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('follows')
    .select('follower:users!follows_follower_id_fkey(*)')
    .eq('following_id', user.id);
  if (!data) return [];
  return Promise.all(data.map((r: any) => buildProfile(r.follower, user.id)));
}

export async function blockUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  // Remove follow in both directions
  await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', userId);
  await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', user.id);
  // TODO: Add to blocks table when implemented
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const dbUpdates: Record<string, any> = {};
  if (updates.name)             dbUpdates.full_name         = updates.name;
  if (updates.bio !== undefined) dbUpdates.bio              = updates.bio;
  if (updates.instagramHandle !== undefined) dbUpdates.instagram_handle = updates.instagramHandle;
  if (updates.username)         dbUpdates.username          = updates.username.replace('@', '');
  if (Object.keys(dbUpdates).length > 0) {
    await supabase.from('users').update(dbUpdates).eq('id', user.id);
  }
}

export async function updateAvatar(imageUri: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  try {
    const ext  = imageUri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const res  = await fetch(imageUri);
    const blob = await res.blob();
    await supabase.storage.from('avatars').upload(path, blob, {
      contentType: blob.type || `image/${ext}`, upsert: true,
    });
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
  } catch (e) {
    if (__DEV__) console.error('Avatar upload failed', e);
  }
}

export async function getFollowingFeedPosts(): Promise<CommunityPost[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: followRows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);

  const followingIds = (followRows ?? []).map((r: any) => r.following_id as string);
  if (followingIds.length === 0) return [];

  const { data } = await supabase
    .from('community_posts')
    .select('*, author:users(id, full_name, avatar_url), likes:community_likes(user_id)')
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(60);

  if (!data) return [];
  return data.map((row: any) => {
    const likes = (row.likes ?? []) as Array<{ user_id: string }>;
    const name  = row.author?.full_name ?? 'User';
    const diff  = Date.now() - new Date(row.created_at).getTime();
    const m     = Math.floor(diff / 60000);
    const timeAgo = m < 1 ? 'Just now' : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`;
    return {
      id: row.id, userId: row.user_id, userName: name,
      userInitial: name[0]?.toUpperCase() ?? 'U',
      userAvatar: row.author?.avatar_url ?? null, userGoal: 'maintenance' as const,
      caption: row.caption ?? '', imageUri: row.image_uri ?? null,
      postType: row.post_type ?? 'home_cooked',
      restaurantName: row.restaurant_name ?? undefined,
      mealName: row.meal_name ?? '',
      nutrition: { calories: row.calories ?? 0, protein: Number(row.protein_g ?? 0), carbs: Number(row.carbs_g ?? 0), fat: Number(row.fat_g ?? 0) },
      goalHit: false, ingredients: row.ingredients ?? [],
      likes: likes.length, comments: 0,
      hasLiked: likes.some((l: any) => l.user_id === user.id),
      createdAt: row.created_at, timeAgo,
    };
  });
}

