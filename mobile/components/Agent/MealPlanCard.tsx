import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Meal } from '@/types/mealPlan';

const BG   = '#1C1612';
const CARD = '#252018';
const TEXT  = '#E8E0D0';
const SAGE = '#8B9E6E';
const DIM  = 'rgba(232,224,208,0.3)';

const MEAL_COLORS: Record<string, { bg: string; color: string }> = {
  breakfast: { bg: 'rgba(245,200,66,0.15)',  color: '#F5C842' },
  lunch:     { bg: 'rgba(139,158,110,0.15)', color: '#8B9E6E' },
  snack:     { bg: 'rgba(245,200,66,0.10)',  color: 'rgba(245,200,66,0.6)' },
  dinner:    { bg: 'rgba(224,123,84,0.15)',  color: '#E07B54' },
};

interface Props {
  meal: Meal;
  onPress: () => void;
}

export default function MealPlanCard({ meal, onPress }: Props) {
  const palette = MEAL_COLORS[meal.type] ?? MEAL_COLORS.lunch;
  const label = meal.type.charAt(0).toUpperCase() + meal.type.slice(1);

  return (
    <TouchableOpacity
      style={[s.card, meal.isLogged && s.cardLogged]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Coloured dot */}
      <View style={[s.dot, { backgroundColor: palette.color }]} />

      {/* Emoji square */}
      <View style={[s.emojiBox, { backgroundColor: palette.bg }]}>
        <Text style={s.emoji}>{meal.emoji}</Text>
        {meal.isLogged && (
          <View style={s.loggedCheck}>
            <Text style={s.loggedCheckText}>✓</Text>
          </View>
        )}
      </View>

      {/* Name + subtitle */}
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{meal.name}</Text>
        <Text style={s.sub} numberOfLines={1}>
          {label} · {meal.protein}g protein
        </Text>
      </View>

      {/* Calories */}
      <View style={s.calCol}>
        <Text style={s.cal}>{meal.calories}</Text>
        <Text style={s.calUnit}>kcal</Text>
      </View>

      <Ionicons name="chevron-forward" size={14} color={DIM} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,213,97,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  cardLogged: {
    borderColor: 'rgba(139,158,110,0.25)',
    backgroundColor: 'rgba(139,158,110,0.06)',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  emojiBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  loggedCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SAGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggedCheckText: { fontSize: 9, color: BG, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: TEXT },
  sub:  { fontSize: 12, color: 'rgba(232,224,208,0.45)', marginTop: 2 },
  calCol: { alignItems: 'flex-end', marginRight: 4 },
  cal:    { fontSize: 18, fontWeight: '800', color: TEXT },
  calUnit:{ fontSize: 9, color: 'rgba(232,224,208,0.4)', marginTop: -1 },
});
