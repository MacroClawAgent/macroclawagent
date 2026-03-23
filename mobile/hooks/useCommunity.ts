import { useState, useCallback } from 'react';
import type { CommunityPost, CommunityFilter, CreatePostData } from '@/types/community';
import { getPosts, toggleLike, createPost } from '@/services/communityService';

export function useCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CommunityFilter>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const loadPosts = useCallback(async (filter?: CommunityFilter) => {
    setLoading(true);
    try {
      const data = await getPosts(filter ?? activeFilter);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const handleLike = useCallback(async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return { ...p, hasLiked: !p.hasLiked, likes: p.hasLiked ? p.likes - 1 : p.likes + 1 };
      })
    );
    await toggleLike(postId);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getPosts(activeFilter);
      setPosts(data);
    } finally {
      setRefreshing(false);
    }
  }, [activeFilter]);

  const setFilter = useCallback(async (filter: CommunityFilter) => {
    setActiveFilter(filter);
    setLoading(true);
    try {
      const data = await getPosts(filter);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const openCreatePost = useCallback(() => setShowCreatePost(true), []);
  const closeCreatePost = useCallback(() => setShowCreatePost(false), []);

  const submitPost = useCallback(async (data: CreatePostData) => {
    const newPost = await createPost(data);
    setPosts((prev) => [newPost, ...prev]);
    setShowCreatePost(false);
  }, []);

  return {
    posts,
    loading,
    refreshing,
    activeFilter,
    showCreatePost,
    loadPosts,
    handleLike,
    handleRefresh,
    setFilter,
    openCreatePost,
    closeCreatePost,
    submitPost,
  };
}
