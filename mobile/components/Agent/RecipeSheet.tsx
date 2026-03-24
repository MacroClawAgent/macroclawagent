import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Meal } from '@/types/mealPlan';
import { generateRecipe } from '@/services/mealGenerationService';

interface Props {
  meal: Meal | null;
  visible: boolean;
  onClose: () => void;
}

const MEAL_EMOJIS: Record<string, { bg: string; color: string }> = {
  breakfast: { bg: '#FEF3C7', color: '#D97706' },
  lunch:     { bg: '#DCFCE7', color: '#16A34A' },
  snack:     { bg: '#EDE9FE', color: '#6366F1' },
  dinner:    { bg: '#DBEAFE', color: '#2563EB' },
};

export default function RecipeSheet({ meal, visible, onClose }: Props) {
  const [steps, setSteps]     = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!meal || !visible) return;
    if (meal.recipeSteps && meal.recipeSteps.length > 0) {
      setSteps(meal.recipeSteps);
      return;
    }
    setLoading(true);
    generateRecipe(meal).then(s => {
      setSteps(s);
      setLoading(false);
    });
  }, [meal, visible]);

  if (!meal) return null;
  const palette = MEAL_EMOJIS[meal.type] ?? MEAL_EMOJIS.lunch;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={s.header}>
          <View style={[s.emojiCircle, { backgroundColor: palette.bg }]}>
            <Text style={s.emojiText}>{meal.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.mealName} numberOfLines={2}>{meal.name}</Text>
            <Text style={s.metaText}>⏱ {meal.cookTime} min · {meal.difficulty}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.75}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Macros */}
          <View style={s.macroRow}>
            {[
              { label: 'Calories', value: `${meal.calories}`, color: '#1E293B' },
              { label: 'Protein',  value: `${meal.protein}g`, color: '#16A34A' },
              { label: 'Carbs',    value: `${meal.carbs}g`,   color: '#D97706' },
              { label: 'Fat',      value: `${meal.fat}g`,     color: '#7C3AED' },
            ].map(m => (
              <View key={m.label} style={s.macroItem}>
                <Text style={[s.macroValue, { color: m.color }]}>{m.value}</Text>
                <Text style={s.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          {/* Ingredients */}
          <Text style={s.sectionTitle}>Ingredients</Text>
          <View style={s.ingredientsBox}>
            <Text style={s.ingredientsText}>{meal.ingredients}</Text>
          </View>

          {/* Steps */}
          <Text style={s.sectionTitle}>How to make it</Text>

          {loading ? (
            <View style={s.loadingRow}>
              <ActivityIndicator color="#2DD4BF" />
              <Text style={s.loadingText}>Getting recipe…</Text>
            </View>
          ) : (
            steps.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={s.stepText}>{step}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Log button */}
        <View style={s.footer}>
          <TouchableOpacity style={s.logBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={s.logBtnText}>Got it — close recipe</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  emojiCircle: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emojiText:   { fontSize: 26 },
  mealName:    { fontSize: 18, fontWeight: '800', color: '#1E293B', lineHeight: 24 },
  metaText:    { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  closeBtn:    { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  closeBtnText:{ fontSize: 14, color: '#94A3B8', fontWeight: '600' },

  macroRow:  { flexDirection: 'row', gap: 0, justifyContent: 'space-between', marginVertical: 20, backgroundColor: '#F8FAFC', borderRadius: 18, padding: 16 },
  macroItem: { alignItems: 'center', flex: 1 },
  macroValue:{ fontSize: 18, fontWeight: '800' },
  macroLabel:{ fontSize: 11, color: '#94A3B8', marginTop: 2 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 10, marginTop: 4 },

  ingredientsBox: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, marginBottom: 20 },
  ingredientsText:{ fontSize: 14, color: '#334155', lineHeight: 22 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20 },
  loadingText:{ fontSize: 14, color: '#94A3B8' },

  stepRow:     { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  stepNum:     { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2DD4BF', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  stepNumText: { fontSize: 13, fontWeight: '800', color: 'white' },
  stepText:    { flex: 1, fontSize: 14, color: '#334155', lineHeight: 22 },

  footer:   { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  logBtn:   { backgroundColor: '#F1F5F9', borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  logBtnText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
});
