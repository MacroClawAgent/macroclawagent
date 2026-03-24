import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAgentViewModel } from '@/lib/viewModels/useAgentViewModel';

// ── Palette ───────────────────────────────────────────────────────────────────

const NAV   = '#0F172A';
const TEAL  = '#2DD4BF';
const WHITE = '#FFFFFF';

// ── Mock data ─────────────────────────────────────────────────────────────────

type MealEntry = {
  name: string; cal: number; protein: number; time: string;
  ingredients: string; logged: boolean; isCurrent?: boolean;
};
type DayMeals = { breakfast: MealEntry; lunch: MealEntry; snack: MealEntry; dinner: MealEntry };

type WorkoutEntry = {
  type: 'strength' | 'hiit' | 'cardio' | 'rest';
  name: string; duration: number; muscles: string[];
  exercises: string[]; nutritionNote: string;
};

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type DayKey = typeof DAYS_SHORT[number];

const WEEKLY_MEAL_PLAN: Record<DayKey, DayMeals> = {
  Mon: {
    breakfast: { name: 'Greek Yogurt & Granola',    cal: 420, protein: 28, time: '7:30 AM',  ingredients: 'Greek yogurt, granola, banana, honey',              logged: true  },
    lunch:     { name: 'Grilled Chicken Wrap',       cal: 520, protein: 42, time: '12:00 PM', ingredients: 'Chicken breast, wrap, lettuce, tomato',              logged: false, isCurrent: true },
    snack:     { name: 'Protein Shake + Almonds',    cal: 280, protein: 30, time: '3:30 PM',  ingredients: 'Whey protein, almond milk, almonds',                logged: false },
    dinner:    { name: 'Salmon & Sweet Potato',      cal: 580, protein: 44, time: '7:00 PM',  ingredients: 'Atlantic salmon, sweet potato, broccoli',           logged: false },
  },
  Tue: {
    breakfast: { name: 'Oats & Blueberries',         cal: 390, protein: 22, time: '7:30 AM',  ingredients: 'Rolled oats, blueberries, chia seeds, almond milk', logged: true  },
    lunch:     { name: 'Beef Rice Bowl',              cal: 580, protein: 48, time: '12:00 PM', ingredients: 'Beef mince, jasmine rice, edamame, soy sauce',       logged: true  },
    snack:     { name: 'Cottage Cheese & Fruit',      cal: 210, protein: 24, time: '3:30 PM',  ingredients: 'Cottage cheese, mixed berries, flaxseeds',           logged: false, isCurrent: true },
    dinner:    { name: 'Chicken Stir Fry',            cal: 560, protein: 46, time: '7:00 PM',  ingredients: 'Chicken breast, bok choy, capsicum, brown rice',     logged: false },
  },
  Wed: {
    breakfast: { name: 'Eggs & Avocado Toast',        cal: 450, protein: 26, time: '7:30 AM',  ingredients: 'Sourdough, eggs, avocado, cherry tomatoes',          logged: false },
    lunch:     { name: 'Tuna Salad Bowl',              cal: 480, protein: 44, time: '12:00 PM', ingredients: 'Tuna, mixed greens, cucumber, olive oil, lemon',     logged: false },
    snack:     { name: 'Greek Yogurt & Nuts',          cal: 230, protein: 18, time: '3:30 PM',  ingredients: 'Greek yogurt, walnuts, honey',                       logged: false },
    dinner:    { name: 'Lamb & Veggie Bowl',           cal: 610, protein: 50, time: '7:00 PM',  ingredients: 'Lamb mince, roast pumpkin, spinach, quinoa',         logged: false },
  },
  Thu: {
    breakfast: { name: 'Protein Pancakes',             cal: 430, protein: 32, time: '7:30 AM',  ingredients: 'Protein powder, banana, egg, oat flour',             logged: false },
    lunch:     { name: 'Turkey Sandwich',               cal: 500, protein: 40, time: '12:00 PM', ingredients: 'Turkey breast, wholegrain bread, lettuce, mustard',  logged: false },
    snack:     { name: 'Boiled Eggs & Rice Cakes',     cal: 200, protein: 18, time: '3:30 PM',  ingredients: 'Boiled eggs, rice cakes, vegemite',                  logged: false },
    dinner:    { name: 'Barramundi & Greens',           cal: 540, protein: 46, time: '7:00 PM',  ingredients: 'Barramundi fillet, asparagus, lemon, basmati rice',  logged: false },
  },
  Fri: {
    breakfast: { name: 'Smoothie Bowl',                cal: 400, protein: 26, time: '7:30 AM',  ingredients: 'Banana, spinach, protein powder, granola, berries',  logged: false },
    lunch:     { name: 'Chicken Burrito Bowl',          cal: 560, protein: 44, time: '12:00 PM', ingredients: 'Chicken, brown rice, black beans, salsa, cheese',    logged: false },
    snack:     { name: 'Protein Bar + Apple',           cal: 250, protein: 20, time: '3:30 PM',  ingredients: 'Quest bar, apple',                                   logged: false },
    dinner:    { name: 'Beef & Broccoli',               cal: 590, protein: 48, time: '7:00 PM',  ingredients: 'Beef strips, broccoli, garlic, oyster sauce, rice',  logged: false },
  },
  Sat: {
    breakfast: { name: 'Big Brekkie Bowl',              cal: 520, protein: 34, time: '8:00 AM',  ingredients: 'Eggs, bacon, mushrooms, spinach, sourdough',         logged: false },
    lunch:     { name: 'Sushi Bowl',                    cal: 490, protein: 36, time: '1:00 PM',  ingredients: 'Salmon sashimi, sushi rice, avocado, cucumber',      logged: false },
    snack:     { name: 'Protein Shake',                 cal: 180, protein: 26, time: '4:00 PM',  ingredients: 'Whey protein, water, ice',                           logged: false },
    dinner:    { name: 'BBQ Chicken Skewers',            cal: 560, protein: 50, time: '7:00 PM',  ingredients: 'Chicken thigh, capsicum, zucchini, tzatziki, pita', logged: false },
  },
  Sun: {
    breakfast: { name: 'Banana Oat Pancakes',           cal: 410, protein: 22, time: '8:30 AM',  ingredients: 'Banana, oats, eggs, cinnamon, maple syrup',          logged: false },
    lunch:     { name: 'Chicken & Veggie Pasta',        cal: 570, protein: 44, time: '12:30 PM', ingredients: 'Penne, chicken breast, zucchini, cherry tomatoes',   logged: false },
    snack:     { name: 'Hummus & Veggie Sticks',        cal: 190, protein: 10, time: '3:30 PM',  ingredients: 'Hummus, carrot, celery, capsicum',                   logged: false },
    dinner:    { name: 'Roast Chicken & Potato',        cal: 600, protein: 50, time: '6:30 PM',  ingredients: 'Whole chicken, roast potatoes, gravy, greens',       logged: false },
  },
};

const WEEKLY_WORKOUT_PLAN: Record<DayKey, WorkoutEntry> = {
  Mon: { type: 'strength', name: 'Upper Push',    duration: 45, muscles: ['Chest', 'Shoulders', 'Triceps'],   exercises: ['Bench Press 4×8', 'OHP 3×10', 'Incline DB 3×12', 'Lateral Raise 3×15'],      nutritionNote: '+15g protein today for chest recovery' },
  Tue: { type: 'strength', name: 'Lower Body',    duration: 50, muscles: ['Quads', 'Hamstrings', 'Glutes'],   exercises: ['Squat 4×8', 'Romanian DL 3×10', 'Leg Press 3×12', 'Walking Lunges 3×12'],    nutritionNote: '+25g carbs today for leg day energy' },
  Wed: { type: 'rest',     name: 'Rest Day',       duration: 0,  muscles: [],                                 exercises: [],                                                                              nutritionNote: 'Normal targets today' },
  Thu: { type: 'strength', name: 'Upper Pull',    duration: 45, muscles: ['Back', 'Biceps'],                  exercises: ['Pull-ups 4×8', 'Barbell Row 4×8', 'Cable Row 3×12', 'DB Curl 3×12'],         nutritionNote: '+15g protein today for back recovery' },
  Fri: { type: 'hiit',     name: 'HIIT + Core',   duration: 35, muscles: ['Full Body', 'Core'],               exercises: ['Burpees 4×10', 'Mountain Climbers 3×20', 'Plank 3×45s', 'Jump Squat 3×12'], nutritionNote: '+20g carbs today for HIIT fuel' },
  Sat: { type: 'cardio',   name: 'Zone 2 Cardio', duration: 40, muscles: ['Cardiovascular'],                  exercises: ['Easy run or bike 40 min'],                                                     nutritionNote: 'Moderate carbs for endurance today' },
  Sun: { type: 'rest',     name: 'Rest Day',       duration: 0,  muscles: [],                                 exercises: [],                                                                              nutritionNote: 'Normal targets today' },
};

const WORKOUT_TYPE_LABELS: Record<WorkoutEntry['type'], string> = {
  strength: '💪 Strength',
  hiit:     '🤸 HIIT',
  cardio:   '🏃 Cardio',
  rest:     'Rest',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getThisWeekDates(): number[] {
  const now  = new Date();
  const dow  = now.getDay(); // 0=Sun,1=Mon...6=Sat
  const mon  = new Date(now);
  // Move back to Monday
  mon.setDate(now.getDate() - ((dow + 6) % 7));
  return DAYS_SHORT.map((_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d.getDate();
  });
}

function getTodayIndex(): number {
  const dow = new Date().getDay(); // 0=Sun
  return dow === 0 ? 6 : dow - 1; // Mon=0 … Sun=6
}

// ── Animated pulse dot ────────────────────────────────────────────────────────

function PulseDot() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[s.pulseDot, { opacity }]} />;
}

// ── Day selector ──────────────────────────────────────────────────────────────

function DaySelector({
  selectedIdx, onSelect, dates, hasPlan,
}: {
  selectedIdx: number; onSelect: (i: number) => void;
  dates: number[]; hasPlan: boolean[];
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 14, paddingHorizontal: 2 }}
    >
      {DAYS_SHORT.map((day, i) => {
        const active = i === selectedIdx;
        return (
          <TouchableOpacity
            key={day}
            onPress={() => onSelect(i)}
            activeOpacity={0.8}
            style={[ds.pill, active && ds.pillActive]}
          >
            <Text style={[ds.dayLetter, active && ds.activeText]}>{day[0]}</Text>
            <Text style={[ds.dayNum, active && ds.activeText]}>{dates[i]}</Text>
            {hasPlan[i] && <View style={[ds.dot, active && ds.dotActive]} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const ds = StyleSheet.create({
  pill:       { width: 42, height: 56, borderRadius: 13, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  pillActive: { backgroundColor: TEAL, borderColor: TEAL },
  dayLetter:  { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  dayNum:     { fontSize: 16, color: WHITE, fontWeight: '700' },
  activeText: { color: WHITE },
  dot:        { width: 4, height: 4, borderRadius: 2, backgroundColor: TEAL, marginTop: 2 },
  dotActive:  { backgroundColor: WHITE },
});

// ── Meal card ─────────────────────────────────────────────────────────────────

const MEAL_PILL: Record<string, { bg: string; color: string }> = {
  breakfast: { bg: 'rgba(251,191,36,0.2)',  color: '#FCD34D' },
  lunch:     { bg: 'rgba(45,212,191,0.2)',  color: '#2DD4BF' },
  snack:     { bg: 'rgba(34,197,94,0.2)',   color: '#4ADE80' },
  dinner:    { bg: 'rgba(99,102,241,0.2)',  color: '#818CF8' },
};

function MealCard({ mealType, meal }: { mealType: string; meal: MealEntry }) {
  const [logged, setLogged] = useState(meal.logged);
  const pill = MEAL_PILL[mealType] ?? MEAL_PILL.lunch;
  const label = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <View style={[mc.card, logged && mc.cardLogged]}>
      {/* Top row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Left */}
        <View style={{ flex: 1 }}>
          <View style={[mc.typePill, { backgroundColor: pill.bg }]}>
            <Text style={[mc.typePillText, { color: pill.color }]}>{label}</Text>
          </View>
          <Text style={mc.mealName} numberOfLines={1}>{meal.name}</Text>
          <Text style={mc.ingredients} numberOfLines={2}>{meal.ingredients}</Text>
        </View>
        {/* Right */}
        <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
          {logged
            ? <Ionicons name="checkmark-circle" size={20} color={TEAL} style={{ marginBottom: 2 }} />
            : null}
          <Text style={mc.calories}>{meal.cal}</Text>
          <Text style={mc.kcalLabel}>kcal</Text>
          <Text style={mc.protein}>{meal.protein}g pro</Text>
        </View>
      </View>

      {/* Bottom row */}
      <View style={mc.bottomRow}>
        <Text style={mc.time}>{meal.time}</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            style={[mc.logBtn, logged && mc.logBtnLogged]}
            onPress={() => setLogged((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={[mc.logBtnText, logged && mc.logBtnTextLogged]}>
              {logged ? 'Logged ✓' : 'Log'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={mc.cartBtn} activeOpacity={0.8}>
            <Text style={{ fontSize: 15 }}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const mc = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  cardLogged: {
    backgroundColor: 'rgba(45,212,191,0.08)',
    borderColor: 'rgba(45,212,191,0.2)',
  },
  typePill:     { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText: { fontSize: 11, fontWeight: '700' },
  mealName:     { fontSize: 16, fontWeight: '700', color: WHITE, marginTop: 6 },
  ingredients:  { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3, lineHeight: 18 },
  calories:     { fontSize: 17, fontWeight: '700', color: WHITE },
  kcalLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  protein:      { fontSize: 13, color: TEAL, fontWeight: '600', marginTop: 2 },
  bottomRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time:         { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  logBtn:       { backgroundColor: 'rgba(45,212,191,0.15)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)', paddingHorizontal: 14, paddingVertical: 6 },
  logBtnText:   { color: TEAL, fontSize: 13, fontWeight: '600' },
  logBtnLogged: { backgroundColor: 'rgba(45,212,191,0.25)', borderColor: TEAL },
  logBtnTextLogged: { color: TEAL },
  cartBtn:      { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

// ── Workout card ──────────────────────────────────────────────────────────────

function WorkoutCard({ workout }: { workout: WorkoutEntry }) {
  const [showExercises, setShowExercises] = useState(false);

  if (workout.type === 'rest') {
    return (
      <View style={wc.restCard}>
        <Text style={wc.restTitle}>Rest Day</Text>
        <Text style={wc.restSub}>Active recovery: 20min walk recommended</Text>
        <View style={wc.noteRow}>
          <Text style={wc.noteText}>🥗 {workout.nutritionNote}</Text>
        </View>
      </View>
    );
  }

  const typeLabel = WORKOUT_TYPE_LABELS[workout.type];

  return (
    <View style={wc.card}>
      {/* Top */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={wc.typePill}>
            <Text style={wc.typePillText}>{typeLabel}</Text>
          </View>
          <Text style={wc.name}>{workout.name}</Text>
          <Text style={wc.duration}>{workout.duration} min · Moderate intensity</Text>
        </View>
        {/* Muscle groups */}
        <View style={{ gap: 5, alignItems: 'flex-end', marginLeft: 12 }}>
          {workout.muscles.map((m) => (
            <View key={m} style={wc.musclePill}>
              <Text style={wc.muscleText}>{m}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Nutrition note */}
      <View style={wc.noteRow}>
        <Text style={wc.noteText}>🥗 Jonno adjusted: {workout.nutritionNote}</Text>
      </View>

      {/* Exercises toggle */}
      <TouchableOpacity
        onPress={() => setShowExercises((v) => !v)}
        activeOpacity={0.75}
        style={wc.exercisesToggle}
      >
        <Text style={wc.exercisesToggleText}>
          {showExercises ? 'Hide exercises ↑' : 'See exercises ↓'}
        </Text>
      </TouchableOpacity>

      {showExercises && (
        <View style={{ gap: 6, marginTop: 8 }}>
          {workout.exercises.map((ex) => (
            <View key={ex} style={wc.exerciseRow}>
              <View style={wc.exerciseDot} />
              <Text style={wc.exerciseText}>{ex}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const wc = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    padding: 16,
    gap: 12,
  },
  typePill:     { alignSelf: 'flex-start', backgroundColor: 'rgba(99,102,241,0.2)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText: { fontSize: 12, fontWeight: '700', color: '#818CF8' },
  name:         { fontSize: 17, fontWeight: '700', color: WHITE, marginTop: 6 },
  duration:     { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  musclePill:   { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  muscleText:   { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  noteRow:      { backgroundColor: 'rgba(45,212,191,0.1)', borderRadius: 12, padding: 10 },
  noteText:     { fontSize: 12, color: TEAL, fontWeight: '500', lineHeight: 18 },
  exercisesToggle:     { alignSelf: 'flex-start' },
  exercisesToggleText: { fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  exerciseRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exerciseDot:  { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  exerciseText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },

  restCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  restTitle: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  restSub:   { fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center' },
});

// ── Weekly split row ──────────────────────────────────────────────────────────

const SPLIT_COLOR: Record<WorkoutEntry['type'], string> = {
  strength: 'rgba(99,102,241,0.25)',
  hiit:     'rgba(239,68,68,0.2)',
  cardio:   'rgba(45,212,191,0.2)',
  rest:     'rgba(255,255,255,0.06)',
};
const SPLIT_TEXT: Record<WorkoutEntry['type'], string> = {
  strength: '#818CF8',
  hiit:     '#FCA5A5',
  cardio:   TEAL,
  rest:     'rgba(255,255,255,0.3)',
};
const SPLIT_LABELS: Record<string, string> = {
  'Upper Push': 'Upper', 'Lower Body': 'Lower', 'Upper Pull': 'Pull',
  'HIIT + Core': 'HIIT', 'Zone 2 Cardio': 'Cardio', 'Rest Day': 'Rest',
};

function WeeklySplitRow() {
  return (
    <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 14 }}>
      {DAYS_SHORT.map((day) => {
        const w = WEEKLY_WORKOUT_PLAN[day];
        return (
          <View key={day} style={[split.pill, { backgroundColor: SPLIT_COLOR[w.type] }]}>
            <Text style={[split.day, { color: SPLIT_TEXT[w.type] }]}>{day[0]}</Text>
            <Text style={[split.label, { color: SPLIT_TEXT[w.type] }]}>
              {SPLIT_LABELS[w.name] ?? w.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const split = StyleSheet.create({
  pill:  { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, alignItems: 'center' },
  day:   { fontSize: 9, fontWeight: '700' },
  label: { fontSize: 10, fontWeight: '500' },
});

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, loading, onRegen }: { title: string; loading: boolean; onRegen: () => void }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      <TouchableOpacity onPress={onRegen} activeOpacity={0.8} style={sh.btn} disabled={loading}>
        {loading
          ? <Text style={sh.btnText}>...</Text>
          : <Text style={sh.btnText}>Regenerate ↻</Text>}
      </TouchableOpacity>
    </View>
  );
}

const sh = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:   { fontSize: 16, fontWeight: '700', color: WHITE },
  btn:     { backgroundColor: 'rgba(45,212,191,0.15)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)', paddingHorizontal: 14, paddingVertical: 7 },
  btnText: { color: TEAL, fontSize: 13, fontWeight: '600' },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgentScreen() {
  const vm = useAgentViewModel();

  const todayIdx            = getTodayIndex();
  const dates               = getThisWeekDates();
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [inputText, setInputText]     = useState('');
  const [regenMeals, setRegenMeals]   = useState(false);
  const [regenWork, setRegenWork]     = useState(false);

  function handleRegenMeals() {
    setRegenMeals(true);
    vm.quickSend(
      "Generate a 7-day meal plan for someone whose goal is Build Muscle, " +
      "daily targets: 2984 cal, 191g protein, 250g carbs, 70g fat. " +
      "Make it realistic with Australian foods. " +
      "Return as structured JSON with breakfast, lunch, dinner, snack per day."
    );
    setTimeout(() => setRegenMeals(false), 3000);
  }

  function handleRegenWorkout() {
    setRegenWork(true);
    vm.quickSend(
      "Generate a weekly workout split for someone whose goal is Build Muscle. " +
      "They are intermediate level. " +
      "Return 7 days with: workout type, name, duration, muscle groups, 4-5 exercises with sets and reps. " +
      "Include 2 rest days. Also note how each training day affects their nutrition needs."
    );
    setTimeout(() => setRegenWork(false), 3000);
  }

  function handleSend() {
    const t = inputText.trim();
    if (!t || vm.sending) return;
    setInputText('');
    vm.quickSend(t);
  }

  const dayKey        = DAYS_SHORT[selectedDay];
  const dayMeals      = WEEKLY_MEAL_PLAN[dayKey];
  const dayWorkout    = WEEKLY_WORKOUT_PLAN[dayKey];
  const hasPlan       = DAYS_SHORT.map(() => true);

  const mealEntries = [
    { type: 'breakfast', meal: dayMeals.breakfast },
    { type: 'lunch',     meal: dayMeals.lunch     },
    { type: 'snack',     meal: dayMeals.snack     },
    { type: 'dinner',    meal: dayMeals.dinner    },
  ];

  const totalCal  = mealEntries.reduce((s, e) => s + e.meal.cal,     0);
  const totalPro  = mealEntries.reduce((s, e) => s + e.meal.protein, 0);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >

        {/* ── Minimal header ── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.jonnoTitle}>Jonno</Text>
            <View style={s.statusRow}>
              <PulseDot />
              <Text style={s.statusText}>Planning your week</Text>
            </View>
          </View>
          <View style={s.updatedPill}>
            <Text style={s.updatedText}>Updated now</Text>
          </View>
        </View>

        {/* ── Scrollable content ── */}
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ─────────────────── SECTION 1: MEAL PLAN ─────────────────── */}
          <SectionHeader title="This Week's Meals" loading={regenMeals} onRegen={handleRegenMeals} />

          <DaySelector
            selectedIdx={selectedDay}
            onSelect={setSelectedDay}
            dates={dates}
            hasPlan={hasPlan}
          />

          {mealEntries.map(({ type, meal }) => (
            <MealCard key={type} mealType={type} meal={meal} />
          ))}

          {/* Daily totals */}
          <Text style={s.dailyTotals}>
            Today's plan: {totalCal.toLocaleString()} cal · {totalPro}g protein · 220g carbs · 64g fat
          </Text>

          {/* ─────────────────── SECTION 2: WORKOUT PLAN ─────────────── */}
          <View style={s.sectionGap}>
            <SectionHeader title="This Week's Training" loading={regenWork} onRegen={handleRegenWorkout} />
          </View>

          <DaySelector
            selectedIdx={selectedDay}
            onSelect={setSelectedDay}
            dates={dates}
            hasPlan={hasPlan}
          />

          <WorkoutCard workout={dayWorkout} />

          <WeeklySplitRow />

          {/* ─────────────────── SECTION 3: INSIGHT ──────────────────── */}
          <View style={[s.sectionGap, s.insightCard]}>
            <Text style={s.insightLabel}>✦ Jonno's Insight</Text>
            <Text style={s.insightMain}>You're strongest on weekdays</Text>
            <Text style={s.insightDetail}>
              Your protein intake is consistently higher Mon–Fri. On weekends you drop below
              target. I've planned higher-protein weekend meals this week to compensate.
            </Text>
            <TouchableOpacity
              style={s.insightBtn}
              activeOpacity={0.85}
              onPress={() => vm.quickSend('Apply the weekend protein boost to my current meal plan.')}
            >
              <Text style={s.insightBtnText}>Apply to my plan →</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* ── Minimal bottom input ── */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Ask Jonno to adjust your plan..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!inputText.trim() || vm.sending) && s.sendBtnOff]}
            onPress={handleSend}
            disabled={!inputText.trim() || vm.sending}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up" size={18} color={TEAL} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAV },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  jonnoTitle: { fontSize: 28, fontWeight: '800', color: WHITE },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  pulseDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  statusText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  updatedPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  updatedText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  // Scroll
  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },

  // Daily totals
  dailyTotals: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    paddingVertical: 8,
    textAlign: 'center',
  },

  // Section gap
  sectionGap: { marginTop: 28 },

  // Insight card
  insightCard: {
    backgroundColor: 'rgba(45,212,191,0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.2)',
    padding: 20,
    marginTop: 28,
    gap: 10,
  },
  insightLabel:  { fontSize: 12, color: TEAL, fontWeight: '600' },
  insightMain:   { fontSize: 18, fontWeight: '700', color: WHITE, lineHeight: 26 },
  insightDetail: { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 22 },
  insightBtn: {
    backgroundColor: TEAL,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  insightBtnText: { fontSize: 15, fontWeight: '600', color: WHITE },

  // Bottom input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9,
    fontSize: 14,
    fontWeight: '500',
    color: WHITE,
  },
  sendBtn:    { width: 40, height: 40, backgroundColor: 'rgba(45,212,191,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendBtnOff: { opacity: 0.35 },
});
