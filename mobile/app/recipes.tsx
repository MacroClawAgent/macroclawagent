import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#1C1612';
const CARD = '#252018';
const TEXT_C = '#E8E0D0';
const GOLD = '#F5C842';
const CORAL = '#E07B54';
const SAGE = '#8B9E6E';
const MUTED = 'rgba(232,224,208,0.5)';
const DIM = 'rgba(232,224,208,0.25)';

interface SavedRecipe {
  name: string;
  emoji: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cookTime: number;
  difficulty: string;
  ingredients: string;
  ingredientsList: string[];
  recipeSteps: string[];
  reason: string;
  savedAt: string;
}

const FILTER_TAGS = ['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner'] as const;
type FilterTag = typeof FILTER_TAGS[number];

const MEAL_ICONS: Record<string, { icon: string; color: string }> = {
  breakfast: { icon: 'sunny-outline', color: GOLD },
  lunch: { icon: 'restaurant-outline', color: SAGE },
  snack: { icon: 'flash-outline', color: GOLD },
  dinner: { icon: 'moon-outline', color: CORAL },
};

function difficultyColor(d: string): string {
  if (d === 'Easy') return SAGE;
  if (d === 'Medium') return GOLD;
  return CORAL;
}

export default function RecipeBankScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [filter, setFilter] = useState<FilterTag>('All');
  const [query, setQuery] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('jonno_meal_plan_history')
      .then(raw => { if (raw) setRecipes(JSON.parse(raw)); })
      .catch(() => {});
  }, []);

  // Deduplicate by name (keep most recent)
  const uniqueRecipes = React.useMemo(() => {
    const seen = new Map<string, SavedRecipe>();
    for (const r of recipes) {
      const key = r.name.toLowerCase().trim();
      if (!seen.has(key)) seen.set(key, r);
    }
    return [...seen.values()];
  }, [recipes]);

  // Filter + search
  const filtered = uniqueRecipes.filter(r => {
    if (filter !== 'All' && r.type.toLowerCase() !== filter.toLowerCase()) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return r.name.toLowerCase().includes(q) || r.ingredients.toLowerCase().includes(q);
    }
    return true;
  });

  const toggle = (idx: number) => setExpandedIdx(prev => prev === idx ? null : idx);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={TEXT_C} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.title}>Recipe Bank</Text>
          <Text style={s.subtitle}>{uniqueRecipes.length} recipes from Jonno</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={18} color={DIM} />
        <TextInput
          style={s.searchInput}
          placeholder="Search recipes or ingredients..."
          placeholderTextColor={DIM}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={16} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        {FILTER_TAGS.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[s.filterPill, filter === tag && s.filterPillActive]}
            onPress={() => setFilter(tag)}
            activeOpacity={0.7}
          >
            <Text style={[s.filterText, filter === tag && s.filterTextActive]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipe list */}
      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="book-outline" size={48} color={DIM} />
          <Text style={s.emptyTitle}>
            {recipes.length === 0 ? 'No recipes yet' : 'No matches'}
          </Text>
          <Text style={s.emptySub}>
            {recipes.length === 0
              ? 'Ask Jonno to generate a meal and it will appear here'
              : 'Try a different search or filter'}
          </Text>
          {recipes.length === 0 && (
            <TouchableOpacity style={s.ctaBtn} onPress={() => router.push('/(tabs)/agent' as any)} activeOpacity={0.85}>
              <Text style={s.ctaBtnText}>Go to Agent</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {filtered.map((recipe, idx) => {
            const meta = MEAL_ICONS[recipe.type.toLowerCase()] ?? MEAL_ICONS.dinner;
            const isExpanded = expandedIdx === idx;
            const hasSteps = recipe.recipeSteps && recipe.recipeSteps.length > 0;
            const hasIngredients = recipe.ingredientsList && recipe.ingredientsList.length > 0;

            return (
              <TouchableOpacity
                key={`${recipe.name}-${idx}`}
                style={s.recipeCard}
                onPress={() => toggle(idx)}
                activeOpacity={0.8}
              >
                {/* Header row */}
                <View style={s.recipeHeader}>
                  <View style={[s.recipeIcon, { backgroundColor: meta.color + '18' }]}>
                    <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.recipeName} numberOfLines={isExpanded ? undefined : 1}>{recipe.name}</Text>
                    <View style={s.recipeMeta}>
                      {recipe.cookTime > 0 && (
                        <View style={s.metaChip}>
                          <Ionicons name="time-outline" size={11} color={MUTED} />
                          <Text style={s.metaText}>{recipe.cookTime} min</Text>
                        </View>
                      )}
                      {recipe.difficulty && (
                        <View style={s.metaChip}>
                          <View style={[s.diffDot, { backgroundColor: difficultyColor(recipe.difficulty) }]} />
                          <Text style={s.metaText}>{recipe.difficulty}</Text>
                        </View>
                      )}
                      <Text style={[s.metaText, { color: DIM }]}>
                        {recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={DIM} />
                </View>

                {/* Macro strip */}
                <View style={s.macroStrip}>
                  <Text style={[s.macroVal, { color: TEXT_C }]}>{recipe.calories} <Text style={s.macroUnit}>kcal</Text></Text>
                  <View style={s.macroDot} />
                  <Text style={[s.macroVal, { color: CORAL }]}>{recipe.protein}g <Text style={s.macroUnit}>P</Text></Text>
                  <View style={s.macroDot} />
                  <Text style={[s.macroVal, { color: GOLD }]}>{recipe.carbs}g <Text style={s.macroUnit}>C</Text></Text>
                  <View style={s.macroDot} />
                  <Text style={[s.macroVal, { color: SAGE }]}>{recipe.fat}g <Text style={s.macroUnit}>F</Text></Text>
                </View>

                {/* Reason */}
                {recipe.reason && !isExpanded && (
                  <Text style={s.reason} numberOfLines={1}>{recipe.reason}</Text>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <View style={s.expandedWrap}>
                    {/* Reason */}
                    {recipe.reason ? <Text style={s.reasonFull}>{recipe.reason}</Text> : null}

                    {/* Ingredients */}
                    {hasIngredients && (
                      <View style={s.detailSection}>
                        <Text style={s.detailLabel}>Ingredients</Text>
                        {recipe.ingredientsList.map((ing, i) => (
                          <View key={i} style={s.ingredientRow}>
                            <View style={s.bullet} />
                            <Text style={s.ingredientText}>{ing}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Steps */}
                    {hasSteps && (
                      <View style={s.detailSection}>
                        <Text style={s.detailLabel}>Method</Text>
                        {recipe.recipeSteps.map((step, i) => (
                          <View key={i} style={s.stepRow}>
                            <View style={s.stepNum}>
                              <Text style={s.stepNumText}>{i + 1}</Text>
                            </View>
                            <Text style={s.stepText}>{step}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: TEXT_C },
  subtitle: { fontSize: 13, color: MUTED, marginTop: 2 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 8, marginBottom: 8,
    backgroundColor: CARD, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: 'rgba(232,224,208,0.06)',
  },
  searchInput: { flex: 1, fontSize: 14, color: TEXT_C },

  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 12, height: 36 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18,
    backgroundColor: 'rgba(232,224,208,0.06)', borderWidth: 1, borderColor: 'rgba(232,224,208,0.08)',
  },
  filterPillActive: { backgroundColor: 'rgba(245,200,66,0.15)', borderColor: GOLD },
  filterText: { fontSize: 13, fontWeight: '600', color: DIM },
  filterTextActive: { color: GOLD },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT_C, marginTop: 12 },
  emptySub: { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20 },
  ctaBtn: { backgroundColor: GOLD, borderRadius: 22, paddingVertical: 14, paddingHorizontal: 28, marginTop: 16 },
  ctaBtnText: { color: BG, fontWeight: '700', fontSize: 15 },

  // Recipe card
  recipeCard: {
    backgroundColor: CARD, borderRadius: 18, marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(232,224,208,0.06)', padding: 14, gap: 10,
  },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recipeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recipeName: { fontSize: 16, fontWeight: '700', color: TEXT_C },
  recipeMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: MUTED, fontWeight: '500' },
  diffDot: { width: 6, height: 6, borderRadius: 3 },

  macroStrip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  macroVal: { fontSize: 13, fontWeight: '700' },
  macroUnit: { fontSize: 11, fontWeight: '500', color: MUTED },
  macroDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: DIM },

  reason: { fontSize: 12, color: MUTED, fontStyle: 'italic' },
  reasonFull: { fontSize: 13, color: MUTED, fontStyle: 'italic', lineHeight: 19 },

  expandedWrap: { gap: 14, marginTop: 4 },

  detailSection: { gap: 8 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: GOLD, letterSpacing: 0.5, textTransform: 'uppercase' },

  ingredientRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: DIM, marginTop: 6 },
  ingredientText: { fontSize: 14, color: TEXT_C, flex: 1, lineHeight: 20 },

  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNum: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(245,200,66,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: 11, fontWeight: '700', color: GOLD },
  stepText: { fontSize: 14, color: TEXT_C, flex: 1, lineHeight: 20 },
});
