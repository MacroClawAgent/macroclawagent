export type CommunityPostType = 'home_cooked' | 'meal_prep' | 'eating_out';
export type UserGoal = 'build_muscle' | 'fat_loss' | 'maintenance' | 'performance';
export type CommunityFilter = 'all' | 'build_muscle' | 'fat_loss' | 'home_cooked' | 'eating_out' | 'meal_prep';

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userInitial: string;
  userGoal: UserGoal;
  caption: string;
  imageUri: string | null;
  postType: CommunityPostType;
  restaurantName?: string;
  mealName: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  goalHit: boolean;
  ingredients?: string[];
  likes: number;
  comments: number;
  hasLiked: boolean;
  createdAt: string;
  timeAgo: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  instagramHandle?: string;
  avatarUri?: string;
  initial: string;
  bio?: string;
  goal: UserGoal;
  goalLabel: string;
  streak: number;
  weeksOnJonno: number;
  mealsLogged: number;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isCurrentUser: boolean;
  topCuisines: string[];
  posts: CommunityPost[];
}

export interface FollowAction {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  userId: string;
  userName: string;
  userInitial: string;
  text: string;
  createdAt: string;
  timeAgo: string;
}

export interface CreatePostData {
  postType: CommunityPostType;
  mealName: string;
  caption: string;
  restaurantName?: string;
  imageUri?: string | null;
  imageBase64?: string | null;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  ingredients?: string[];
}
