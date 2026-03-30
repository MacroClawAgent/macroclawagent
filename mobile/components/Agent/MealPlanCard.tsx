import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Meal } from '@/types/mealPlan';

const MEAL_COLORS: Record<string, { bg: string; color: string }> = {
  breakfast: { bg: 'rgba(245,200,66,0.20)',  color: '#F5C842' },
  lunch:     { bg: 'rgba(139,158,110,0.20)', color: '#8B9E6E' },
  snack:     { bg: 'rgba(248,213,97,0.15)',  color: '#F5C842' },
  dinner:    { bg: 'rgba(224,123,84,0.20)',  color: '#E07B54' },
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
          {!!meal.reason && (
            <View style={s.reasonRow}>
              <Text style={s.reasonIcon}>✦</Text>
              <Text style={s.reasonText} numberOfLines={2}>{meal.reason}</Text>
            </View>
          )}
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

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#252018',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(248,213,97,0.12)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 5,
  },
  cardLogged: {
    backgroundColor: 'rgba(139,158,110,0.08)',
    borderColor: 'rgba(139,158,110,0.30)',
  },

  topRow:     { flexDirection: 'row', alignItems: 'flex-start' },
  headerRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typePill:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText: { fontSize: 11, fontWeight: '700' },
  time:       { fontSize: 11, color: 'rgba(232,224,208,0.4)', fontWeight: '500' },

  mealName:   { fontSize: 16, fontWeight: '700', color: '#E8E0D0', marginBottom: 4 },
  ingredients:{ fontSize: 12, color: 'rgba(232,224,208,0.5)', lineHeight: 18 },
  reasonRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 6, backgroundColor: 'rgba(248,213,97,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(248,213,97,0.2)' },
  reasonIcon: { fontSize: 10, color: '#F5C842', marginTop: 1 },
  reasonText: { flex: 1, fontSize: 11, color: 'rgba(248,213,97,0.9)', fontWeight: '500', lineHeight: 16 },

  macroColumn:{ alignItems: 'flex-end', gap: 2, minWidth: 70 },
  loggedBadge:{ backgroundColor: 'rgba(139,158,110,0.2)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  loggedBadgeText: { fontSize: 10, fontWeight: '700', color: '#8B9E6E' },
  calories:   { fontSize: 28, fontWeight: '800', color: '#E8E0D0' },
  kcal:       { fontSize: 10, color: 'rgba(232,224,208,0.5)', fontWeight: '500', marginTop: -2 },
  protein:    { fontSize: 13, color: '#E07B54', fontWeight: '600' },
  miniMacros: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniMacro:  { fontSize: 11, color: 'rgba(232,224,208,0.45)', fontWeight: '500' },
  miniMacroSep: { fontSize: 11, color: 'rgba(232,224,208,0.2)' },

  bottomRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(248,213,97,0.08)' },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText:   { fontSize: 12, color: 'rgba(232,224,208,0.4)', fontWeight: '500' },
  dot:        { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(232,224,208,0.2)' },

  actions:    { flexDirection: 'row', gap: 8 },
  recipeBtn:  { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(232,224,208,0.15)', backgroundColor: 'rgba(232,224,208,0.08)' },
  recipeBtnText: { fontSize: 13, fontWeight: '600', color: '#E8E0D0' },
  logBtn:     { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, backgroundColor: '#F5C842' },
  logBtnText: { fontSize: 13, fontWeight: '700', color: '#1C1612' },
  logBtnLogged: { backgroundColor: 'rgba(139,158,110,0.15)', borderWidth: 1, borderColor: 'rgba(139,158,110,0.30)' },
  logBtnTextLogged: { color: '#8B9E6E' },
});
