import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SymbolView } from "expo-symbols";
import { useTheme } from "@/context/ThemeContext";
import { apiGet } from "@/lib/api";
import type { WeeklyDay } from "@/lib/viewModels/useHomeViewModel";

interface FoodItem {
  id: string;
  meal_tag: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  dish_name?: string | null;
  batch_id?: string | null;
}

interface ActivityRow {
  id: string;
  type: string;
  name: string;
  duration_seconds: number;
  distance_meters: number | null;
  calories: number | null;
}

interface DayDetail {
  foodItems: FoodItem[];
  activities: ActivityRow[];
  totalCals: number;
  totalProtein: number;
}

export interface DayGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"];

const BLUE       = "#3B82F6";
const GREEN      = "#22C55E";
const AMBER      = "#F59E0B";
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

/** Use local date parts — avoids UTC timezone shift from toISOString() */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDays(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/** Count consecutive logged days backwards from today (capped to data available) */
function calcStreak(
  calMap: Map<string, number>,
  calorieGoal: number,
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = toLocalDateStr(d);
    const kcal = calMap.get(dateStr) ?? 0;
    if (kcal > 0) {
      streak++;
    } else if (i === 0) {
      // Today hasn't been logged yet — don't break the streak, just skip
      continue;
    } else {
      break;
    }
  }
  return streak;
}

type DayStatus = "goal_met" | "logged" | "missed" | "future";

function getDayStatus(
  kcal: number,
  isFuture: boolean,
  calorieGoal: number,
): DayStatus {
  if (isFuture) return "future";
  if (kcal <= 0) return "missed";
  if (kcal >= calorieGoal * 0.75) return "goal_met";
  return "logged";
}

interface Props {
  weeklyCalories: WeeklyDay[];
  goals: DayGoals;
}

export function WeekCalendarStrip({ weeklyCalories, goals }: Props) {
  const { colors, isDark } = useTheme();
  const [showLegend, setShowLegend] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isFutureSelected, setIsFutureSelected] = useState(false);
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = toLocalDateStr(todayDate);
  const weekDays = useMemo(() => getWeekDays(), []);

  const calMap = useMemo(
    () => new Map(weeklyCalories.map((d) => [d.date, d.kcal])),
    [weeklyCalories]
  );

  const streak = useMemo(
    () => calcStreak(calMap, goals.calories),
    [calMap, goals.calories]
  );

  // Week range label e.g. "17–23 Mar"
  const weekLabel = useMemo(() => {
    if (weekDays.length < 7) return "";
    const start = weekDays[0];
    const end = weekDays[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}–${end.getDate()} ${MONTH_NAMES[end.getMonth()]}`;
    }
    return `${start.getDate()} ${MONTH_NAMES[start.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]}`;
  }, [weekDays]);

  /** Group food items into dish summaries */
  const groupIntoDishes = (items: FoodItem[]) => {
    const map = new Map<string, FoodItem[]>();
    for (const item of items) {
      const key = item.batch_id ?? `solo_${item.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).map(([key, groupItems]) => {
      const totalCals = groupItems.reduce((s, i) => s + (i.calories ?? 0), 0);
      const dishName =
        groupItems[0].dish_name ??
        groupItems.reduce((best, i) => (i.calories > best.calories ? i : best), groupItems[0]).name;
      return { key, dishName, totalCals, items: groupItems };
    });
  };

  const handleDayPress = async (dateStr: string, date: Date) => {
    const future = date > todayDate;
    setSelectedDate(dateStr);
    setIsFutureSelected(future);
    setDetail(null);
    if (future) return;

    setLoading(true);
    try {
      const [foodRes, actRes] = await Promise.allSettled([
        apiGet<{ items: FoodItem[] }>(`/api/nutrition/food-items?date=${dateStr}`),
        apiGet<{ activities: ActivityRow[] }>(`/api/activities?date=${dateStr}&limit=5`),
      ]);
      const foodItems = foodRes.status === "fulfilled" ? (foodRes.value.items ?? []) : [];
      const activities = actRes.status === "fulfilled" ? (actRes.value.activities ?? []) : [];
      setDetail({
        foodItems,
        activities,
        totalCals: foodItems.reduce((s, i) => s + (i.calories ?? 0), 0),
        totalProtein: foodItems.reduce((s, i) => s + (i.protein_g ?? 0), 0),
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDate(null);
    setDetail(null);
    setIsFutureSelected(false);
  };

  const selectedLabel = useMemo(() => {
    if (!selectedDate) return "";
    const d = new Date(selectedDate + "T12:00:00");
    return `${FULL_DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  }, [selectedDate]);

  return (
    <>
      {/* ══ Week strip card ══ */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowLegend((v) => !v)}
      >
      <BlurView
        intensity={isDark ? 52 : 72}
        tint={isDark ? "dark" : "light"}
        style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
      >
        {!isDark && (
          <>
            <LinearGradient
              colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.0)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.specular}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.leftShimmer}
              pointerEvents="none"
            />
          </>
        )}
        <View style={styles.cardContent}>

        {/* Day pills row with inline streak badge */}
        <View style={styles.daysRow}>
          {weekDays.map((date, idx) => {
            const dateStr = toLocalDateStr(date);
            const kcal = calMap.get(dateStr) ?? 0;
            const isToday = dateStr === todayStr;
            const isFuture = date > todayDate;
            const status = getDayStatus(kcal, isFuture, goals.calories);

            return (
              <TouchableOpacity
                key={dateStr}
                onPress={() => handleDayPress(dateStr, date)}
                style={styles.dayWrapper}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayLetter, isFuture ? styles.textDim : styles.textMid]}>
                  {DAY_LETTERS[idx]}
                </Text>
                <View style={[
                  styles.dayPill,
                  isToday && styles.dayPillToday,
                  isToday && isDark && { backgroundColor: '#E07B54', shadowColor: '#E07B54' },
                ]}>
                  <Text style={[
                    styles.dayNum,
                    isFuture ? styles.textDim : styles.textBright,
                    isToday && styles.textWhite,
                  ]}>
                    {date.getDate()}
                  </Text>
                  {status === "goal_met"  && <View style={[styles.statusDot, styles.dotGreen, isDark && { backgroundColor: '#F5C842', shadowColor: '#F5C842' }]} />}
                  {status === "logged"    && <View style={[styles.statusDot, styles.dotBlue]} />}
                  {status === "missed"    && <View style={[styles.statusDot, styles.dotEmpty, isDark && { backgroundColor: 'rgba(232,224,208,0.15)', borderColor: 'rgba(232,224,208,0.25)' }]} />}
                  {status === "future"    && <View style={[styles.statusDot, styles.dotFuture,isDark && { backgroundColor: 'rgba(232,224,208,0.15)', borderColor: 'rgba(232,224,208,0.25)' }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
          {/* Streak badge inline at end of row */}
          {streak > 0 && (
            <View style={styles.streakWrapper}>
              <View style={[styles.streakBadge, isDark && { backgroundColor: 'rgba(248,213,97,0.15)', borderWidth: 1, borderColor: 'rgba(248,213,97,0.3)' }]}>
                <SymbolView
                  name={{ ios: "flame.fill", android: "local_fire_department", web: "local_fire_department" }}
                  tintColor={isDark ? '#F5C842' : '#FFD580'}
                  size={12}
                />
                <Text style={[styles.streakCount, isDark && { color: '#F5C842' }]}>{streak}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Tap-to-reveal legend */}
        {showLegend && (
          <View style={styles.inlineLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFD580' }]} />
              <Text style={styles.legendText}>Goal met</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F5C842' }]} />
              <Text style={styles.legendText}>Logged</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dotEmpty, { width: 6, height: 6 }]} />
              <Text style={styles.legendText}>Missed</Text>
            </View>
          </View>
        )}

        </View>
      </BlurView>
      </TouchableOpacity>

      {/* ══ Bottom sheet modal ══ */}
      <Modal
        visible={!!selectedDate}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <Pressable style={styles.backdrop} onPress={closeModal} />
        <View style={[styles.sheet, { backgroundColor: colors.bg }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{selectedLabel}</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={12}>
              <Text style={[styles.closeBtn, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Future: goals view ── */}
          {isFutureSelected ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>YOUR DAILY TARGETS</Text>
              <View style={[styles.goalGrid, { backgroundColor: colors.card }]}>
                {[
                  { label: "kcal",    value: `${goals.calories}`,    color: colors.macroCalories },
                  { label: "protein", value: `${goals.protein}g`,    color: colors.macroProtein },
                  { label: "carbs",   value: `${goals.carbs}g`,      color: colors.macroCarbs },
                  { label: "fat",     value: `${goals.fat}g`,        color: colors.macroFat },
                ].map((item, idx, arr) => (
                  <React.Fragment key={item.label}>
                    <View style={styles.goalItem}>
                      <Text style={[styles.goalValue, { color: item.color }]}>{item.value}</Text>
                      <Text style={[styles.goalLabel, { color: colors.textMuted }]}>{item.label}</Text>
                    </View>
                    {idx < arr.length - 1 && (
                      <View style={[styles.goalDivider, { backgroundColor: colors.border }]} />
                    )}
                  </React.Fragment>
                ))}
              </View>
              <Text style={[styles.futureHint, { color: colors.textMuted }]}>
                Log your meals on this day to track progress against your goals.
              </Text>
              <View style={{ height: 40 }} />
            </ScrollView>
          ) : loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={isDark ? '#F5C842' : BLUE} size="large" />
            </View>
          ) : detail ? (
            /* ── Past / today: logged data ── */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              {/* Summary chips */}
              {detail.totalCals > 0 && (
                <View style={[styles.summaryRow, { backgroundColor: colors.card }]}>
                  {[
                    { value: (+detail.totalCals.toFixed(1)).toString(), label: "kcal" },
                    { value: `${+detail.totalProtein.toFixed(1)}g`, label: "protein" },
                    { value: detail.activities.length.toString(), label: "workouts" },
                  ].map((s, idx, arr) => (
                    <React.Fragment key={s.label}>
                      <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>{s.value}</Text>
                        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{s.label}</Text>
                      </View>
                      {idx < arr.length - 1 && (
                        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              )}

              {/* Food logged — display only */}
              {detail.foodItems.length > 0 ? (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MEALS LOGGED</Text>
                  {MEAL_TAGS.map((tag) => {
                    const tagItems = detail.foodItems.filter((f) => f.meal_tag === tag);
                    if (tagItems.length === 0) return null;
                    const dishes = groupIntoDishes(tagItems);
                    return (
                      <View key={tag} style={styles.mealGroup}>
                        <Text style={[styles.mealTagLabel, { color: isDark ? '#F5C842' : BLUE }]}>{tag}</Text>
                        {dishes.map((dish) => (
                          <View key={dish.key} style={[styles.dishCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.dishHeader}>
                              <Text style={[styles.dishName, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                                {dish.dishName}
                              </Text>
                              <Text style={[styles.dishCal, { color: colors.textMuted }]}>
                                {+dish.totalCals.toFixed(0)} kcal
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </>
              ) : (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No food logged this day.
                </Text>
              )}

              {/* Activity */}
              {detail.activities.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ACTIVITY</Text>
                  {detail.activities.map((act) => (
                    <View key={act.id} style={[styles.actRow, { backgroundColor: colors.card }]}>
                      <Text style={[styles.actName, { color: colors.text }]}>{act.name}</Text>
                      <Text style={[styles.actDetail, { color: colors.textMuted }]}>
                        {act.type}
                        {` · ${Math.round(act.duration_seconds / 60)} min`}
                        {act.calories ? ` · ${act.calories} kcal` : ""}
                        {act.distance_meters ? ` · ${(act.distance_meters / 1000).toFixed(1)} km` : ""}
                      </Text>
                    </View>
                  ))}
                </>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          ) : (
            <View style={styles.loadingWrap}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nothing logged this day.</Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Card ──────────────────────────────────────────────────────────
  card: {
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: "#4A90B8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  cardDark: {
    backgroundColor: '#1C1410',
    borderColor: 'rgba(255,220,150,0.12)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  cardContent: {
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 14,
  },
  streakWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  specular: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 68,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
  },
  leftShimmer: {
    position: "absolute",
    top: 0, left: 0, bottom: 0,
    width: 56,
    borderTopLeftRadius: 27,
    borderBottomLeftRadius: 27,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardHeaderLeft: { gap: 1 },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
     },
  cardSub: {
    fontSize: 13,
    fontWeight: "700",
       color: "rgba(255,255,255,0.75)",
  },
  // ── Streak badge ──────────────────────────────────────────────────
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251,200,120,0.25)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  streakCount: {
    fontSize: 15,
    fontWeight: "700",
       color: "#FFD580",
  },
  // ── Legend ────────────────────────────────────────────────────────
  inlineLegend: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  // ── Days row ──────────────────────────────────────────────────────
  daysRow: {
    flexDirection: "row",
  },
  dayWrapper: {
    flex: 1,
    alignItems: "center",
  },
  dayPill: {
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 12,
    gap: 3,
    minWidth: 32,
  },
  dayPillToday: {
    backgroundColor: "#3B6FD4",
    shadowColor: "#3B6FD4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  dayLetter: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 2 },
  dayNum: { fontSize: 18, fontWeight: "700", letterSpacing: 0.5 },
  textBright: { color: "rgba(255,255,255,0.9)" },
  textMid: { color: "rgba(255,255,255,0.65)" },
  textWhite: { color: "#fff" },
  textDim: { color: "rgba(255,255,255,0.3)" },
  // ── Status dots ───────────────────────────────────────────────────
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  dotGreen: {
    backgroundColor: "#FFD580",
    shadowColor: "#FFD580",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  dotAmber: {
    backgroundColor: AMBER,
  },
  dotBlue: {
    backgroundColor: "#F5C842",
    shadowColor: "#F5C842",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  dotEmpty: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  dotFuture: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 12, fontWeight: "700", letterSpacing: 1, color: "rgba(255,255,255,0.65)" },
  // ── Modal ─────────────────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    paddingHorizontal: 20,
    maxHeight: "82%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 22, fontWeight: "700", letterSpacing: 1.5 },
  closeBtn: { fontSize: 18 },
  loadingWrap: { paddingVertical: 48, alignItems: "center" },
  sheetContent: { paddingBottom: 8 },
  // Goals grid
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 8,
  },
  goalGrid: {
    flexDirection: "row",
    borderRadius: 14,
    paddingVertical: 16,
  },
  goalItem: { flex: 1, alignItems: "center", gap: 3 },
  goalValue: { fontSize: 22, fontWeight: "700", letterSpacing: 1 },
  goalLabel: { fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  goalDivider: { width: 1, marginVertical: 6 },
  futureHint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 20,
  },
  // Summary row
  summaryRow: {
    flexDirection: "row",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryValue: { fontSize: 23, fontWeight: "700", letterSpacing: 1 },
  summaryLabel: { fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  summaryDivider: { width: 1, marginVertical: 4 },
  // Food — dish cards
  mealGroup: { marginBottom: 8 },
  mealTagLabel: { fontSize: 16, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  dishCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
    overflow: "hidden",
  },
  dishHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dishName: { fontSize: 16, fontWeight: "700", letterSpacing: 0.8 },
  dishCal: { fontSize: 15, fontWeight: "700", letterSpacing: 0.8 },
  // Activity
  actRow: { borderRadius: 12, padding: 12, marginBottom: 8, gap: 3 },
  actName: { fontSize: 17, fontWeight: "700", letterSpacing: 1 },
  actDetail: { fontSize: 14, fontWeight: "700", letterSpacing: 0.8 },
  emptyText: { fontSize: 16, fontWeight: "700", letterSpacing: 1, textAlign: "center", paddingVertical: 24 },
});
