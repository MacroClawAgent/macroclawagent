import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Meal } from '@/types/mealPlan';

const MEAL_COLORS: Record<string, { bg: string; color: string }> = {
  breakfast: { bg: 'rgba(251,191,36,0.12)',  color: '#D97706' },
  lunch:     { bg: 'rgba(34,197,94,0.10)',   color: '#16A34A' },
  snack:     { bg: 'rgba(99,102,241,0.10)',  color: '#6366F1' },
  dinner:    { bg: 'rgba(59,130,246,0.10)',  color: '#2563EB' },
};

interface Props {
  meal: Meal;
  onLog: () => void;
  onRecipe: () => void;
}

export default function MealPlanCard({ meal, onLog, onRecipe }: Props) {
  const palette = MEAL_COLORS[meal.type] ?? MEAL_COLORS.lunch;
  const label = meal.type.charAt(0).toUpperCase() + meal.type.slice(1);

  return (
    <View style={[s.card, meal.isLogged && s.cardLogged]}>
      {/* Top row */}
      <View style={s.topRow}>
        {/* Left */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={s.headerRow}>
            <View style={[s.typePill, { backgroundColor: palette.bg }]}>
              <Text style={[s.typePillText, { color: palette.color }]}>{label}</Text>
            </View>
            <Text style={s.time}>{meal.time}</Text>
          </View>
          <Text style={s.mealName} numberOfLines={1}>{meal.emoji} {meal.name}</Text>
          <Text style={s.ingredients} numberOfLines={2}>{meal.ingredients}</Text>
        </View>

        {/* Right — macros */}
        <View style={s.macroColumn}>
          {meal.isLogged && (
            <View style={s.loggedBadge}>
              <Text style={s.loggedBadgeText}>✓ Logged</Text>
            </View>
          )}
          <Text style={s.calories}>{meal.calories}</Text>
          <Text style={s.kcal}>kcal</Text>
          <Text style={s.protein}>{meal.protein}g pro</Text>
          <View style={s.miniMacros}>
            <Text style={s.miniMacro}>{meal.carbs}c</Text>
            <Text style={s.miniMacroSep}>·</Text>
            <Text style={s.miniMacro}>{meal.fat}f</Text>
          </View>
        </View>
      </View>

      {/* Bottom row */}
      <View style={s.bottomRow}>
        <View style={s.metaRow}>
          <Text style={s.metaText}>⏱ {meal.cookTime} min</Text>
          <View style={s.dot} />
          <Text style={s.metaText}>{meal.difficulty}</Text>
        </View>
        <View style={s.actions}>
          <TouchableOpacity
            style={s.recipeBtn}
            onPress={onRecipe}
            activeOpacity={0.75}
          >
            <Text style={s.recipeBtnText}>Recipe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.logBtn, meal.isLogged && s.logBtnLogged]}
            onPress={onLog}
            disabled={meal.isLogged}
            activeOpacity={0.8}
          >
            <Text style={[s.logBtnText, meal.isLogged && s.logBtnTextLogged]}>
              {meal.isLogged ? '✓ Logged' : 'Log'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const TEAL = '#2DD4BF';

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    padding: 16,
    shadowColor: '#B0C4D8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLogged: {
    backgroundColor: 'rgba(45,212,191,0.06)',
    borderColor: 'rgba(45,212,191,0.3)',
  },

  topRow:     { flexDirection: 'row', alignItems: 'flex-start' },
  headerRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typePill:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText: { fontSize: 11, fontWeight: '700' },
  time:       { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  mealName:   { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  ingredients:{ fontSize: 12, color: '#64748B', lineHeight: 18 },

  macroColumn:{ alignItems: 'flex-end', gap: 2, minWidth: 70 },
  loggedBadge:{ backgroundColor: 'rgba(45,212,191,0.15)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  loggedBadgeText: { fontSize: 10, fontWeight: '700', color: TEAL },
  calories:   { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  kcal:       { fontSize: 10, color: '#94A3B8', fontWeight: '500', marginTop: -2 },
  protein:    { fontSize: 13, color: '#16A34A', fontWeight: '600' },
  miniMacros: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniMacro:  { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  miniMacroSep: { fontSize: 11, color: '#CBD5E1' },

  bottomRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText:   { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  dot:        { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1' },

  actions:    { flexDirection: 'row', gap: 8 },
  recipeBtn:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: 'rgba(248,250,252,0.9)' },
  recipeBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  logBtn:     { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 14, backgroundColor: TEAL },
  logBtnText: { fontSize: 13, fontWeight: '700', color: 'white' },
  logBtnLogged: { backgroundColor: 'rgba(45,212,191,0.15)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)' },
  logBtnTextLogged: { color: TEAL },
});
