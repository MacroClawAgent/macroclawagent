// TODO: Replace all mock data operations with real Supabase/Firebase backend calls
import type { CommunityPost, CommunityComment, CommunityFilter, CreatePostData } from '@/types/community';
import { MOCK_POSTS, MOCK_COMMENTS } from '@/data/communityMockData';

// In-memory store for optimistic updates (will be replaced by DB)
let posts: CommunityPost[] = [...MOCK_POSTS];

export async function getPosts(filter?: CommunityFilter): Promise<CommunityPost[]> {
  // TODO: fetch from /api/community/posts?filter=...
  let result = [...posts];

  if (filter && filter !== 'all') {
    result = result.filter((p) => {
      if (filter === 'build_muscle') return p.userGoal === 'build_muscle';
      if (filter === 'fat_loss') return p.userGoal === 'fat_loss';
      if (filter === 'home_cooked') return p.postType === 'home_cooked';
      if (filter === 'eating_out') return p.postType === 'eating_out';
      if (filter === 'meal_prep') return p.postType === 'meal_prep';
      return true;
    });
  }

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function toggleLike(postId: string): Promise<void> {
  // Optimistic update — TODO: sync to backend
  posts = posts.map((p) => {
    if (p.id !== postId) return p;
    return {
      ...p,
      hasLiked: !p.hasLiked,
      likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
    };
  });
}

export async function createPost(data: CreatePostData): Promise<CommunityPost> {
  // TODO: upload imageUri to Supabase storage, then save post to DB
  const newPost: CommunityPost = {
    id: `post-${Date.now()}`,
    userId: 'current-user',
    userName: 'You',
    userAvatar: null,
    userInitial: 'Y',
    userGoal: 'maintenance',
    caption: data.caption,
    imageUri: data.imageUri ?? null,
    postType: data.postType,
    restaurantName: data.restaurantName,
    mealName: data.mealName,
    nutrition: data.nutrition,
    goalHit: false,
    ingredients: data.ingredients,
    likes: 0,
    comments: 0,
    hasLiked: false,
    createdAt: new Date().toISOString(),
    timeAgo: 'Just now',
  };

  posts = [newPost, ...posts];
  return newPost;
}

export async function getComments(postId: string): Promise<CommunityComment[]> {
  // TODO: fetch from /api/community/comments?postId=...
  return MOCK_COMMENTS[postId] ?? [];
}
