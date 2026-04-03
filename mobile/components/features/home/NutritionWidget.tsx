import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SymbolView } from "expo-symbols";
import { useTheme } from "@/context/ThemeContext";

interface MacroStat {
  consumed: number;
  target: number;
  ratio: number;
}

export interface WeeklyDay { date: string; kcal: number; }

interface NutritionWidgetProps {
  calorieProgress: { consumed: number; target: number; remaining: number; ratio: number };
  macros: {
    protein: MacroStat;
    carbs: MacroStat;
    fat: MacroStat;
    fiber?: MacroStat;
  };
  goalLabel: string;
  weeklyCalories?: WeeklyDay[];
}

type Mode = 'daily' | 'weekly' | 'monthly';
const MODE_ORDER: Mode[] = ['daily', 'weekly', 'monthly'];
const MODE_LABELS: Record<Mode, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

// ── Colours ────────────────────────────────────────────────────────────────
const CORAL = '#E07B54';
const GOLD  = '#F5C842';
const SAGE  = '#8B9E6E';
const CREAM = '#E8E0D0';

// ── Shared MacroBar (daily view) ───────────────────────────────────────────

function MacroBar({ label, color, trackColor, consumed, target }: {
  label: string; color: string; trackColor: string; consumed: number; target: number;
}) {
  const { isDark } = useTheme();
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  return (
    <View style={mb.col}>
      <Text style={[mb.grams, { color }]}>{Math.round(consumed)}g</Text>
      <View style={[mb.track, { backgroundColor: trackColor }]}>
        <View style={{ flex: Math.max(0.001, 1 - pct) }} />
        {pct > 0 && <View style={[mb.fill, { flex: pct, backgroundColor: color }]} />}
      </View>
      <Text style={[mb.label, isDark && { color: CREAM }]}>{label}</Text>
      <Text style={[mb.target, isDark && { color: 'rgba(232,224,208,0.4)' }]}>{target}g</Text>
    </View>
  );
}

const mb = StyleSheet.create({
  col: { flex: 1, alignItems: "center", gap: 4 },
  grams: { fontSize: 14, fontWeight: "800" },
  track: { width: 36, flex: 1, borderRadius: 10, overflow: "hidden" },
  fill: { width: "100%", borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  label: { fontSize: 12, fontWeight: "600", color: "#1E293B" },
  target: { fontSize: 11, fontWeight: "500", color: "#94A3B8" },
});

// ── Main Widget ───────────────────────────────────────────────────────────

export function NutritionWidget({ calorieProgress, macros, goalLabel, weeklyCalories = [] }: NutritionWidgetProps) {
  const { isDark } = useTheme();
  const [mode, setMode] = useState<Mode>('daily');

  const cycleMode = () => {
    const idx = MODE_ORDER.indexOf(mode);
    setMode(MODE_ORDER[(idx + 1) % MODE_ORDER.length]);
  };

  const calPct = Math.round(calorieProgress.ratio * 100);

  // Weekly data
  const weekDays = weeklyCalories.length > 0 ? weeklyCalories : [];
  const weekLogged = weekDays.filter(d => d.kcal > 0);
  const weekDaysLogged = weekLogged.length;
  const weekAvgCal = weekDaysLogged > 0 ? Math.round(weekLogged.reduce((s, d) => s + d.kcal, 0) / weekDaysLogged) : 0;
  const weekBest = weekDays.length > 0 ? Math.max(...weekDays.map(d => d.kcal)) : 0;
  const todayDow = (new Date().getDay() + 6) % 7; // 0=Mon

  // Monthly: 4-week structure (mock using weekly data shifted)
  const moWeeks = [
    [0, 1920, 2100, 0, 1800, 0, 0],      // Week 1
    [2050, 1980, 0, 2100, 1900, 2200, 0], // Week 2
    [0, 1880, 2000, 1950, 0, 1800, 0],    // Week 3
    wk,                                     // Week 4 = current week
  ];
  const target = calorieProgress.target;
  const moAllDays = moWeeks.flat();
  const moLoggedDays = moAllDays.filter(v => v > 0);
  const moTotalLogged = moLoggedDays.length;
  const moAvg = moTotalLogged > 0 ? Math.round(moLoggedDays.reduce((a, b) => a + b, 0) / moTotalLogged) : 0;
  const moGoalHits = target > 0 ? moLoggedDays.filter(v => v >= target * 0.85).length : 0;
  const moGoalPct = moTotalLogged > 0 ? Math.round((moGoalHits / moTotalLogged) * 100) : 0;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={cycleMode} style={{ flex: 1 }}>
      <BlurView
        intensity={isDark ? 52 : 72}
        tint={isDark ? "dark" : "light"}
        style={[s.outerCard, isDark ? s.outerCardDark : s.outerCardLight]}
      >
        {!isDark && (
          <>
            <LinearGradient colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.0)']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={s.specular} pointerEvents="none" />
            <LinearGradient colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.leftShimmer} pointerEvents="none" />
          </>
        )}

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={[s.iconBadge, isDark && { backgroundColor: 'rgba(245,200,66,0.12)' }]}>
              <SymbolView name={{ ios: "fork.knife", android: "restaurant", web: "restaurant" }} tintColor={isDark ? GOLD : "#1FA79E"} size={16} />
            </View>
            <View>
              <Text style={[s.widgetTitle, isDark && { color: CREAM }]}>Nutrition</Text>
              <Text style={[s.widgetSub, isDark && { color: 'rgba(232,224,208,0.55)' }]}>{goalLabel}</Text>
            </View>
          </View>
          {/* Mode pill */}
          <View style={s.modePill}>
            <Text style={s.modePillText}>{MODE_LABELS[mode]}</Text>
          </View>
        </View>

        {/* ── DAILY ── */}
        {mode === 'daily' && (
          <>
            <View style={s.dailyCalRow}>
              <View style={s.calRow}>
                <Text style={[s.calBig, isDark && { color: CREAM }]}>{calorieProgress.consumed.toLocaleString()}</Text>
                <Text style={[s.calOf, isDark && { color: 'rgba(232,224,208,0.35)' }]}>/{calorieProgress.target.toLocaleString()}</Text>
              </View>
              <Text style={[s.calSub, isDark && { color: GOLD }]}>{calPct}% · {calorieProgress.remaining.toLocaleString()} kcal left</Text>
            </View>

            <View style={[s.calBar, isDark && { backgroundColor: 'rgba(248,213,97,0.15)' }]}>
              <LinearGradient colors={isDark ? [CORAL, GOLD] : ["#2DD4BF", "#38BDF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.calBarFill, { width: `${Math.max(2, calPct)}%` as DimensionValue }]} />
            </View>

            <View style={s.macroRow}>
              {isDark ? (
                <>
                  <MacroBar label="Protein" color={CORAL} trackColor="rgba(224,123,84,0.18)" consumed={macros.protein.consumed} target={macros.protein.target} />
                  <MacroBar label="Carbs" color={GOLD} trackColor="rgba(245,200,66,0.18)" consumed={macros.carbs.consumed} target={macros.carbs.target} />
                  <MacroBar label="Fat" color={SAGE} trackColor="rgba(139,158,110,0.18)" consumed={macros.fat.consumed} target={macros.fat.target} />
                </>
              ) : (
                <>
                  <MacroBar label="Protein" color="#34D399" trackColor="rgba(52,211,153,0.15)" consumed={macros.protein.consumed} target={macros.protein.target} />
                  <MacroBar label="Carbs" color="#F59E0B" trackColor="rgba(245,158,11,0.15)" consumed={macros.carbs.consumed} target={macros.carbs.target} />
                  <MacroBar label="Fat" color={SAGE} trackColor="rgba(139,158,110,0.15)" consumed={macros.fat.consumed} target={macros.fat.target} />
                </>
              )}
            </View>
          </>
        )}

        {/* ── WEEKLY — Scorecard ── */}
        {mode === 'weekly' && (() => {
          const target = calorieProgress.target;
          const calPctWeek = target > 0 && weekDaysLogged > 0 ? Math.round((weekAvgCal / target) * 100) : 0;
          const proPct = macros.protein.target > 0 ? Math.round((macros.protein.consumed / macros.protein.target) * 100) : 0;
          const carbPct = macros.carbs.target > 0 ? Math.round((macros.carbs.consumed / macros.carbs.target) * 100) : 0;
          const fatPct = macros.fat.target > 0 ? Math.round((macros.fat.consumed / macros.fat.target) * 100) : 0;

          // Grade calculation: avg of all %s capped at 100, weighted by logged days
          const rawScore = weekDaysLogged > 0
            ? (Math.min(calPctWeek, 110) + Math.min(proPct, 110) + Math.min(carbPct, 110) + Math.min(fatPct, 110)) / 4 * (weekDaysLogged / 7)
            : 0;
          const grade = rawScore >= 90 ? 'A' : rawScore >= 80 ? 'A-' : rawScore >= 70 ? 'B+' : rawScore >= 60 ? 'B' : rawScore >= 50 ? 'B-' : rawScore >= 40 ? 'C+' : rawScore >= 25 ? 'C' : 'D';
          const gradeColor = rawScore >= 70 ? SAGE : rawScore >= 50 ? GOLD : CORAL;

          function statusLabel(pct: number): { text: string; color: string; icon: string } {
            if (pct >= 85) return { text: 'on track', color: SAGE, icon: '✓' };
            if (pct >= 60) return { text: 'close', color: GOLD, icon: '✓' };
            if (pct > 0) return { text: 'low', color: CORAL, icon: '✗' };
            return { text: '--', color: 'rgba(232,224,208,0.3)', icon: '–' };
          }

          const rows = [
            { label: 'Calories', pct: calPctWeek, color: CREAM },
            { label: 'Protein', pct: proPct, color: CORAL },
            { label: 'Carbs', pct: carbPct, color: GOLD },
            { label: 'Fat', pct: fatPct, color: SAGE },
          ];

          // Insight line
          const bestMacro = rows.slice(1).sort((a, b) => b.pct - a.pct)[0];
          const worstMacro = rows.slice(1).sort((a, b) => a.pct - b.pct)[0];
          const insight = weekDaysLogged === 0 ? 'Log meals to see your weekly score'
            : worstMacro.pct < 60 && bestMacro.pct >= 80 ? `✦ Strong ${bestMacro.label.toLowerCase()} — bring ${worstMacro.label.toLowerCase()} up`
            : rawScore >= 70 ? `✦ Great balance this week`
            : `Keep logging — ${7 - weekDaysLogged} days left`;

          return (
            <View style={s.wkWrap}>
              {/* Grade + score header */}
              <View style={s.wkGradeRow}>
                <View style={[s.wkGradeBadge, { borderColor: gradeColor + '40', backgroundColor: gradeColor + '12' }]}>
                  <Text style={[s.wkGradeText, { color: gradeColor }]}>{grade}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={s.wkGradeTitle}>Week score</Text>
                  <Text style={s.wkGradeSub}>{weekDaysLogged}/7 days logged</Text>
                </View>
              </View>

              {/* Macro rows */}
              <View style={s.wkRows}>
                {rows.map(row => {
                  const st = statusLabel(row.pct);
                  return (
                    <View key={row.label} style={s.wkRow}>
                      <Text style={[s.wkRowIcon, { color: st.color }]}>{st.icon}</Text>
                      <Text style={s.wkRowLabel}>{row.label}</Text>
                      <Text style={[s.wkRowStatus, { color: st.color }]}>{st.text}</Text>
                      <Text style={[s.wkRowPct, { color: row.color }]}>{row.pct > 0 ? `${row.pct}%` : '--'}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Insight */}
              <Text style={s.wkInsight}>{insight}</Text>
            </View>
          );
        })()}
        )}

        {/* ── MONTHLY — Trend Snapshot ── */}
        {mode === 'monthly' && (() => {
          const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
          const weekStats = moWeeks.map(w => {
            const logged = w.filter(v => v > 0);
            return { daysLogged: logged.length, avg: logged.length > 0 ? Math.round(logged.reduce((a, b) => a + b, 0) / logged.length) : 0 };
          });
          const prevAvgs = weekStats.map(w => w.avg);
          const bestWeekIdx = prevAvgs.indexOf(Math.max(...prevAvgs.filter(v => v > 0)));
          const trendArrows = weekStats.map((w, i) => i === 0 ? '–' : w.avg > weekStats[i-1].avg ? '↑' : w.avg < weekStats[i-1].avg ? '↓' : '–');

          const proPct = macros.protein.target > 0 ? Math.round((macros.protein.consumed / macros.protein.target) * 100) : 0;
          const carbPct = macros.carbs.target > 0 ? Math.round((macros.carbs.consumed / macros.carbs.target) * 100) : 0;
          const fatPct = macros.fat.target > 0 ? Math.round((macros.fat.consumed / macros.fat.target) * 100) : 0;

          const insight = moTotalLogged === 0 ? 'Start logging to see your monthly trend'
            : bestWeekIdx === 3 ? '✦ This is your best week so far — keep it up'
            : `✦ ${weekLabels[bestWeekIdx]} was your best — most consistent logging`;

          return (
            <View style={s.moWrap}>
              {/* Week rows with heatmap */}
              <View style={s.moWeeks}>
                {moWeeks.map((w, wi) => {
                  const st = weekStats[wi];
                  return (
                    <View key={wi} style={[s.moWeekRow, wi === 3 && s.moWeekRowCurrent]}>
                      <Text style={s.moWeekLabel}>{weekLabels[wi]}</Text>
                      <View style={s.moHeatDots}>
                        {w.map((v, di) => (
                          <View key={di} style={[s.moHeatDot,
                            { backgroundColor: v >= target * 0.85 ? SAGE : v > 0 ? GOLD : 'rgba(232,224,208,0.08)' }
                          ]} />
                        ))}
                      </View>
                      <Text style={s.moWeekAvg}>{st.avg > 0 ? st.avg : '--'}</Text>
                      <Text style={[s.moTrend, {
                        color: trendArrows[wi] === '↑' ? SAGE : trendArrows[wi] === '↓' ? CORAL : 'rgba(232,224,208,0.2)'
                      }]}>{trendArrows[wi]}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Month summary */}
              <View style={s.moSummary}>
                <View style={s.moSumItem}>
                  <Text style={s.moSumVal}>{moAvg > 0 ? moAvg.toLocaleString() : '--'}</Text>
                  <Text style={s.moSumLabel}>avg/day</Text>
                </View>
                <View style={s.moSumItem}>
                  <Text style={s.moSumVal}>{moTotalLogged}/28</Text>
                  <Text style={s.moSumLabel}>logged</Text>
                </View>
                <View style={[s.moSumItem]}>
                  <Text style={[s.moSumVal, { color: moGoalPct >= 60 ? SAGE : moGoalPct >= 30 ? GOLD : CORAL }]}>{moGoalPct}%</Text>
                  <Text style={s.moSumLabel}>goal hit</Text>
                </View>
              </View>

              {/* Macro averages */}
              <View style={s.moMacros}>
                {[
                  { label: 'Pro', color: CORAL, val: proPct > 0 ? `${Math.round(macros.protein.consumed)}g` : '--' },
                  { label: 'Carb', color: GOLD, val: carbPct > 0 ? `${Math.round(macros.carbs.consumed)}g` : '--' },
                  { label: 'Fat', color: SAGE, val: fatPct > 0 ? `${Math.round(macros.fat.consumed)}g` : '--' },
                ].map(m => (
                  <View key={m.label} style={s.moMacroItem}>
                    <View style={[s.moMacroDot, { backgroundColor: m.color }]} />
                    <Text style={[s.moMacroVal, { color: m.val === '--' ? 'rgba(232,224,208,0.3)' : m.color }]}>{m.val}</Text>
                    <Text style={s.moMacroLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>

              {/* Insight */}
              <Text style={s.moInsight}>{insight}</Text>
            </View>
          );
        })()}
      </BlurView>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  outerCard: { marginHorizontal: 16, flex: 1, borderRadius: 28, borderWidth: 1, overflow: "hidden" },
  outerCardLight: { backgroundColor: "rgba(255,255,255,0.22)", borderColor: "rgba(255,255,255,0.62)", shadowColor: "#7BAAC8", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 28, elevation: 8 },
  outerCardDark: { backgroundColor: "#1C1410", borderColor: "rgba(255,220,150,0.12)", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  specular: { position: "absolute", top: 0, left: 0, right: 0, height: 72, borderTopLeftRadius: 27, borderTopRightRadius: 27 },
  leftShimmer: { position: "absolute", top: 0, left: 0, bottom: 0, width: 56, borderTopLeftRadius: 27, borderBottomLeftRadius: 27 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 2 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(43,182,166,0.18)" },
  widgetTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3, color: "#1A1A1A" },
  widgetSub: { fontSize: 12, fontWeight: "500", marginTop: 1, color: "#6B7280" },

  modePill: { backgroundColor: 'rgba(245,200,66,0.12)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(245,200,66,0.25)' },
  modePillText: { fontSize: 11, fontWeight: '700', color: GOLD },

  // Daily
  dailyCalRow: { paddingHorizontal: 20, paddingTop: 6, gap: 2 },
  calRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  calBig: { fontSize: 36, fontWeight: "900", letterSpacing: -0.5, color: "#0F172A" },
  calOf: { fontSize: 14, fontWeight: "500", color: "#94A3B8" },
  calSub: { fontSize: 12, fontWeight: "600", color: "#2DD4BF" },
  calBar: { height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "rgba(45,212,191,0.15)", marginHorizontal: 20, marginTop: 8, marginBottom: 4 },
  calBarFill: { height: 6, borderRadius: 3 },
  macroRow: { flex: 1, flexDirection: "row", justifyContent: "space-around", alignItems: "stretch", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },

  // Weekly — Scorecard
  wkWrap: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, flex: 1, justifyContent: 'space-between' },
  wkGradeRow: { flexDirection: 'row', alignItems: 'center' },
  wkGradeBadge: { width: 52, height: 52, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  wkGradeText: { fontSize: 24, fontWeight: '900' },
  wkGradeTitle: { fontSize: 16, fontWeight: '700', color: CREAM },
  wkGradeSub: { fontSize: 12, color: 'rgba(232,224,208,0.45)', marginTop: 2 },
  wkRows: { marginTop: 14, gap: 6 },
  wkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wkRowIcon: { fontSize: 13, fontWeight: '700', width: 16, textAlign: 'center' },
  wkRowLabel: { fontSize: 13, fontWeight: '600', color: CREAM, width: 70 },
  wkRowStatus: { flex: 1, fontSize: 12, fontWeight: '600' },
  wkRowPct: { fontSize: 14, fontWeight: '700', textAlign: 'right', minWidth: 40 },
  wkInsight: { fontSize: 12, fontStyle: 'italic', color: GOLD, marginTop: 12 },

  // Monthly — Trend Snapshot
  moWrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, flex: 1, justifyContent: 'space-between' },
  moWeeks: { gap: 6 },
  moWeekRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moWeekRowCurrent: { backgroundColor: 'rgba(245,200,66,0.06)', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 6, marginHorizontal: -6 },
  moWeekLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(232,224,208,0.45)', width: 48 },
  moHeatDots: { flexDirection: 'row', gap: 4, flex: 1 },
  moHeatDot: { width: 10, height: 10, borderRadius: 3 },
  moWeekAvg: { fontSize: 13, fontWeight: '700', color: CREAM, width: 38, textAlign: 'right' },
  moTrend: { fontSize: 14, fontWeight: '700', width: 16, textAlign: 'center' },
  moSummary: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, backgroundColor: 'rgba(232,224,208,0.04)', borderRadius: 12, paddingVertical: 10 },
  moSumItem: { alignItems: 'center' },
  moSumVal: { fontSize: 16, fontWeight: '800', color: CREAM },
  moSumLabel: { fontSize: 10, color: 'rgba(232,224,208,0.4)', marginTop: 2 },
  moMacros: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  moMacroItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  moMacroDot: { width: 8, height: 8, borderRadius: 4 },
  moMacroVal: { fontSize: 13, fontWeight: '600' },
  moMacroLabel: { fontSize: 11, color: 'rgba(232,224,208,0.4)' },
  moInsight: { fontSize: 12, fontStyle: 'italic', color: GOLD, marginTop: 10 },
});
