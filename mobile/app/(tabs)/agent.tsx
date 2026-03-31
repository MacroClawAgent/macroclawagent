import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreferences } from '@/hooks/usePreferences';
import { useMealPlan } from '@/hooks/useMealPlan';
import { usePantry } from '@/hooks/usePantry';
import { getPreferencesSummary } from '@/services/preferencesService';
import { getCurrentMealContext } from '@/utils/mealContext';
import { apiGet } from '@/lib/api';
import PreferencesSheet from '@/components/Agent/PreferencesSheet';
import MealPlanCard from '@/components/Agent/MealPlanCard';
import RecipeSheet from '@/components/Agent/RecipeSheet';
import GeneratingLoader from '@/components/Agent/GeneratingLoader';
import PantryScanner from '@/components/Agent/PantryScanner';
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

const NUTRITION_TARGETS = {
  calories: 2984,
  protein: 191,
  carbs: 250,
  fat: 70,
  goal: 'Build Muscle',
};

const TIP_KEY = 'jonno_agent_tip_dismissed';

// ── Pulsing dot for filter button (first-time users) ─────────────────────────

function PulseDot() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.6, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);
  return <Animated.View style={[s.pulseDot, { transform: [{ scale }] }]} />;
}

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
  const { preferences, hasAnyPreferences, completeOnboarding } = usePreferences();

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

  const { items: pantryItems, add: addPantryItem, remove: removePantryItem } = usePantry();

  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedMeal,    setSelectedMeal]    = useState<Meal | null>(null);
  const [showRecipe,      setShowRecipe]      = useState(false);
  const [addingPantry,    setAddingPantry]    = useState(false);
  const [pantryInput,     setPantryInput]     = useState('');
  const [pantryExpanded,  setPantryExpanded]  = useState(false);
  const [showScanner,     setShowScanner]     = useState(false);
  const [tipDismissed,    setTipDismissed]    = useState(true);
  const [todayConsumed,   setTodayConsumed]   = useState<{ calories: number; protein: number } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(TIP_KEY)
      .then(v => { if (!v) setTipDismissed(false); })
      .catch(() => {});
    apiGet<{ calories_consumed?: number; protein_g?: number }>('/api/nutrition/today')
      .then(d => setTodayConsumed({ calories: d.calories_consumed ?? 0, protein: d.protein_g ?? 0 }))
      .catch(() => {});
  }, []);

  const dismissTip = useCallback(async () => {
    setTipDismissed(true);
    await AsyncStorage.setItem(TIP_KEY, '1');
  }, []);

  const mealCtx        = getCurrentMealContext();
  const prefTags       = getPreferencesSummary(preferences);
  const selectedDay    = days[selectedDayIndex];
  const ingredientCount = getAllIngredientsCount();
  const targetsWithConsumed = { ...NUTRITION_TARGETS, consumed: todayConsumed ?? undefined };

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
  const handleScannerConfirm = useCallback(async (items: string[]) => {
    for (const name of items) { await addPantryItem(name); }
  }, [addPantryItem]);

  // Context card — dynamic lines
  const contextLines: { text: string; primary?: boolean }[] = [];
  if (todayConsumed) {
    const remCal = Math.max(0, NUTRITION_TARGETS.calories - todayConsumed.calories);
    const remPro = Math.max(0, NUTRITION_TARGETS.protein - todayConsumed.protein);
    if (remCal > 100) {
      contextLines.push({ text: `${remCal} kcal · ${remPro}g protein left today`, primary: true });
    } else {
      contextLines.push({ text: 'Targets hit for today. Well done.', primary: true });
    }
  } else {
    contextLines.push({ text: `${NUTRITION_TARGETS.calories} kcal · ${NUTRITION_TARGETS.protein}g protein goal`, primary: true });
  }
  if (pantryItems.length > 0) {
    contextLines.push({ text: `${pantryItems.length} ingredient${pantryItems.length > 1 ? 's' : ''} in your kitchen I can use` });
  }
  if (hasAnyPreferences && prefTags.length > 0) {
    contextLines.push({ text: `${prefTags.slice(0, 2).join(' · ')} preferences active` });
  }

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
            onLog={() => {}}
            onRecipe={() => { setSelectedMeal(singleMeal); setShowRecipe(true); }}
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
        <RecipeSheet meal={selectedMeal} visible={showRecipe} onClose={() => setShowRecipe(false)} />
      </SafeAreaView>
    );
  }

  // ── PLAN READY — full day / week ─────────────────────────────────────────────

  if (state === 'plan_ready' && selectedDay) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <View>
              <Text style={s.title}>{planType === 'today' ? "Today's Plan" : 'This Week'}</Text>
              <Text style={s.headerSub}>Generated by Jonno ✦</Text>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity
                style={s.regenBtn}
                onPress={() => regenerate(preferences, NUTRITION_TARGETS)}
                disabled={isRegenerating}
                activeOpacity={0.8}
              >
                <Text style={s.regenBtnText}>{isRegenerating ? '...' : '↻ Regenerate'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetPlan} style={s.closeBtn} activeOpacity={0.75}>
                <Ionicons name="close" size={18} color={MUTED} />
              </TouchableOpacity>
            </View>
          </View>

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

          {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map(mealType => {
            const meal = selectedDay.meals[mealType];
            if (!meal) return null;
            return (
              <MealPlanCard
                key={mealType}
                meal={meal}
                onLog={() => markMealLogged(selectedDayIndex, mealType)}
                onRecipe={() => handleOpenRecipe(meal)}
              />
            );
          })}

          <View style={s.totalsCard}>
            <Text style={s.totalsHeading}>
              {planType === 'today' ? "Today's totals" : selectedDay.dayLabel}
            </Text>
            <View style={s.totalsRow}>
              {[
                { label: 'Cal',     value: String(selectedDay.totalCalories), color: TEXT  },
                { label: 'Protein', value: `${selectedDay.totalProtein}g`,    color: CORAL },
                { label: 'Carbs',   value: `${selectedDay.totalCarbs}g`,      color: GOLD  },
                { label: 'Fat',     value: `${selectedDay.totalFat}g`,        color: SAGE  },
              ].map(stat => (
                <View key={stat.label} style={s.totalStat}>
                  <Text style={[s.totalValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={s.totalLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={s.cartBtn} onPress={handleSendToCart} activeOpacity={0.85}>
            <View style={s.cartBtnInner}>
              <View style={s.cartIconCircle}>
                <Ionicons name="cart" size={24} color={BG} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cartBtnTitle}>
                  {planType === 'week'
                    ? `Send Week's Groceries — ${ingredientCount} ingredients`
                    : `Send to Smart Cart — ${ingredientCount} ingredients`}
                </Text>
                <Text style={s.cartBtnSub}>Woolworths or Coles</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={BG} />
            </View>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
        <RecipeSheet meal={selectedMeal} visible={showRecipe} onClose={() => setShowRecipe(false)} />
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
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.title}>Jonno</Text>
          <TouchableOpacity
            style={[s.filterBtn, hasAnyPreferences && s.filterBtnActive]}
            onPress={() => setShowPreferences(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={20} color={hasAnyPreferences ? GOLD : MUTED} />
            {!hasAnyPreferences && <PulseDot />}
            {hasAnyPreferences && <View style={s.filterDotStatic} />}
          </TouchableOpacity>
        </View>

        {/* ── Context card ────────────────────────────────────────────────────── */}
        <View style={s.contextCard}>
          <Text style={s.contextBadge}>✦  Jonno</Text>
          {contextLines.map((line, i) => (
            <Text
              key={i}
              style={[s.contextLine, line.primary && s.contextLinePrimary]}
            >
              {line.text}
            </Text>
          ))}
        </View>

        {/* ── Onboarding tip (first-time, between context card and hero) ──────── */}
        {!tipDismissed && !hasAnyPreferences && (
          <View style={s.tipCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.tipTitle}>Personalise your meals</Text>
              <Text style={s.tipBody}>
                Tell Jonno about dietary preferences, budget and cuisine. Tap the filter icon above.
              </Text>
            </View>
            <TouchableOpacity onPress={dismissTip} activeOpacity={0.75} style={s.tipClose}>
              <Ionicons name="close" size={14} color={DIM} />
            </TouchableOpacity>
          </View>
        )}

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

        {/* ── Secondary pills ─────────────────────────────────────────────────── */}
        <View style={s.pillsRow}>
          <TouchableOpacity style={s.pill} onPress={() => handleGenerate('today')} activeOpacity={0.75}>
            <Text style={s.pillText}>Full day</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.pill} onPress={() => handleGenerate('week')} activeOpacity={0.75}>
            <Text style={s.pillText}>This week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.pill}
            onPress={() => {
              if (pantryItems.length > 0) {
                generate('single', preferences, targetsWithConsumed, {
                  mealType: mealCtx.mealType,
                  pantryItems,
                });
              } else {
                setShowPreferences(true);
              }
            }}
            activeOpacity={0.75}
          >
            <Text style={s.pillText}>{pantryItems.length > 0 ? 'Use pantry' : 'Customise'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Pantry section — collapsible ────────────────────────────────────── */}
        <View style={s.pantryStrip}>
          {/* Always-visible header row */}
          <TouchableOpacity
            style={s.pantryStripHeader}
            onPress={() => setPantryExpanded(p => !p)}
            activeOpacity={0.8}
          >
            <View style={s.pantryStripLeft}>
              <Text style={s.pantryStripTitle}>In your kitchen</Text>
              {pantryItems.length > 0 && (
                <View style={s.pantryCountBadge}>
                  <Text style={s.pantryCountText}>{pantryItems.length}</Text>
                </View>
              )}
            </View>
            <View style={s.pantryStripActions}>
              <TouchableOpacity
                onPress={() => setShowScanner(true)}
                style={s.scanBtn}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="camera-outline" size={18} color={MUTED} />
              </TouchableOpacity>
              <Ionicons
                name={pantryExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={DIM}
              />
            </View>
          </TouchableOpacity>

          {/* Expanded content */}
          {pantryExpanded && (
            <>
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
                      if (pantryInput.trim()) { await addPantryItem(pantryInput); setPantryInput(''); }
                      setAddingPantry(false);
                    }}
                  />
                  <TouchableOpacity
                    style={s.pantryInputBtn}
                    onPress={async () => {
                      if (pantryInput.trim()) { await addPantryItem(pantryInput); setPantryInput(''); }
                      setAddingPantry(false);
                    }}
                  >
                    <Text style={s.pantryInputBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}

              {pantryItems.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pantryChipsRow} style={{ marginTop: 10 }}>
                  {pantryItems.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={s.pantryChip}
                      onPress={() => removePantryItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.pantryChipText}>{item.name}</Text>
                      <Text style={s.pantryChipX}>×</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={s.pantryEmptyInline}>Nothing added yet</Text>
              )}

              {!addingPantry && (
                <TouchableOpacity style={s.pantryAddRow} onPress={() => setAddingPantry(true)} activeOpacity={0.75}>
                  <Text style={s.pantryAddLink}>+ Type an item</Text>
                </TouchableOpacity>
              )}
            </>
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

  // Filter button
  filterBtn: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive:  { borderColor: 'rgba(245,200,66,0.4)', backgroundColor: 'rgba(245,200,66,0.08)' },
  pulseDot:         { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD },
  filterDotStatic:  { position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 3.5, backgroundColor: GOLD },

  // Context card
  contextCard: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 10,
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
  },
  contextBadge:       { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  contextLine:        { fontSize: 14, color: MUTED, lineHeight: 20, marginTop: 4 },
  contextLinePrimary: { fontSize: 16, fontWeight: '600', color: TEXT, marginTop: 0 },

  // Tip card
  tipCard: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: 'rgba(245,200,66,0.06)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(245,200,66,0.18)',
    padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: GOLD, marginBottom: 3 },
  tipBody:  { fontSize: 12, color: MUTED, lineHeight: 18 },
  tipClose: { paddingTop: 2 },

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

  // Secondary pills
  pillsRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginHorizontal: 16 },
  pill:     { flex: 1, backgroundColor: CARD, borderRadius: 18, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  pillText: { fontSize: 13, fontWeight: '600', color: TEXT },

  // Pantry strip (collapsible)
  pantryStrip: {
    marginHorizontal: 16, backgroundColor: CARD, borderRadius: 18,
    borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 12,
  },
  pantryStripHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pantryStripLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pantryStripTitle:   { fontSize: 13, fontWeight: '600', color: MUTED },
  pantryCountBadge:   { backgroundColor: 'rgba(139,158,110,0.2)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 },
  pantryCountText:    { fontSize: 11, fontWeight: '700', color: SAGE },
  pantryStripActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scanBtn:            { width: 30, height: 30, borderRadius: 8, backgroundColor: BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  pantryEmptyInline:  { fontSize: 13, color: DIM, marginTop: 10 },
  pantryAddRow:       { marginTop: 10 },
  pantryAddLink:      { fontSize: 13, fontWeight: '600', color: CORAL },
  pantryInputRow:     { flexDirection: 'row', gap: 8, marginTop: 10 },
  pantryInput:        { flex: 1, backgroundColor: 'rgba(248,213,97,0.04)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, color: TEXT, borderWidth: 1, borderColor: BORDER },
  pantryInputBtn:     { backgroundColor: CORAL, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9, justifyContent: 'center' },
  pantryInputBtnText: { fontSize: 14, fontWeight: '700', color: BG },
  pantryChipsRow:     { gap: 8 },
  pantryChip:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(139,158,110,0.12)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(139,158,110,0.25)', paddingHorizontal: 12, paddingVertical: 6 },
  pantryChipText:     { fontSize: 13, fontWeight: '500', color: SAGE },
  pantryChipX:        { fontSize: 14, color: MUTED, fontWeight: '600', marginLeft: 2 },

  // Single meal swap pills
  swapRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 12, flexWrap: 'wrap' },
  swapPill: { backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 8 },
  swapPillText: { fontSize: 13, fontWeight: '500', color: TEXT },

  fullDayLink:     { marginHorizontal: 16, marginTop: 12, alignItems: 'center', paddingVertical: 8 },
  fullDayLinkText: { fontSize: 14, color: MUTED, fontWeight: '500' },

  // Plan ready — header actions
  regenBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
    backgroundColor: 'rgba(245,200,66,0.10)', borderWidth: 1, borderColor: 'rgba(245,200,66,0.25)',
    minWidth: 100, alignItems: 'center',
  },
  regenBtnText: { fontSize: 13, fontWeight: '600', color: GOLD },

  // Day selector
  daySelector:       { marginBottom: 6 },
  daySelectorContent:{ paddingHorizontal: 16, gap: 8 },
  dayPill:           { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  dayPillActive:     { backgroundColor: GOLD, borderColor: GOLD },
  dayPillText:       { fontSize: 13, fontWeight: '600', color: MUTED },
  dayPillTextActive: { color: BG },

  // Totals card
  totalsCard: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 16,
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3,
  },
  totalsHeading: { fontSize: 12, fontWeight: '600', color: DIM, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  totalsRow:     { flexDirection: 'row', justifyContent: 'space-around' },
  totalStat:     { alignItems: 'center' },
  totalValue:    { fontSize: 22, fontWeight: '800' },
  totalLabel:    { fontSize: 11, color: MUTED, marginTop: 2 },

  // Cart CTA (gold)
  cartBtn: {
    marginHorizontal: 16, borderRadius: 22, overflow: 'hidden',
    backgroundColor: GOLD, shadowColor: GOLD, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22, shadowRadius: 16, elevation: 8,
  },
  cartBtnInner:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 18, gap: 14 },
  cartIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(28,22,18,0.12)', alignItems: 'center', justifyContent: 'center' },
  cartBtnTitle:   { fontSize: 16, fontWeight: '800', color: BG },
  cartBtnSub:     { fontSize: 12, color: 'rgba(28,22,18,0.55)', marginTop: 2 },

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
