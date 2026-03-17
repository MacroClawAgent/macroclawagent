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

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"];

// ── Use local date parts to avoid UTC timezone shift ──────────────────────────
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDays(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay(); // 0 = Sunday
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

interface Props {
  weeklyCalories: WeeklyDay[];
  goals: DayGoals;
}

export function WeekCalendarStrip({ weeklyCalories, goals }: Props) {
  const { colors } = useTheme();
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

  const handleDayPress = async (dateStr: string, date: Date) => {
    const future = date > todayDate;
    setSelectedDate(dateStr);
    setIsFutureSelected(future);
    setDetail(null);

    if (future) return; // goals view, no fetch needed

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

  // Build label from dateStr using local parts to avoid timezone shift
  const selectedLabel = useMemo(() => {
    if (!selectedDate) return "";
    // Parse as local noon to get correct day-of-week
    const d = new Date(selectedDate + "T12:00:00");
    return `${FULL_DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  }, [selectedDate]);

  return (
    <>
      {/* ── Week strip ── */}
      <View style={styles.strip}>
        {weekDays.map((date, i) => {
          const dateStr = toLocalDateStr(date);
          const kcal = calMap.get(dateStr) ?? 0;
          const isToday = dateStr === todayStr;
          const isFuture = date > todayDate;
          const hasLog = kcal > 0;

          return (
            <TouchableOpacity
              key={dateStr}
              onPress={() => handleDayPress(dateStr, date)}
              style={styles.dayWrapper}
              activeOpacity={0.75}
            >
              <View style={[styles.dayPill, isToday && styles.dayPillToday]}>
                <Text style={[
                  styles.dayLetter,
                  isFuture ? styles.textFuture : styles.textNormal,
                  isToday && styles.textToday,
                ]}>
                  {DAY_LETTERS[i]}
                </Text>
                <Text style={[
                  styles.dayNum,
                  isFuture ? styles.textFuture : styles.textNormal,
                  isToday && styles.textToday,
                ]}>
                  {date.getDate()}
                </Text>
                <View style={[
                  styles.dot,
                  hasLog
                    ? styles.dotFilled
                    : isFuture
                    ? styles.dotFuture
                    : styles.dotEmpty,
                ]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Bottom sheet modal ── */}
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
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {selectedLabel}
            </Text>
            <TouchableOpacity onPress={closeModal} hitSlop={12}>
              <Text style={[styles.closeBtn, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── FUTURE DAY: show goals ── */}
          {isFutureSelected ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <Text style={[styles.goalsHeading, { color: colors.textMuted }]}>
                YOUR DAILY TARGETS
              </Text>
              <View style={[styles.goalGrid, { backgroundColor: colors.card }]}>
                <View style={styles.goalItem}>
                  <Text style={[styles.goalValue, { color: colors.macroCalories }]}>
                    {goals.calories}
                  </Text>
                  <Text style={[styles.goalLabel, { color: colors.textMuted }]}>kcal</Text>
                </View>
                <View style={[styles.goalDivider, { backgroundColor: colors.border }]} />
                <View style={styles.goalItem}>
                  <Text style={[styles.goalValue, { color: colors.macroProtein }]}>
                    {goals.protein}g
                  </Text>
                  <Text style={[styles.goalLabel, { color: colors.textMuted }]}>protein</Text>
                </View>
                <View style={[styles.goalDivider, { backgroundColor: colors.border }]} />
                <View style={styles.goalItem}>
                  <Text style={[styles.goalValue, { color: colors.macroCarbs }]}>
                    {goals.carbs}g
                  </Text>
                  <Text style={[styles.goalLabel, { color: colors.textMuted }]}>carbs</Text>
                </View>
                <View style={[styles.goalDivider, { backgroundColor: colors.border }]} />
                <View style={styles.goalItem}>
                  <Text style={[styles.goalValue, { color: colors.macroFat }]}>
                    {goals.fat}g
                  </Text>
                  <Text style={[styles.goalLabel, { color: colors.textMuted }]}>fat</Text>
                </View>
              </View>
              <Text style={[styles.futureHint, { color: colors.textMuted }]}>
                Log your meals on this day to track progress against these targets.
              </Text>
              <View style={{ height: 40 }} />
            </ScrollView>
          ) : loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.blue} size="large" />
            </View>
          ) : detail ? (
            /* ── PAST / TODAY: show logged data ── */
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              {/* Summary row */}
              {detail.totalCals > 0 && (
                <View style={[styles.summaryRow, { backgroundColor: colors.card }]}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {Math.round(detail.totalCals)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>kcal</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {Math.round(detail.totalProtein)}g
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>protein</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {detail.activities.length}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>workouts</Text>
                  </View>
                </View>
              )}

              {/* Food */}
              {detail.foodItems.length > 0 ? (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>FOOD LOGGED</Text>
                  {MEAL_TAGS.map((tag) => {
                    const items = detail.foodItems.filter((f) => f.meal_tag === tag);
                    if (items.length === 0) return null;
                    return (
                      <View key={tag} style={styles.mealGroup}>
                        <Text style={[styles.mealTagLabel, { color: colors.blue }]}>{tag}</Text>
                        {items.map((item) => (
                          <View key={item.id} style={[styles.foodRow, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.foodName, { color: colors.text }]} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text style={[styles.foodCal, { color: colors.textMuted }]}>
                              {Math.round(item.calories)} kcal
                            </Text>
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
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Nothing logged this day.
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const BLUE = "#4C7DFF";

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "rgba(76,125,255,0.25)",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  dayWrapper: {
    flex: 1,
    alignItems: "center",
  },
  dayPill: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 12,
    gap: 2,
  },
  dayPillToday: {
    backgroundColor: BLUE,
  },
  dayLetter: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  dayNum: {
    fontSize: 15,
    fontWeight: "700",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 3,
  },
  dotFilled: {
    backgroundColor: "#fff",
  },
  dotEmpty: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  dotFuture: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  textNormal: { color: "rgba(255,255,255,0.85)" },
  textToday: { color: "#fff", fontWeight: "800" },
  textFuture: { color: "rgba(255,255,255,0.35)" },
  // Sheet
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 20,
    maxHeight: "82%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
  closeBtn: { fontSize: 18 },
  loadingWrap: { paddingVertical: 48, alignItems: "center" },
  sheetContent: { gap: 4 },
  // Goals view
  goalsHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  goalGrid: {
    flexDirection: "row",
    borderRadius: 14,
    paddingVertical: 16,
  },
  goalItem: { flex: 1, alignItems: "center", gap: 3 },
  goalValue: { fontSize: 19, fontWeight: "700" },
  goalLabel: { fontSize: 11, fontWeight: "500" },
  goalDivider: { width: 1, marginVertical: 4 },
  futureHint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 19,
  },
  // Past/today summary
  summaryRow: {
    flexDirection: "row",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryValue: { fontSize: 20, fontWeight: "700" },
  summaryLabel: { fontSize: 11, fontWeight: "500" },
  summaryDivider: { width: 1, marginVertical: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
  },
  mealGroup: { marginBottom: 8 },
  mealTagLabel: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  foodName: { flex: 1, fontSize: 14, fontWeight: "500", marginRight: 8 },
  foodCal: { fontSize: 13, fontWeight: "500" },
  actRow: { borderRadius: 12, padding: 12, marginBottom: 8, gap: 3 },
  actName: { fontSize: 14, fontWeight: "600" },
  actDetail: { fontSize: 12 },
  emptyText: { fontSize: 14, textAlign: "center", paddingVertical: 24 },
});
