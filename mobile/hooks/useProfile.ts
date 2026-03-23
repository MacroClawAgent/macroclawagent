import { useState, useCallback } from 'react';
import type { UserProfile } from '@/types/community';
import { getUserProfile, getCurrentUserProfile, followUser, unfollowUser } from '@/services/profileService';

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const loadProfile = useCallback(async (id?: string) => {
    setLoading(true);
    try {
      const data = id ? await getUserProfile(id) : await getCurrentUserProfile();
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFollow = useCallback(async () => {
    if (!profile || profile.isCurrentUser) return;
    setIsFollowLoading(true);
    // Optimistic update
    setProfile((prev) => prev ? {
      ...prev,
      isFollowing: !prev.isFollowing,
      followersCount: prev.isFollowing
        ? Math.max(0, prev.followersCount - 1)
        : prev.followersCount + 1,
    } : prev);
    try {
      if (profile.isFollowing) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }
    } catch {
      // Revert on failure
      setProfile((prev) => prev ? {
        ...prev,
        isFollowing: profile.isFollowing,
        followersCount: profile.followersCount,
      } : prev);
    } finally {
      setIsFollowLoading(false);
    }
  }, [profile]);

  return { profile, loading, isFollowLoading, loadProfile, handleFollow };
}
