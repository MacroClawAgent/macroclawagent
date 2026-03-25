export type MealContextType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealContext {
  mealType: MealContextType;
  greeting: string;
  emoji: string;
  buttonTitle: string;
  buttonSub: string;
}

export function getCurrentMealContext(): MealContext {
  const h = new Date().getHours();
  if (h >= 5 && h < 10)  return { mealType: 'breakfast', greeting: 'Good morning',       emoji: '🌅', buttonTitle: 'Suggest my breakfast',    buttonSub: 'Quick, high-protein start to the day' };
  if (h >= 10 && h < 14) return { mealType: 'lunch',     greeting: 'Lunchtime',           emoji: '☀️', buttonTitle: "What's for lunch?",       buttonSub: 'Based on your goals + macros remaining' };
  if (h >= 14 && h < 17) return { mealType: 'snack',     greeting: 'Afternoon fuel',      emoji: '⚡', buttonTitle: 'Afternoon snack idea',     buttonSub: 'Something quick to keep you going' };
  if (h >= 17 && h < 21) return { mealType: 'dinner',    greeting: 'Dinner time',         emoji: '🌙', buttonTitle: 'Plan my dinner',           buttonSub: 'Using your macros target + pantry' };
  return                         { mealType: 'snack',     greeting: 'Late night',          emoji: '🌙', buttonTitle: 'Late-night snack idea',    buttonSub: 'Light and easy on the digestion' };
}
