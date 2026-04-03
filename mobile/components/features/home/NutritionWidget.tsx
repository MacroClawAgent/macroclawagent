import React, { useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Line, Polyline, Defs, LinearGradient as SvgGrad, Stop, Path, Text as SvgText } from "react-native-svg";

export interface WeeklyDay { date: string; kcal: number; }

interface MacroStat { consumed: number; target: number; ratio: number; }

interface Props {
  calorieProgress: { consumed: number; target: number; remaining: number; ratio: number };
  macros: { protein: MacroStat; carbs: MacroStat; fat: MacroStat; fiber?: MacroStat };
  goalLabel: string;
  weeklyCalories?: WeeklyDay[];
}

type Mode = 'daily' | 'weekly' | 'monthly';
const MODES: Mode[] = ['daily', 'weekly', 'monthly'];
const MODE_LABEL: Record<Mode, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

const BG    = '#252018';
const CORAL = '#E07B54';
const GOLD  = '#F5C842';
const SAGE  = '#8B9E6E';
const CREAM = '#E8E0D0';
const MUTED = 'rgba(232,224,208,0.4)';
const DIM   = 'rgba(232,224,208,0.08)';

// ── Mock data ────────────────────────────────────────────────────────────────
const WEEKLY_MOCK = [0, 608, 0, 0, 2100, 0, 0];
function genMonthMock(): number[] {
  const days = Array(30).fill(0);
  [2,5,8,12,16,19,23,27].forEach(i => { days[i] = 1800 + Math.round(Math.random() * 1184); });
  return days;
}
const MONTH_MOCK = genMonthMock();

// ── Helpers ──────────────────────────────────────────────────────────────────
function daysInMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}
function todayDow() { return (new Date().getDay() + 6) % 7; } // 0=Mon

// ═══════════════════════════════════════════════════════════════════════════════
export function NutritionWidget({ calorieProgress, macros, goalLabel, weeklyCalories = [] }: Props) {
  const [mode, setMode] = useState<Mode>('daily');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pillScale = useRef(new Animated.Value(1)).current;

  const cycleMode = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setMode(prev => MODES[(MODES.indexOf(prev) + 1) % MODES.length]);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
    Animated.sequence([
      Animated.spring(pillScale, { toValue: 0.92, useNativeDriver: true, speed: 50 }),
      Animated.spring(pillScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  const calPct = Math.round(calorieProgress.ratio * 100);
  const target = calorieProgress.target;

  // Weekly data
  const wk = weeklyCalories.length === 7 ? weeklyCalories.map(d => d.kcal) : WEEKLY_MOCK;
  const wkLogged = wk.filter(v => v > 0);
  const wkDaysLogged = wkLogged.length;
  const wkAvg = wkDaysLogged > 0 ? Math.round(wkLogged.reduce((a, b) => a + b, 0) / wkDaysLogged) : 0;
  const wkBest = Math.max(...wk);

  // Monthly data
  const mo = MONTH_MOCK;
  const moLogged = mo.filter(v => v > 0);
  const moDaysLogged = moLogged.length;
  const moAvg = moDaysLogged >= 5 ? Math.round(moLogged.reduce((a, b) => a + b, 0) / moDaysLogged) : 0;
  const moStreak = (() => { let max = 0, cur = 0; mo.forEach(v => { if (v > 0) { cur++; max = Math.max(max, cur); } else cur = 0; }); return max; })();
  const moGoalHit = moDaysLogged > 0 ? Math.round(moLogged.filter(v => v >= target * 0.85).length / moDaysLogged * 100) : 0;

  // Macro averages for monthly (from logged days only)
  const moProAvg = moDaysLogged >= 3 ? `${Math.round(macros.protein.consumed)}g avg` : '--';
  const moCarbAvg = moDaysLogged >= 3 ? `${Math.round(macros.carbs.consumed)}g avg` : '--';
  const moFatAvg = moDaysLogged >= 3 ? `${Math.round(macros.fat.consumed)}g avg` : '--';

  const daysLoggedColor = (n: number, of: number) => {
    const r = n / of;
    if (r >= 5/7) return SAGE;
    if (r >= 3/7) return GOLD;
    return CORAL;
  };

  const today = todayDow();

  return (
    <TouchableOpacity activeOpacity={1} onPress={cycleMode} style={{ flex: 1 }}>
      <View style={s.card}>
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.iconBadge}>
              <Ionicons name="restaurant-outline" size={18} color={GOLD} />
            </View>
            <View>
              <Text style={s.title}>Nutrition</Text>
              <Text style={s.sub}>{goalLabel}</Text>
            </View>
          </View>
          <Animated.View style={[s.pill, { transform: [{ scale: pillScale }] }]}>
            <Text style={s.pillText}>{MODE_LABEL[mode]}</Text>
          </Animated.View>
        </View>

        {/* ── Content ── */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

          {/* ════ DAILY ════ */}
          {mode === 'daily' && (
            <View style={s.dailyWrap}>
              <View style={s.dailyCalSection}>
                <View style={{ flex: 1 }}>
                  <View style={s.dailyCalRow}>
                    <Text style={s.dailyCalBig}>{calorieProgress.consumed.toLocaleString()}</Text>
                    <Text style={s.dailyCalOf}>/ {target.toLocaleString()} kcal</Text>
                  </View>
                  <View style={[s.bar, { marginTop: 12 }]}>
                    <LinearGradient colors={[CORAL, GOLD]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[s.barFill, { width: `${Math.max(2, calPct)}%` as DimensionValue }]} />
                  </View>
                </View>
                <View style={s.pctBadge}>
                  <Text style={s.pctValue}>{calPct}%</Text>
                  <Text style={s.pctLabel}>of goal</Text>
                </View>
              </View>

              <View style={s.macroRow}>
                {[
                  { label: 'Protein', color: CORAL, consumed: macros.protein.consumed, target: macros.protein.target },
                  { label: 'Carbs', color: GOLD, consumed: macros.carbs.consumed, target: macros.carbs.target },
                  { label: 'Fat', color: SAGE, consumed: macros.fat.consumed, target: macros.fat.target },
                ].map((m, i) => (
                  <React.Fragment key={m.label}>
                    {i > 0 && <View style={s.macroDivider} />}
                    <View style={s.macroBlock}>
                      <Text style={[s.macroValue, { color: m.color }]}>{Math.round(m.consumed)}g</Text>
                      <Text style={s.macroLabel}>{m.label}</Text>
                      <Text style={[s.macroLeft, { color: m.color + '99' }]}>{Math.max(0, Math.round(m.target - m.consumed))}g left</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}

          {/* ════ WEEKLY ════ */}
          {mode === 'weekly' && (
            <View style={s.weekWrap}>
              <View style={s.weekStats}>
                <View>
                  <Text style={s.weekStatBig}>{wkAvg}</Text>
                  <Text style={s.weekStatSub}>avg cal/day</Text>
                </View>
                <View>
                  <Text style={[s.weekStatBig, { color: daysLoggedColor(wkDaysLogged, 7) }]}>{wkDaysLogged}/7</Text>
                  <Text style={s.weekStatSub}>days logged</Text>
                </View>
                <View>
                  <Text style={[s.weekStatBig, { color: GOLD }]}>{wkBest}</Text>
                  <Text style={s.weekStatSub}>best day</Text>
                </View>
              </View>

              {/* 7-bar chart */}
              <View style={s.weekChart}>
                {/* Target dashed line */}
                <View style={s.weekTargetLine}>
                  <Text style={s.weekTargetLabel}>target</Text>
                </View>
                <View style={s.weekBars}>
                  {['M','T','W','T','F','S','S'].map((d, i) => {
                    const v = wk[i];
                    const pct = target > 0 ? Math.min(1, v / target) : 0;
                    const isToday = i === today;
                    const barColor = isToday ? [GOLD, '#D4A820'] : pct >= 0.85 ? [SAGE, '#6B7E4E'] : pct >= 0.4 ? [GOLD, '#D4A820'] : null;
                    return (
                      <View key={i} style={s.weekBarCol}>
                        <View style={s.weekBarTrack}>
                          {barColor ? (
                            <LinearGradient colors={barColor} style={[s.weekBar, { height: `${Math.max(5, pct * 100)}%` as DimensionValue }]}>
                              {isToday && <View style={s.weekBarGlow} />}
                            </LinearGradient>
                          ) : (
                            <View style={[s.weekBar, s.weekBarEmpty, { height: 4 }]} />
                          )}
                        </View>
                        <Text style={[s.weekDayLabel, isToday && s.weekDayToday]}>{d}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Footer message */}
              <Text style={[s.weekFooter, {
                color: wkDaysLogged === 7 ? SAGE : wkDaysLogged >= 5 ? GOLD : wkDaysLogged >= 3 ? MUTED : CORAL
              }]}>
                {wkDaysLogged === 7 ? '🔥 Perfect week — every day logged!'
                  : wkDaysLogged >= 5 ? `✦ Strong week — ${wkDaysLogged} days logged`
                  : wkDaysLogged >= 3 ? `Keep going — log ${7 - wkDaysLogged} more days to complete your week`
                  : 'Log today to start your streak'}
              </Text>
            </View>
          )}

          {/* ════ MONTHLY ════ */}
          {mode === 'monthly' && (
            <View style={s.monthWrap}>
              {/* Hero stat */}
              {moDaysLogged >= 5 ? (
                <View>
                  <Text style={s.monthHero}>{moAvg}</Text>
                  <Text style={s.monthHeroSub}>avg kcal/day this month</Text>
                </View>
              ) : (
                <View>
                  <Text style={[s.monthHero, { color: GOLD, fontSize: 36 }]}>{moDaysLogged} days</Text>
                  <Text style={s.monthHeroSub}>logged this month — log more to see your average</Text>
                </View>
              )}

              {/* Area chart */}
              <View style={{ marginTop: 14, height: 90 }}>
                <Svg width="100%" height={90} viewBox="0 0 300 90" preserveAspectRatio="none">
                  <Defs>
                    <SvgGrad id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={CORAL} stopOpacity={0.3} />
                      <Stop offset="1" stopColor={CORAL} stopOpacity={0} />
                    </SvgGrad>
                  </Defs>
                  <Line x1={0} y1={15} x2={300} y2={15} stroke="rgba(248,213,97,0.25)" strokeWidth={1} strokeDasharray="6,4" />
                  <SvgText x={296} y={12} fill="rgba(248,213,97,0.4)" fontSize={8} textAnchor="end">target</SvgText>
                  {mo.length > 1 && (() => {
                    const pts = mo.map((v, i) => {
                      const x = (i / (mo.length - 1)) * 300;
                      const y = 85 - (target > 0 ? Math.min(1, v / target) : 0) * 70;
                      return { x, y };
                    });
                    const line = pts.map(p => `${p.x},${p.y}`).join(' ');
                    const area = `M0,85 ${pts.map(p => `L${p.x},${p.y}`).join(' ')} L300,85 Z`;
                    return (
                      <>
                        <Path d={area} fill="url(#areaFill)" />
                        <Polyline points={line} fill="none" stroke={CORAL} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    );
                  })()}
                </Svg>
                <View style={s.monthXAxis}>
                  {[1,8,15,22,29].map(d => (
                    <Text key={d} style={s.monthXLabel}>{d}</Text>
                  ))}
                </View>
              </View>

              {/* Macro averages */}
              <View style={s.monthMacros}>
                {[
                  { label: 'Protein', color: CORAL, value: moProAvg },
                  { label: 'Carbs', color: GOLD, value: moCarbAvg },
                  { label: 'Fat', color: SAGE, value: moFatAvg },
                ].map(m => (
                  <View key={m.label} style={s.monthMacroItem}>
                    <View style={[s.monthMacroDot, { backgroundColor: m.color }]} />
                    <Text style={[s.monthMacroVal, { color: m.value === '--' ? MUTED : m.color }]}>{m.value}</Text>
                    <Text style={s.monthMacroLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>

              {/* Summary row */}
              <View style={s.monthSummary}>
                <View style={s.monthSumItem}>
                  <Text style={[s.monthSumVal, { color: daysLoggedColor(moDaysLogged, 20) }]}>{moDaysLogged}/{daysInMonth()}</Text>
                  <Text style={s.monthSumLabel}>days logged</Text>
                </View>
                <View style={s.monthSumItem}>
                  <Text style={[s.monthSumVal, { color: GOLD }]}>{moStreak} days</Text>
                  <Text style={s.monthSumLabel}>best streak</Text>
                </View>
                <View style={s.monthSumItem}>
                  <Text style={[s.monthSumVal, { color: SAGE }]}>{moGoalHit}%</Text>
                  <Text style={s.monthSumLabel}>goal hit rate</Text>
                </View>
              </View>
            </View>
          )}

        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: BG, borderRadius: 24, borderWidth: 1,
    borderColor: 'rgba(248,213,97,0.1)', padding: 20, marginHorizontal: 16,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(248,213,97,0.12)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: CREAM },
  sub: { fontSize: 12, color: 'rgba(232,224,208,0.45)' },
  pill: { backgroundColor: 'rgba(248,213,97,0.12)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(248,213,97,0.25)', paddingHorizontal: 14, paddingVertical: 6 },
  pillText: { fontSize: 13, fontWeight: '700', color: GOLD },

  // Daily
  dailyWrap: { flex: 1, justifyContent: 'space-between' },
  dailyCalSection: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, gap: 12 },
  dailyCalRow: { flexDirection: 'row', alignItems: 'flex-end' },
  dailyCalBig: { fontSize: 48, fontWeight: '800', color: CREAM, letterSpacing: -1 },
  dailyCalOf: { fontSize: 16, fontWeight: '400', color: MUTED, marginBottom: 8, marginLeft: 6 },
  bar: { height: 6, borderRadius: 3, backgroundColor: DIM, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  pctBadge: { backgroundColor: 'rgba(248,213,97,0.08)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(248,213,97,0.15)', alignItems: 'center' },
  pctValue: { fontSize: 18, fontWeight: '800', color: GOLD },
  pctLabel: { fontSize: 10, color: MUTED },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' },
  macroDivider: { width: 1, height: 32, backgroundColor: 'rgba(232,224,208,0.06)' },
  macroBlock: { flex: 1, alignItems: 'center' },
  macroValue: { fontSize: 18, fontWeight: '700' },
  macroLabel: { fontSize: 11, color: MUTED, marginTop: 2 },
  macroLeft: { fontSize: 10, marginTop: 1 },

  // Weekly
  weekWrap: { flex: 1, justifyContent: 'space-between' },
  weekStats: { flexDirection: 'row', gap: 20, marginTop: 16 },
  weekStatBig: { fontSize: 28, fontWeight: '800', color: CREAM },
  weekStatSub: { fontSize: 11, color: MUTED, marginTop: 2 },
  weekChart: { marginTop: 20, height: 80 },
  weekTargetLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, borderTopWidth: 1, borderTopColor: 'rgba(248,213,97,0.25)', borderStyle: 'dashed', flexDirection: 'row', justifyContent: 'flex-end' },
  weekTargetLabel: { fontSize: 9, color: 'rgba(248,213,97,0.4)', marginTop: -12 },
  weekBars: { flexDirection: 'row', flex: 1 },
  weekBarCol: { flex: 1, alignItems: 'center', marginHorizontal: 3 },
  weekBarTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  weekBar: { width: '100%', borderRadius: 6 },
  weekBarEmpty: { backgroundColor: DIM },
  weekBarGlow: { ...StyleSheet.absoluteFillObject, shadowColor: GOLD, shadowOpacity: 0.4, shadowRadius: 6 },
  weekDayLabel: { fontSize: 10, color: 'rgba(232,224,208,0.35)', marginTop: 4, textAlign: 'center' },
  weekDayToday: { color: GOLD, fontWeight: '600' },
  weekFooter: { fontSize: 12, fontStyle: 'italic', marginTop: 12 },

  // Monthly
  monthWrap: { flex: 1, justifyContent: 'space-between' },
  monthHero: { fontSize: 40, fontWeight: '800', color: CREAM, letterSpacing: -1, marginTop: 16 },
  monthHeroSub: { fontSize: 13, color: 'rgba(232,224,208,0.45)', marginTop: 4 },
  monthXAxis: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, marginTop: 2 },
  monthXLabel: { fontSize: 9, color: 'rgba(232,224,208,0.3)' },
  monthMacros: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14 },
  monthMacroItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  monthMacroDot: { width: 8, height: 8, borderRadius: 4 },
  monthMacroVal: { fontSize: 13, fontWeight: '600' },
  monthMacroLabel: { fontSize: 11, color: MUTED },
  monthSummary: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(232,224,208,0.04)', borderRadius: 14, padding: 12, marginTop: 14 },
  monthSumItem: { alignItems: 'center' },
  monthSumVal: { fontSize: 16, fontWeight: '700' },
  monthSumLabel: { fontSize: 10, color: MUTED, marginTop: 2 },
});
