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
import { Ionicons } from '@expo/vector-icons';
import type { Meal } from '@/types/mealPlan';
import { generateRecipe } from '@/services/mealGenerationService';

// ── Palette (matches agent.tsx) ──────────────────────────────────────────────
const BG     = '#1C1612';
const CARD   = '#252018';
const BORDER = 'rgba(248,213,97,0.08)';
const GOLD   = '#F5C842';
const CORAL  = '#E07B54';
const SAGE   = '#8B9E6E';
const TEXT_C = '#E8E0D0';
const MUTED  = 'rgba(232,224,208,0.5)';
const DIM    = 'rgba(232,224,208,0.3)';

const MEAL_COLORS: Record<string, { bg: string; color: string }> = {
  breakfast: { bg: 'rgba(245,200,66,0.15)',  color: GOLD  },
  lunch:     { bg: 'rgba(139,158,110,0.15)', color: SAGE  },
  snack:     { bg: 'rgba(245,200,66,0.10)',  color: GOLD  },
  dinner:    { bg: 'rgba(224,123,84,0.15)',  color: CORAL },
};

interface Props {
  meal: Meal | null;
  visible: boolean;
  onClose: () => void;
  onLog?: () => void;
}

export default function RecipeSheet({ meal, visible, onClose, onLog }: Props) {
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
  const palette = MEAL_COLORS[meal.type] ?? MEAL_COLORS.lunch;

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
            <Ionicons name="close" size={16} color={MUTED} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Macros */}
          <View style={s.macroRow}>
            {[
              { label: 'Calories', value: `${meal.calories}`, color: TEXT_C },
              { label: 'Protein',  value: `${meal.protein}g`, color: CORAL  },
              { label: 'Carbs',    value: `${meal.carbs}g`,   color: GOLD   },
              { label: 'Fat',      value: `${meal.fat}g`,     color: SAGE   },
            ].map(m => (
              <View key={m.label} style={s.macroItem}>
                <Text style={[s.macroValue, { color: m.color }]}>{m.value}</Text>
                <Text style={s.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          {/* Reason */}
          {!!meal.reason && (
            <View style={s.reasonBox}>
              <Text style={s.reasonIcon}>✦</Text>
              <Text style={s.reasonText}>{meal.reason}</Text>
            </View>
          )}

          {/* Ingredients */}
          <Text style={s.sectionTitle}>Ingredients</Text>
          <View style={s.ingredientsBox}>
            <Text style={s.ingredientsText}>{meal.ingredients}</Text>
          </View>

          {/* Steps */}
          <Text style={s.sectionTitle}>How to make it</Text>

          {loading ? (
            <View style={s.loadingRow}>
              <ActivityIndicator color={GOLD} />
              <Text style={s.loadingText}>Getting recipe...</Text>
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

        {/* Footer — Log button */}
        <View style={s.footer}>
          {!meal.isLogged && onLog ? (
            <TouchableOpacity style={s.logBtn} onPress={onLog} activeOpacity={0.85}>
              <Text style={s.logBtnText}>Log This Meal</Text>
            </TouchableOpacity>
          ) : meal.isLogged ? (
            <View style={s.loggedFooter}>
              <Ionicons name="checkmark-circle" size={18} color={SAGE} />
              <Text style={s.loggedFooterText}>Already logged</Text>
            </View>
          ) : (
            <TouchableOpacity style={s.closeFooterBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={s.closeFooterText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  emojiCircle: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emojiText:   { fontSize: 26 },
  mealName:    { fontSize: 18, fontWeight: '800', color: TEXT_C, lineHeight: 24 },
  metaText:    { fontSize: 12, color: MUTED, marginTop: 3 },
  closeBtn:    { width: 32, height: 32, borderRadius: 10, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },

  macroRow:  { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20, backgroundColor: CARD, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: BORDER },
  macroItem: { alignItems: 'center', flex: 1 },
  macroValue:{ fontSize: 18, fontWeight: '800' },
  macroLabel:{ fontSize: 11, color: MUTED, marginTop: 2 },

  reasonBox:  { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 16, backgroundColor: 'rgba(248,213,97,0.06)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(248,213,97,0.15)' },
  reasonIcon: { fontSize: 11, color: GOLD, marginTop: 2 },
  reasonText: { flex: 1, fontSize: 13, color: 'rgba(248,213,97,0.85)', fontWeight: '500', lineHeight: 19 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT_C, marginBottom: 10, marginTop: 4, letterSpacing: 0.3 },

  ingredientsBox: { backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: BORDER },
  ingredientsText:{ fontSize: 14, color: MUTED, lineHeight: 22 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20 },
  loadingText:{ fontSize: 14, color: MUTED },

  stepRow:     { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  stepNum:     { width: 28, height: 28, borderRadius: 14, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  stepNumText: { fontSize: 13, fontWeight: '800', color: BG },
  stepText:    { flex: 1, fontSize: 14, color: TEXT_C, lineHeight: 22 },

  footer:   { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: BORDER },
  logBtn:   { backgroundColor: GOLD, borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  logBtnText: { fontSize: 15, fontWeight: '700', color: BG },
  loggedFooter:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  loggedFooterText: { fontSize: 15, fontWeight: '600', color: SAGE },
  closeFooterBtn:   { backgroundColor: CARD, borderRadius: 18, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  closeFooterText:  { fontSize: 15, fontWeight: '600', color: MUTED },
});
