export type DietaryRequirement =
  | 'none'
  | 'halal'
  | 'kosher'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian';

export type Allergy =
  | 'gluten'
  | 'dairy'
  | 'nuts'
  | 'eggs'
  | 'soy'
  | 'shellfish'
  | 'sesame';

export type Cuisine =
  | 'asian'
  | 'mediterranean'
  | 'middle_eastern'
  | 'italian'
  | 'mexican'
  | 'indian'
  | 'thai'
  | 'japanese'
  | 'australian'
  | 'american'
  | 'greek'
  | 'lebanese'
  | 'korean'
  | 'vietnamese';

export type BudgetRange = 'budget' | 'moderate' | 'flexible';
export type CookingTime = 'quick' | 'normal' | 'elaborate';
export type SpiceLevel = 'mild' | 'medium' | 'spicy';

export interface UserPreferences {
  dietaryRequirement: DietaryRequirement;
  allergies: Allergy[];
  cuisines: Cuisine[];
  budget: BudgetRange;
  cookingTime: CookingTime;
  servings: 1 | 2 | 3 | 4 | 5;
  dislikedIngredients: string[];
  spiceLevel: SpiceLevel;
  onboardingComplete: boolean;
  lastUpdated: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryRequirement: 'none',
  allergies: [],
  cuisines: [],
  budget: 'moderate',
  cookingTime: 'normal',
  servings: 1,
  dislikedIngredients: [],
  spiceLevel: 'medium',
  onboardingComplete: false,
  lastUpdated: new Date().toISOString(),
};
