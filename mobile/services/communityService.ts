import { supabase } from '@/lib/supabase';
import type { CommunityPost, CommunityComment, CommunityFilter, CreatePostData } from '@/types/community';

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function uploadPostImage(uri: string, userId: string): Promise<string | null> {
  try {
    const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const res  = await fetch(uri);
    const blob = await res.blob();
    const { error } = await supabase.storage.from('community-images').upload(path, blob, {
      contentType: blob.type || `image/${ext}`,
      upsert: false,
    });
    if (error) return null;
    return supabase.storage.from('community-images').getPublicUrl(path).data.publicUrl;
  } catch {
    return null;
  }
}

function mapRow(row: any, uid: string | null): CommunityPost {
  const author  = row.author ?? {};
  const likes   = (row.likes ?? []) as Array<{ user_id: string }>;
  const name    = author.full_name ?? 'User';
  return {
    id:             row.id,
    userId:         row.user_id,
    userName:       name,
    userInitial:    name[0]?.toUpperCase() ?? 'U',
    userAvatar:     author.avatar_url ?? null,
    userGoal:       'maintenance',
    caption:        row.caption ?? '',
    imageUri:       row.image_uri ?? null,
    postType:       row.post_type ?? 'home_cooked',
    restaurantName: row.restaurant_name ?? undefined,
    mealName:       row.meal_name ?? '',
    nutrition: {
      calories: row.calories ?? 0,
      protein:  Number(row.protein_g ?? 0),
      carbs:    Number(row.carbs_g ?? 0),
      fat:      Number(row.fat_g ?? 0),
    },
    goalHit:     false,
    ingredients: row.ingredients ?? [],
    likes:       likes.length,
    comments:    0,
    hasLiked:    uid ? likes.some((l) => l.user_id === uid) : false,
    createdAt:   row.created_at,
    timeAgo:     timeAgo(row.created_at),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getPosts(filter?: CommunityFilter): Promise<CommunityPost[]> {
  const uid = await getCurrentUserId();

  let query = supabase
    .from('community_posts')
    .select('*, author:users(id, full_name, avatar_url), likes:community_likes(user_id)')
    .order('created_at', { ascending: false })
    .limit(60);

  if (filter && filter !== 'all') {
    if (filter === 'home_cooked' || filter === 'eating_out' || filter === 'meal_prep') {
      query = query.eq('post_type', filter);
    }
    // build_muscle / fat_loss filters are goal-based — handled client-side for now
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => mapRow(row, uid));
}

export async function getUserPosts(userId: string): Promise<CommunityPost[]> {
  const uid = await getCurrentUserId();
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, author:users(id, full_name, avatar_url), likes:community_likes(user_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => mapRow(row, uid));
}

export async function toggleLike(postId: string): Promise<void> {
  const uid = await getCurrentUserId();
  if (!uid) return;

  const { data: existing } = await supabase
    .from('community_likes')
    .select('user_id')
    .eq('post_id', postId)
    .eq('user_id', uid)
    .maybeSingle();

  if (existing) {
    await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', uid);
  } else {
    await supabase.from('community_likes').insert({ post_id: postId, user_id: uid });
  }
}

export async function createPost(data: CreatePostData): Promise<CommunityPost> {
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('Not authenticated');

  // Upload image to Supabase Storage if present
  let storedImageUri: string | null = null;
  if (data.imageUri) {
    storedImageUri = await uploadPostImage(data.imageUri, uid);
    // Fall back to local URI if upload fails (works within same device session)
    if (!storedImageUri) storedImageUri = data.imageUri;
  }

  const { data: row, error } = await supabase
    .from('community_posts')
    .insert({
      user_id:         uid,
      meal_name:       data.mealName,
      caption:         data.caption,
      post_type:       data.postType,
      restaurant_name: data.restaurantName ?? null,
      image_uri:       storedImageUri,
      calories:        data.nutrition.calories,
      protein_g:       data.nutrition.protein,
      carbs_g:         data.nutrition.carbs,
      fat_g:           data.nutrition.fat,
      ingredients:     data.ingredients ?? [],
    })
    .select('*, author:users(id, full_name, avatar_url), likes:community_likes(user_id)')
    .single();

  if (error || !row) throw new Error(error?.message ?? 'Failed to create post');
  return mapRow(row, uid);
}

export async function getComments(postId: string): Promise<CommunityComment[]> {
  // TODO: fetch from community_comments table once created
  return [];
}
