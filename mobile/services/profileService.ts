// TODO: Replace all mock operations with real Supabase backend calls
import type { UserProfile } from '@/types/community';
import type { CommunityPost } from '@/types/community';
import { getMockProfile, getFollowingIds, setFollowing, MOCK_PROFILES } from '@/data/profileMockData';
import { MOCK_POSTS } from '@/data/communityMockData';

export async function getCurrentUserProfile(): Promise<UserProfile> {
  // TODO: fetch from auth.getUser() + public.users table
  const profile = getMockProfile('current-user');
  if (!profile) throw new Error('Current user not found');
  return profile;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  // TODO: fetch from public.users table by ID
  const profile = getMockProfile(userId);
  if (!profile) throw new Error(`Profile ${userId} not found`);
  return profile;
}

export async function followUser(userId: string): Promise<void> {
  // TODO: insert into public.follows (follower_id, following_id)
  setFollowing(userId, true);
}

export async function unfollowUser(userId: string): Promise<void> {
  // TODO: delete from public.follows where follower_id = current AND following_id = userId
  setFollowing(userId, false);
}

export async function getFollowing(): Promise<UserProfile[]> {
  // TODO: fetch from public.follows JOIN public.users
  const ids = getFollowingIds();
  return MOCK_PROFILES.filter((p) => ids.includes(p.id));
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
  // TODO: PATCH /api/profile/update with updated fields
  console.log('TODO: save profile updates', updates);
}

export async function updateAvatar(imageUri: string): Promise<void> {
  // TODO: upload to Supabase storage bucket 'avatars', save URL to profile
  console.log('TODO: upload avatar', imageUri);
}

export async function getFollowingFeedPosts(): Promise<CommunityPost[]> {
  // TODO: fetch from DB filtered by following list
  const ids = getFollowingIds();
  return MOCK_POSTS.filter((p) => ids.includes(p.userId)).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
