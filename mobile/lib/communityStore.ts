export interface CommunityMealPost {
  id: string;
  dishName: string;
  mealTag: string;
  mealEmoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Array<{ name: string; grams: number; calories: number }>;
  imageUri?: string | null;
  imageBase64?: string | null;
  postedAt: number; // Date.now()
}

let _pendingPost: CommunityMealPost | null = null;

export function setPendingCommunityPost(post: CommunityMealPost): void {
  _pendingPost = post;
}

export function consumePendingCommunityPost(): CommunityMealPost | null {
  const p = _pendingPost;
  _pendingPost = null;
  return p;
}
