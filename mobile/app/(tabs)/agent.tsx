import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMealPlan } from '@/hooks/useMealPlan';
import { useAgentContext } from '@/hooks/useAgentContext';
import { getPantryPhotos } from '@/services/pantryService';
import { getCurrentMealContext } from '@/utils/mealContext';
import PreferencesSheet from '@/components/Agent/PreferencesSheet';
import MealPlanCard from '@/components/Agent/MealPlanCard';
import RecipeSheet from '@/components/Agent/RecipeSheet';
import GeneratingLoader from '@/components/Agent/GeneratingLoader';
import PantryScanner from '@/components/Agent/PantryScanner';
import { TabSwipeWrapper } from '@/hooks/useTabSwipe';
import type { Meal } from '@/types/mealPlan';

// ── Palette ───────────────────────────────────────────────────────────────────
const BG     = '#1C1612';
const CARD   = '#252018';
const BORDER = 'rgba(248,213,97,0.10)';
const GOLD   = '#F5C842';
const CORAL  = '#E07B54';
const SAGE   = '#8B9E6E';
const TEXT   = '#E8E0D0';
const MUTED  = 'rgba(232,224,208,0.5)';
const DIM    = 'rgba(232,224,208,0.3)';

// (tip dismissed state removed — intelligence card + onboarding tip removed from idle)

// ── Generating — single meal (minimal pulsing circle) ────────────────────────

function SingleGenerating({ mealType }: { mealType: string }) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.genWrap}>
        <Animated.View style={[s.genCircle, { opacity }]}>
          <Text style={s.genStar}>✦</Text>
        </Animated.View>
        <Text style={s.genTitle}>Thinking up your {mealType}...</Text>
        <Text style={s.genSub}>Balancing macros · Checking pantry · Optimising</Text>
      </View>
    </SafeAreaView>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgentScreen() {
  const ctx = useAgentContext();
  const { preferences, hasAnyPreferences, completeOnboarding, training, pantry, nutrition, targets, goal, prefTags } = ctx;

  const {
    state,
    planType,
    days,
    singleMeal,
    selectedDayIndex,
    isRegenerating,
    error,
    generate,
    regenerate,
    markMealLogged,
    getAllIngredientsCount,
    sendToCart,
    resetPlan,
    setSelectedDayIndex,
  } = useMealPlan();

  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedMeal,    setSelectedMeal]    = useState<Meal | null>(null);
  const [showRecipe,      setShowRecipe]      = useState(false);
  const [addingPantry,    setAddingPantry]    = useState(false);
  const [pantryInput,     setPantryInput]     = useState('');
  const [pantryExpanded,  setPantryExpanded]  = useState(false);
  const [showScanner,     setShowScanner]     = useState(false);

  const mealCtx         = getCurrentMealContext();
  const selectedDay     = days[selectedDayIndex];
  const ingredientCount = getAllIngredientsCount();
  const pantryItems     = pantry.items;
  const pantryPhotos    = getPantryPhotos(pantryItems);

  const targetsWithConsumed = {
    calories: targets.calories,
    protein:  targets.protein,
    carbs:    targets.carbs,
    fat:      targets.fat,
    goal,
    consumed: nutrition.consumed ?? undefined,
    activityContext: training
      ? { workoutLabel: training.label, caloriesBurned: training.caloriesBurned }
      : undefined,
  };

  const handleGenerate = useCallback(
    (type: Parameters<typeof generate>[0]) => {
      generate(type, preferences, targetsWithConsumed, {
        mealType: type === 'single' ? mealCtx.mealType : undefined,
        pantryItems: pantryItems.length > 0 ? pantryItems : undefined,
      });
    },
    [preferences, generate, targetsWithConsumed, mealCtx.mealType, pantryItems]
  );

  const handleSendToCart  = useCallback(async () => { await sendToCart(); }, [sendToCart]);
  const handleOpenRecipe  = useCallback((meal: Meal) => { setSelectedMeal(meal); setShowRecipe(true); }, []);
  const handleScannerConfirm = useCallback(async (items: string[], photoUri: string) => {
    for (const name of items) { await pantry.add(name, 'photo', photoUri); }
  }, [pantry]);

  // ── GENERATING ───────────────────────────────────────────────────────────────

  if (state === 'generating') {
    if (planType === 'single') return <SingleGenerating mealType={mealCtx.mealType} />;
    return <GeneratingLoader type={planType} preferences={preferences} />;
  }

  // ── PLAN READY — single meal ─────────────────────────────────────────────────

  if (state === 'plan_ready' && planType === 'single' && singleMeal) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <View>
              <Text style={s.title}>
                {singleMeal.type.charAt(0).toUpperCase() + singleMeal.type.slice(1)}
              </Text>
              <Text style={s.headerSub}>Generated by Jonno ✦</Text>
            </View>
            <TouchableOpacity onPress={resetPlan} style={s.closeBtn} activeOpacity={0.75}>
              <Ionicons name="close" size={18} color={MUTED} />
            </TouchableOpacity>
          </View>

          <MealPlanCard
            meal={singleMeal}
            onPress={() => { setSelectedMeal(singleMeal); setShowRecipe(true); }}
          />

          {/* Swap pills */}
          <View style={s.swapRow}>
            {['↑ More protein', '↓ Make lighter', '🌏 Different cuisine'].map(label => (
              <TouchableOpacity
                key={label}
                style={s.swapPill}
                activeOpacity={0.75}
                onPress={() => generate('single', preferences, targetsWithConsumed, {
                  mealType: mealCtx.mealType,
                  pantryItems: pantryItems.length > 0 ? pantryItems : undefined,
                })}
              >
                <Text style={s.swapPillText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.fullDayLink} onPress={() => handleGenerate('today')} activeOpacity={0.75}>
            <Text style={s.fullDayLinkText}>See full day plan instead →</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
        <RecipeSheet
          meal={selectedMeal}
          visible={showRecipe}
          onClose={() => setShowRecipe(false)}
        />
      </SafeAreaView>
    );
  }

  // ── PLAN READY — full day / week ─────────────────────────────────────────────

  if (state === 'plan_ready' && selectedDay) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Header — title + icon-only regen + close */}
          <View style={s.header}>
            <View>
              <Text style={s.title}>{planType === 'today' ? "Today's Plan" : 'This Week'}</Text>
              <Text style={s.headerSub}>Generated by Jonno ✦</Text>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity
                style={s.closeBtn}
                onPress={() => regenerate(preferences, targetsWithConsumed)}
                disabled={isRegenerating}
                activeOpacity={0.75}
              >
                <Ionicons name="refresh" size={16} color={isRegenerating ? DIM : GOLD} />
              </TouchableOpacity>
              <TouchableOpacity onPress={resetPlan} style={s.closeBtn} activeOpacity={0.75}>
                <Ionicons name="close" size={18} color={MUTED} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Day selector (week only) */}
          {planType === 'week' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.daySelectorContent}
              style={s.daySelector}
            >
              {days.map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.dayPill, i === selectedDayIndex && s.dayPillActive]}
                  onPress={() => setSelectedDayIndex(i)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.dayPillText, i === selectedDayIndex && s.dayPillTextActive]}>
                    {day.dayLabel.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Cart strip — visible at top without scrolling */}
          <TouchableOpacity style={s.cartStrip} onPress={handleSendToCart} activeOpacity={0.85}>
            <Ionicons name="cart-outline" size={18} color={BG} />
            <Text style={s.cartStripText}>
              {planType === 'week' ? "Add week's groceries" : 'Add to Smart Cart'}
            </Text>
            <View style={s.cartStripBadge}>
              <Text style={s.cartStripBadgeText}>{ingredientCount}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={BG} />
          </TouchableOpacity>

          {/* Compact meal rows */}
          {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map(mealType => {
            const meal = selectedDay.meals[mealType];
            if (!meal) return null;
            return (
              <MealPlanCard
                key={mealType}
                meal={meal}
                onPress={() => handleOpenRecipe(meal)}
              />
            );
          })}

          {/* Totals strip — compact inline with all 4 colours */}
          <View style={s.totalsStrip}>
            {[
              { label: 'Cal',  value: String(selectedDay.totalCalories), color: TEXT  },
              { label: 'Pro',  value: `${selectedDay.totalProtein}g`,    color: CORAL },
              { label: 'Carb', value: `${selectedDay.totalCarbs}g`,      color: GOLD  },
              { label: 'Fat',  value: `${selectedDay.totalFat}g`,        color: SAGE  },
            ].map(stat => (
              <View key={stat.label} style={s.totalsStripItem}>
                <View style={[s.totalsStripDot, { backgroundColor: stat.color }]} />
                <Text style={[s.totalsStripValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={s.totalsStripLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
        <RecipeSheet
          meal={selectedMeal}
          visible={showRecipe}
          onClose={() => setShowRecipe(false)}
          onLog={() => {
            if (selectedMeal) markMealLogged(selectedDayIndex, selectedMeal.type);
            setShowRecipe(false);
          }}
        />
      </SafeAreaView>
    );
  }

  // ── CART SENT ────────────────────────────────────────────────────────────────

  if (state === 'cart_sent') {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <Text style={s.title}>Jonno</Text>
          </View>

          <View style={s.successCard}>
            <View style={s.successIconWrap}>
              <Ionicons name="checkmark" size={34} color={SAGE} />
            </View>
            <Text style={s.successTitle}>Cart is ready</Text>
            <Text style={s.successSub}>{`Ingredients sent to your Smart Cart.\nOrder from Woolworths or Coles.`}</Text>
            <TouchableOpacity
              style={s.openCartBtn}
              onPress={() => router.push('/(tabs)/cart' as any)}
              activeOpacity={0.85}
            >
              <Text style={s.openCartBtnText}>Open Smart Cart →</Text>
            </TouchableOpacity>
          </View>

          {days[0] && (
            <>
              <Text style={s.recipesHeader}>Recipes for your meals</Text>
              {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map(mealType => {
                const meal = days[0].meals[mealType];
                if (!meal) return null;
                return (
                  <TouchableOpacity
                    key={mealType}
                    style={s.recipeCard}
                    onPress={() => { setSelectedMeal(meal); setShowRecipe(true); }}
                    activeOpacity={0.8}
                  >
                    <Text style={s.recipeEmoji}>{meal.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.recipeName}>{meal.name}</Text>
                      <Text style={s.recipeMeta}>⏱ {meal.cookTime} min · {meal.difficulty}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={MUTED} />
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          <TouchableOpacity style={s.newPlanBtn} onPress={resetPlan} activeOpacity={0.8}>
            <Text style={s.newPlanText}>↺  Plan something else</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
        <RecipeSheet meal={selectedMeal} visible={showRecipe} onClose={() => setShowRecipe(false)} />
      </SafeAreaView>
    );
  }

  // ── IDLE ─────────────────────────────────────────────────────────────────────

  return (
    <TabSwipeWrapper>
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.title}>Jonno</Text>
          <View style={s.headerActions}>
            <TouchableOpacity
              style={s.headerIconBtn}
              onPress={() => router.push('/recipes' as any)}
              activeOpacity={0.75}
            >
              <Ionicons name="time-outline" size={20} color={MUTED} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.headerIconBtn, hasAnyPreferences && s.filterBtnActive]}
              onPress={() => setShowPreferences(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={20} color={hasAnyPreferences ? GOLD : MUTED} />
              {hasAnyPreferences && <View style={s.filterDotStatic} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Error ──────────────────────────────────────────────────────────── */}
        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Primary hero button ─────────────────────────────────────────────── */}
        <TouchableOpacity style={s.primaryBtn} onPress={() => handleGenerate('single')} activeOpacity={0.85}>
          <View style={s.primaryBtnInner}>
            <View style={s.primaryBtnIcon}>
              <Text style={{ fontSize: 22 }}>
                {mealCtx.mealType === 'breakfast' ? '🥣'
                  : mealCtx.mealType === 'lunch'  ? '🍽️'
                  : mealCtx.mealType === 'dinner' ? '🌙'
                  : '⚡'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.primaryBtnTitle}>{mealCtx.buttonTitle}</Text>
              <Text style={s.primaryBtnSub}>{mealCtx.buttonSub}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={BG} />
          </View>
        </TouchableOpacity>

        {/* ── Secondary action cards ──────────────────────────────────────────── */}
        <View style={s.actionGrid}>
          <TouchableOpacity style={s.actionCard} onPress={() => handleGenerate('today')} activeOpacity={0.8}>
            <View style={[s.actionIcon, { backgroundColor: 'rgba(224,123,84,0.15)' }]}>
              <Text style={{ fontSize: 20 }}>🍽️</Text>
            </View>
            <Text style={s.actionTitle}>Full day</Text>
            <Text style={s.actionSub}>4 meals</Text>
            <View style={[s.actionAccent, { backgroundColor: CORAL }]} />
          </TouchableOpacity>

          <TouchableOpacity style={s.actionCard} onPress={() => handleGenerate('week')} activeOpacity={0.8}>
            <View style={[s.actionIcon, { backgroundColor: 'rgba(245,200,66,0.12)' }]}>
              <Text style={{ fontSize: 20 }}>📅</Text>
            </View>
            <Text style={s.actionTitle}>This week</Text>
            <Text style={s.actionSub}>7 days</Text>
            <View style={[s.actionAccent, { backgroundColor: GOLD }]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.actionCard}
            onPress={() => {
              if (pantryItems.length > 0) {
                generate('single', preferences, targetsWithConsumed, {
                  mealType: mealCtx.mealType,
                  pantryItems,
                });
              } else {
                setPantryExpanded(true);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={[s.actionIcon, { backgroundColor: 'rgba(139,158,110,0.15)' }]}>
              <Text style={{ fontSize: 20 }}>🥬</Text>
            </View>
            <Text style={s.actionTitle}>
              {pantryItems.length > 0 ? 'Use pantry' : 'Add items'}
            </Text>
            <Text style={s.actionSub}>
              {pantryItems.length > 0 ? `${pantryItems.length} items` : 'Kitchen'}
            </Text>
            <View style={[s.actionAccent, { backgroundColor: SAGE }]} />
          </TouchableOpacity>
        </View>

        {/* ── Fridge & Pantry ──────────────────────────────────────────────── */}
        <View style={s.pantrySection}>
          {/* Section header */}
          <View style={s.pantrySectionHeader}>
            <View style={s.pantrySectionLeft}>
              <Ionicons name="nutrition-outline" size={18} color={SAGE} />
              <Text style={s.pantrySectionTitle}>Fridge & Pantry</Text>
              {pantryItems.length > 0 && (
                <View style={s.pantryCountBadge}>
                  <Text style={s.pantryCountText}>{pantryItems.length}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setPantryExpanded(p => !p)}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={pantryExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={DIM}
              />
            </TouchableOpacity>
          </View>

          {/* Action buttons row */}
          <View style={s.pantryBtnRow}>
            <TouchableOpacity style={s.pantryActionBtn} onPress={() => setShowScanner(true)} activeOpacity={0.8}>
              <Ionicons name="camera" size={18} color={CORAL} />
              <Text style={s.pantryActionText}>Scan fridge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.pantryActionBtn} onPress={() => { setPantryExpanded(true); setAddingPantry(true); }} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={18} color={SAGE} />
              <Text style={s.pantryActionText}>Add item</Text>
            </TouchableOpacity>
          </View>

          {/* Expanded content */}
          {pantryExpanded && (
            <View style={s.pantryExpandedContent}>
              {/* Photo thumbnails (scanner photos) */}
              {pantryPhotos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.photoThumbRow}
                  style={{ marginBottom: 12 }}
                >
                  {pantryPhotos.map(uri => (
                    <Image key={uri} source={{ uri }} style={s.photoThumb} />
                  ))}
                </ScrollView>
              )}

              {addingPantry && (
                <View style={s.pantryInputRow}>
                  <TextInput
                    style={s.pantryInput}
                    placeholder="e.g. Chicken breast"
                    placeholderTextColor={DIM}
                    value={pantryInput}
                    onChangeText={setPantryInput}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={async () => {
                      if (pantryInput.trim()) { await pantry.add(pantryInput); setPantryInput(''); }
                      setAddingPantry(false);
                    }}
                  />
                  <TouchableOpacity
                    style={s.pantryInputBtn}
                    onPress={async () => {
                      if (pantryInput.trim()) { await pantry.add(pantryInput); setPantryInput(''); }
                      setAddingPantry(false);
                    }}
                  >
                    <Text style={s.pantryInputBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}

              {pantryItems.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pantryChipsRow}>
                  {pantryItems.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={s.pantryChip}
                      onPress={() => pantry.remove(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.pantryChipText}>{item.name}</Text>
                      <Text style={s.pantryChipX}>×</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : !addingPantry ? (
                <Text style={s.pantryEmptyInline}>Scan your fridge or add items manually</Text>
              ) : null}
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <PreferencesSheet
        visible={showPreferences}
        onClose={() => {
          setShowPreferences(false);
          completeOnboarding();
        }}
      />

      <PantryScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onItemsConfirmed={handleScannerConfirm}
      />
    </SafeAreaView>
    </TabSwipeWrapper>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 100 },

  // Generating — single
  genWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, minHeight: 500 },
  genCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: CARD, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  genStar:   { fontSize: 28, color: GOLD },
  genTitle:  { fontSize: 20, fontWeight: '700', color: TEXT, textAlign: 'center', marginBottom: 8 },
  genSub:    { fontSize: 13, color: MUTED, textAlign: 'center' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  title:         { fontSize: 32, fontWeight: '900', color: TEXT, letterSpacing: -0.5 },
  headerSub:     { fontSize: 12, color: MUTED, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  closeBtn:      {
    width: 34, height: 34, borderRadius: 10, backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },

  // Header icon buttons
  headerIconBtn: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive:  { borderColor: 'rgba(245,200,66,0.4)', backgroundColor: 'rgba(245,200,66,0.08)' },
  filterDotStatic:  { position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 3.5, backgroundColor: GOLD },

  // Error
  errorBox:  { marginHorizontal: 16, marginBottom: 10, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  errorText: { fontSize: 13, color: '#DC2626', textAlign: 'center' },

  // Primary hero button (sage green)
  primaryBtn: {
    marginHorizontal: 16, borderRadius: 22, overflow: 'hidden',
    backgroundColor: SAGE, shadowColor: SAGE, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28, shadowRadius: 16, elevation: 8,
  },
  primaryBtnInner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 18, gap: 14 },
  primaryBtnIcon:  { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(28,22,18,0.12)', alignItems: 'center', justifyContent: 'center' },
  primaryBtnTitle: { fontSize: 17, fontWeight: '800', color: BG },
  primaryBtnSub:   { fontSize: 12, color: 'rgba(28,22,18,0.55)', marginTop: 2 },

  // Secondary action cards (3-col grid)
  actionGrid: { flexDirection: 'row', gap: 8, marginTop: 10, marginHorizontal: 16 },
  actionCard: {
    flex: 1, backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 14, alignItems: 'center', gap: 6, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2,
  },
  actionIcon:   { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  actionTitle:  { fontSize: 13, fontWeight: '700', color: TEXT, textAlign: 'center' },
  actionSub:    { fontSize: 11, color: MUTED, textAlign: 'center' },
  actionAccent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },

  // Pantry section
  pantrySection: {
    marginHorizontal: 16, marginTop: 20, backgroundColor: CARD, borderRadius: 22,
    borderWidth: 1, borderColor: BORDER, padding: 18,
  },
  pantrySectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pantrySectionLeft:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pantrySectionTitle:  { fontSize: 16, fontWeight: '700', color: TEXT },
  pantryCountBadge:    { backgroundColor: 'rgba(139,158,110,0.2)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  pantryCountText:     { fontSize: 11, fontWeight: '700', color: SAGE },
  pantryBtnRow:        { flexDirection: 'row', gap: 10, marginBottom: 4 },
  pantryActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: BG, borderRadius: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: BORDER,
  },
  pantryActionText:    { fontSize: 13, fontWeight: '600', color: TEXT },
  pantryExpandedContent: { marginTop: 14 },
  pantryEmptyInline:   { fontSize: 13, color: DIM, textAlign: 'center', paddingVertical: 8 },
  pantryInputRow:      { flexDirection: 'row', gap: 8, marginBottom: 12 },
  pantryInput:         { flex: 1, backgroundColor: 'rgba(248,213,97,0.04)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: TEXT, borderWidth: 1, borderColor: BORDER },
  pantryInputBtn:      { backgroundColor: SAGE, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 11, justifyContent: 'center' },
  pantryInputBtnText:  { fontSize: 14, fontWeight: '700', color: BG },
  photoThumbRow:       { gap: 8 },
  photoThumb:          { width: 56, height: 56, borderRadius: 12, backgroundColor: BG },
  pantryChipsRow:      { gap: 8 },
  pantryChip:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(139,158,110,0.12)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(139,158,110,0.25)', paddingHorizontal: 12, paddingVertical: 7 },
  pantryChipText:      { fontSize: 13, fontWeight: '500', color: SAGE },
  pantryChipX:         { fontSize: 14, color: MUTED, fontWeight: '600', marginLeft: 2 },

  // Single meal swap pills
  swapRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 12, flexWrap: 'wrap' },
  swapPill: { backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 8 },
  swapPillText: { fontSize: 13, fontWeight: '500', color: TEXT },

  fullDayLink:     { marginHorizontal: 16, marginTop: 12, alignItems: 'center', paddingVertical: 8 },
  fullDayLinkText: { fontSize: 14, color: MUTED, fontWeight: '500' },

  // Cart strip (plan_ready, at top)
  cartStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 12, marginTop: 4,
    backgroundColor: GOLD, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  cartStripText:      { flex: 1, fontSize: 14, fontWeight: '700', color: BG },
  cartStripBadge:     { backgroundColor: 'rgba(28,22,18,0.15)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  cartStripBadgeText: { fontSize: 11, fontWeight: '700', color: BG },

  // Day selector
  daySelector:       { marginBottom: 6 },
  daySelectorContent:{ paddingHorizontal: 16, gap: 8 },
  dayPill:           { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  dayPillActive:     { backgroundColor: GOLD, borderColor: GOLD },
  dayPillText:       { fontSize: 13, fontWeight: '600', color: MUTED },
  dayPillTextActive: { color: BG },

  // Totals strip (compact inline)
  totalsStrip: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 8, marginBottom: 4,
    backgroundColor: CARD, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(248,213,97,0.08)',
    paddingVertical: 10, paddingHorizontal: 20,
  },
  totalsStripItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  totalsStripDot:   { width: 6, height: 6, borderRadius: 3 },
  totalsStripValue: { fontSize: 14, fontWeight: '700' },
  totalsStripLabel: { fontSize: 10, color: 'rgba(232,224,208,0.4)', marginLeft: 2 },

  // Cart sent — success card (sage)
  successCard: {
    marginHorizontal: 16, marginTop: 8, backgroundColor: CARD, borderRadius: 28,
    borderWidth: 1, borderColor: 'rgba(139,158,110,0.3)', padding: 28, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 4,
  },
  successIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(139,158,110,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  successTitle:    { fontSize: 24, fontWeight: '800', color: TEXT },
  successSub:      { fontSize: 15, color: MUTED, textAlign: 'center', lineHeight: 22 },
  openCartBtn:     { marginTop: 10, backgroundColor: GOLD, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 14 },
  openCartBtnText: { fontSize: 16, fontWeight: '700', color: BG },

  recipesHeader: { fontSize: 18, fontWeight: '800', color: TEXT, paddingHorizontal: 20, marginTop: 24, marginBottom: 10 },
  recipeCard:    { marginHorizontal: 16, marginBottom: 10, backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  recipeEmoji:   { fontSize: 28 },
  recipeName:    { fontSize: 15, fontWeight: '700', color: TEXT },
  recipeMeta:    { fontSize: 12, color: MUTED, marginTop: 2 },

  newPlanBtn:  { marginHorizontal: 16, marginTop: 20, paddingVertical: 14, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, alignItems: 'center' },
  newPlanText: { fontSize: 15, fontWeight: '600', color: MUTED },
});
