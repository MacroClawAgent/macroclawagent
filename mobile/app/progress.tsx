import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';

// ── Theme ────────────────────────────────────────────────────────────────────
const BG = '#1C1612';
const CARD = '#252018';
const TEXT_C = '#E8E0D0';
const GOLD = '#F5C842';
const CORAL = '#E07B54';
const SAGE = '#8B9E6E';
const MUTED = 'rgba(232,224,208,0.5)';
const DIM = 'rgba(232,224,208,0.25)';
const SCREEN_W = Dimensions.get('window').width;

// ── Types ────────────────────────────────────────────────────────────────────
interface DayEntry { date: string; day: string; kcal: number; protein: number; carbs: number; fat: number; target: number; }
interface Summary { daysLogged: number; daysInRange: number; avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number; goalHitDays: number; proteinHitDays: number; streak: number; }
interface Goals { calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number; }
interface HistoryData { days: DayEntry[]; goals: Goals; summary: Summary; }
interface WeekGroup { label: string; days: DayEntry[]; avgKcal: number; avgPro: number; logged: number; goalHit: number; }
interface MonthGroup { label: string; days: DayEntry[]; avgKcal: number; avgPro: number; avgCarbs: number; avgFat: number; logged: number; goalHit: number; }

const RANGES: { label: string; value: number }[] = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '3 months', value: 90 },
];

// ── Shared Components ────────────────────────────────────────────────────────

// Line chart
const CHART_H = 130;
const CHART_PAD_L = 36;
const CHART_PAD_R = 8;
const CHART_PAD_T = 10;
const CHART_PAD_B = 20;

function LineChart({ data, color, label, goalLine }: { data: number[]; color: string; label: string; goalLine?: number }) {
  const chartW = SCREEN_W - 64;
  if (data.length === 0) return null;
  const logged = data.filter(v => v > 0);
  if (logged.length === 0) return <View style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 13, color: DIM }}>No data yet</Text></View>;

  const maxVal = Math.max(...logged, goalLine ?? 0) * 1.15;
  const usableW = chartW - CHART_PAD_L - CHART_PAD_R;
  const usableH = CHART_H - CHART_PAD_T - CHART_PAD_B;

  const points: { x: number; y: number }[] = [];
  data.forEach((val, i) => {
    if (val > 0) {
      const x = CHART_PAD_L + (i / Math.max(data.length - 1, 1)) * usableW;
      const y = CHART_PAD_T + usableH - (val / maxVal) * usableH;
      points.push({ x, y });
    }
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, '');
  const fillD = points.length > 1 ? `${pathD} L${points[points.length - 1].x},${CHART_H - CHART_PAD_B} L${points[0].x},${CHART_H - CHART_PAD_B} Z` : '';

  const yLabels = [0, Math.round(maxVal / 2), Math.round(maxVal)];
  const goalY = goalLine ? CHART_PAD_T + usableH - (goalLine / maxVal) * usableH : null;

  return (
    <View style={{ marginTop: 4 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: MUTED, marginBottom: 4, marginLeft: 4 }}>{label}</Text>
      <Svg width={chartW} height={CHART_H}>
        <Defs>
          <LinearGradient id={`g_${label}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.2" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {yLabels.map((v, i) => {
          const y = CHART_PAD_T + usableH - (i / 2) * usableH;
          return (<React.Fragment key={i}>
            <SvgText x={CHART_PAD_L - 6} y={y + 3} fontSize={8} fill={DIM} textAnchor="end">{v}</SvgText>
            <Line x1={CHART_PAD_L} y1={y} x2={chartW - CHART_PAD_R} y2={y} stroke={DIM} strokeWidth={0.5} strokeDasharray="4,4" />
          </React.Fragment>);
        })}
        {goalY != null && <Line x1={CHART_PAD_L} y1={goalY} x2={chartW - CHART_PAD_R} y2={goalY} stroke={GOLD} strokeWidth={1} strokeDasharray="6,4" opacity={0.4} />}
        {fillD ? <Path d={fillD} fill={`url(#g_${label})`} /> : null}
        <Path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} stroke={BG} strokeWidth={1} />)}
      </Svg>
    </View>
  );
}

// Macro ring
const RING_SZ = 54;
function MacroRing({ value, target, color, label, unit }: { value: number; target: number; color: string; label: string; unit: string }) {
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  const r = 21; const sw = 4.5;
  const circ = 2 * Math.PI * r;
  return (
    <View style={{ alignItems: 'center', flex: 1, gap: 3 }}>
      <View style={{ width: RING_SZ, height: RING_SZ, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={RING_SZ} height={RING_SZ}>
          <Circle cx={RING_SZ / 2} cy={RING_SZ / 2} r={r} fill="none" stroke="rgba(232,224,208,0.06)" strokeWidth={sw} />
          <Circle cx={RING_SZ / 2} cy={RING_SZ / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={`${circ}`} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" rotation={-90} origin={`${RING_SZ / 2},${RING_SZ / 2}`} />
        </Svg>
        <Text style={{ position: 'absolute', fontSize: 11, fontWeight: '700', color: TEXT_C }}>{Math.round(pct * 100)}%</Text>
      </View>
      <Text style={{ fontSize: 13, fontWeight: '700', color: TEXT_C, textAlign: 'center' }}>{value}{unit}</Text>
      <Text style={{ fontSize: 9, color: DIM, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

// Stat card
function StatBadge({ icon, color, value, sub, label }: { icon: string; color: string; value: string; sub?: string; label: string }) {
  return (
    <View style={st.card}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={st.val}>{value}{sub ? <Text style={st.sub}>{sub}</Text> : null}</Text>
      <Text style={st.label}>{label}</Text>
    </View>
  );
}
const st = StyleSheet.create({
  card: { flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  val: { fontSize: 20, fontWeight: '800', color: TEXT_C },
  sub: { fontSize: 12, fontWeight: '500', color: DIM },
  label: { fontSize: 9, color: DIM, textAlign: 'center' },
});

// Heatmap row (7 dots)
function HeatDots({ days, goal }: { days: DayEntry[]; goal: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {days.slice(0, 7).map((d, i) => {
        const hit = d.kcal >= goal * 0.75;
        const logged = d.kcal > 0;
        return <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: hit ? SAGE : logged ? GOLD : 'rgba(232,224,208,0.08)' }} />;
      })}
    </View>
  );
}

// ── Helper: group days into weeks ────────────────────────────────────────────
function groupByWeek(days: DayEntry[], goal: number): WeekGroup[] {
  const weeks: WeekGroup[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    const logged = chunk.filter(d => d.kcal > 0);
    const monday = new Date(chunk[0].date);
    weeks.push({
      label: `${monday.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][monday.getMonth()]}`,
      days: chunk,
      avgKcal: logged.length > 0 ? Math.round(logged.reduce((s, d) => s + d.kcal, 0) / logged.length) : 0,
      avgPro: logged.length > 0 ? Math.round(logged.reduce((s, d) => s + d.protein, 0) / logged.length) : 0,
      logged: logged.length,
      goalHit: logged.filter(d => d.kcal >= goal * 0.75).length,
    });
  }
  return weeks;
}

// ── Helper: group days into months ───────────────────────────────────────────
function groupByMonth(days: DayEntry[], goal: number): MonthGroup[] {
  const map = new Map<string, DayEntry[]>();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  for (const d of days) {
    const dt = new Date(d.date);
    const key = `${dt.getFullYear()}-${dt.getMonth()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(d);
  }
  return [...map.entries()].map(([key, chunk]) => {
    const logged = chunk.filter(d => d.kcal > 0);
    const [y, m] = key.split('-').map(Number);
    return {
      label: MONTHS[m],
      days: chunk,
      avgKcal: logged.length > 0 ? Math.round(logged.reduce((s, d) => s + d.kcal, 0) / logged.length) : 0,
      avgPro: logged.length > 0 ? Math.round(logged.reduce((s, d) => s + d.protein, 0) / logged.length) : 0,
      avgCarbs: logged.length > 0 ? Math.round(logged.reduce((s, d) => s + d.carbs, 0) / logged.length) : 0,
      avgFat: logged.length > 0 ? Math.round(logged.reduce((s, d) => s + d.fat, 0) / logged.length) : 0,
      logged: logged.length,
      goalHit: logged.filter(d => d.kcal >= goal * 0.75).length,
    };
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// ── 7 DAY VIEW ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function WeekView({ days, goals, summary }: { days: DayEntry[]; goals: Goals; summary: Summary }) {
  const today = days.length > 0 ? days[days.length - 1] : null;
  const adherence = summary.daysLogged > 0 ? Math.round((summary.goalHitDays / summary.daysLogged) * 100) : 0;

  return (
    <>
      {/* Today snapshot */}
      <View style={s.sectionCard}>
        <Text style={s.cardLabel}>TODAY</Text>
        <View style={{ flexDirection: 'row' }}>
          {[
            { l: 'Calories', v: `${today?.kcal ?? 0}`, su: `/${goals.calorie_goal}`, c: TEXT_C },
            { l: 'Protein', v: `${today?.protein ?? 0}g`, su: `/${goals.protein_goal}g`, c: CORAL },
            { l: 'Carbs', v: `${today?.carbs ?? 0}g`, su: `/${goals.carbs_goal}g`, c: GOLD },
            { l: 'Fat', v: `${today?.fat ?? 0}g`, su: `/${goals.fat_goal}g`, c: SAGE },
          ].map((it, i) => (
            <React.Fragment key={it.l}>
              {i > 0 && <View style={{ width: 1, backgroundColor: 'rgba(232,224,208,0.06)' }} />}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: it.c }}>{it.v}</Text>
                <Text style={{ fontSize: 9, color: DIM }}>{it.su}</Text>
                <Text style={{ fontSize: 9, color: MUTED, marginTop: 3 }}>{it.l}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 10 }}>
        <StatBadge icon="flame-outline" color={GOLD} value={`${summary.streak}`} label="Day streak" />
        <StatBadge icon="calendar-outline" color={SAGE} value={`${summary.daysLogged}`} sub={`/${summary.daysInRange}`} label="Days logged" />
        <StatBadge icon="checkmark-circle-outline" color={adherence >= 70 ? SAGE : CORAL} value={`${adherence}%`} label="Goal hit" />
      </View>

      {/* Daily bar chart */}
      <View style={s.sectionCard}>
        <Text style={s.cardLabel}>DAILY CALORIES</Text>
        <View style={{ flexDirection: 'row', gap: 4, height: 110, alignItems: 'flex-end', marginTop: 8 }}>
          {days.slice(-7).map((d, i) => {
            const max = Math.max(...days.slice(-7).map(x => x.kcal), goals.calorie_goal) * 1.1;
            const pct = max > 0 ? (d.kcal / max) * 100 : 0;
            const hit = d.kcal >= goals.calorie_goal * 0.75;
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
                  <View style={{ width: '100%', height: `${Math.max(3, pct)}%`, borderRadius: 4, backgroundColor: d.kcal === 0 ? 'rgba(232,224,208,0.06)' : hit ? SAGE : GOLD }} />
                </View>
                <Text style={{ fontSize: 9, color: DIM, marginTop: 4 }}>{d.day.slice(0, 1)}</Text>
                {d.kcal > 0 && <Text style={{ fontSize: 7, color: MUTED }}>{d.kcal}</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {/* Macro rings */}
      <View style={s.sectionCard}>
        <Text style={s.cardLabel}>DAILY AVERAGES</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <MacroRing value={summary.avgCalories} target={goals.calorie_goal} color={TEXT_C} label="Calories" unit="" />
          <MacroRing value={summary.avgProtein} target={goals.protein_goal} color={CORAL} label="Protein" unit="g" />
          <MacroRing value={summary.avgCarbs} target={goals.carbs_goal} color={GOLD} label="Carbs" unit="g" />
          <MacroRing value={summary.avgFat} target={goals.fat_goal} color={SAGE} label="Fat" unit="g" />
        </View>
      </View>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── 30 DAY VIEW ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function MonthView({ days, goals, summary }: { days: DayEntry[]; goals: Goals; summary: Summary }) {
  const weeks = useMemo(() => groupByWeek(days, goals.calorie_goal), [days, goals.calorie_goal]);
  const adherence = summary.daysLogged > 0 ? Math.round((summary.goalHitDays / summary.daysLogged) * 100) : 0;

  // Week-over-week delta
  const thisWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null;
  const lastWeek = weeks.length > 1 ? weeks[weeks.length - 2] : null;
  const calDelta = thisWeek && lastWeek && lastWeek.avgKcal > 0
    ? Math.round(((thisWeek.avgKcal - lastWeek.avgKcal) / lastWeek.avgKcal) * 100) : null;

  return (
    <>
      {/* Month overview */}
      <View style={s.sectionCard}>
        <Text style={s.cardLabel}>MONTH OVERVIEW</Text>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: TEXT_C }}>{summary.avgCalories}</Text>
            <Text style={{ fontSize: 10, color: DIM }}>avg kcal/day</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(232,224,208,0.06)' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: SAGE }}>{summary.daysLogged}<Text style={{ fontSize: 14, color: DIM }}>/{summary.daysInRange}</Text></Text>
            <Text style={{ fontSize: 10, color: DIM }}>days logged</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(232,224,208,0.06)' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: adherence >= 70 ? SAGE : CORAL }}>{adherence}%</Text>
            <Text style={{ fontSize: 10, color: DIM }}>goal hit</Text>
          </View>
        </View>
      </View>

      {/* Week-over-week */}
      {calDelta !== null && (
        <View style={[s.sectionCard, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
          <Ionicons name={calDelta >= 0 ? 'trending-up-outline' : 'trending-down-outline'} size={22} color={calDelta >= 0 ? SAGE : CORAL} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: TEXT_C }}>
              {Math.abs(calDelta)}% {calDelta >= 0 ? 'more' : 'fewer'} calories this week
            </Text>
            <Text style={{ fontSize: 12, color: MUTED }}>
              {thisWeek?.avgKcal} avg vs {lastWeek?.avgKcal} last week
            </Text>
          </View>
        </View>
      )}

      {/* Week cards */}
      <Text style={s.sectionTitle}>WEEKLY BREAKDOWN</Text>
      {weeks.map((wk, i) => (
        <View key={i} style={s.sectionCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: TEXT_C }}>Week of {wk.label}</Text>
            <Text style={{ fontSize: 12, color: MUTED }}>{wk.logged} days</Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 12, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: DIM }}>Avg calories</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: TEXT_C }}>{wk.avgKcal}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: DIM }}>Avg protein</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: CORAL }}>{wk.avgPro}g</Text>
            </View>
            <View>
              <Text style={{ fontSize: 11, color: DIM, marginBottom: 4 }}>Goal hit</Text>
              <HeatDots days={wk.days} goal={goals.calorie_goal} />
            </View>
          </View>
        </View>
      ))}

      {/* Calorie + Protein trend */}
      <View style={s.sectionCard}>
        <Text style={s.cardLabel}>CALORIE TREND</Text>
        <LineChart data={days.map(d => d.kcal)} color={TEXT_C} label="kcal" goalLine={goals.calorie_goal} />
      </View>
      <View style={s.sectionCard}>
        <Text style={s.cardLabel}>PROTEIN TREND</Text>
        <LineChart data={days.map(d => d.protein)} color={CORAL} label="grams" goalLine={goals.protein_goal} />
      </View>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── 90 DAY VIEW ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function QuarterView({ days, goals, summary }: { days: DayEntry[]; goals: Goals; summary: Summary }) {
  const months = useMemo(() => groupByMonth(days, goals.calorie_goal), [days, goals.calorie_goal]);
  const adherence = summary.daysLogged > 0 ? Math.round((summary.goalHitDays / summary.daysLogged) * 100) : 0;

  // Best & worst month
  const best = months.reduce((a, b) => a.avgKcal > 0 && (a.goalHit / Math.max(a.logged, 1)) >= (b.goalHit / Math.max(b.logged, 1)) ? a : b, months[0]);
  const worst = months.reduce((a, b) => a.logged > 0 && (a.goalHit / Math.max(a.logged, 1)) <= (b.goalHit / Math.max(b.logged, 1)) ? a : b, months[0]);

  return (
    <>
      {/* Quarter overview */}
      <View style={s.sectionCard}>
        <Text style={s.cardLabel}>QUARTER OVERVIEW</Text>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: TEXT_C }}>{summary.avgCalories}</Text>
            <Text style={{ fontSize: 10, color: DIM }}>avg kcal/day</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(232,224,208,0.06)' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: TEXT_C }}>{summary.daysLogged}</Text>
            <Text style={{ fontSize: 10, color: DIM }}>days logged</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(232,224,208,0.06)' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: adherence >= 70 ? SAGE : CORAL }}>{adherence}%</Text>
            <Text style={{ fontSize: 10, color: DIM }}>goal hit</Text>
          </View>
        </View>
      </View>

      {/* Monthly cards */}
      <Text style={s.sectionTitle}>MONTHLY BREAKDOWN</Text>
      {months.map((mo, i) => {
        const prev = i > 0 ? months[i - 1] : null;
        const delta = prev && prev.avgKcal > 0 ? Math.round(((mo.avgKcal - prev.avgKcal) / prev.avgKcal) * 100) : null;
        const goalPct = mo.logged > 0 ? Math.round((mo.goalHit / mo.logged) * 100) : 0;
        return (
          <View key={i} style={s.sectionCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: TEXT_C }}>{mo.label}</Text>
              {delta !== null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name={delta >= 0 ? 'arrow-up' : 'arrow-down'} size={12} color={delta >= 0 ? SAGE : CORAL} />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: delta >= 0 ? SAGE : CORAL }}>{Math.abs(delta)}%</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 4 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(232,224,208,0.04)', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: TEXT_C }}>{mo.avgKcal}</Text>
                <Text style={{ fontSize: 9, color: DIM }}>avg kcal</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(232,224,208,0.04)', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: CORAL }}>{mo.avgPro}g</Text>
                <Text style={{ fontSize: 9, color: DIM }}>avg protein</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(232,224,208,0.04)', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: goalPct >= 70 ? SAGE : GOLD }}>{goalPct}%</Text>
                <Text style={{ fontSize: 9, color: DIM }}>goal hit</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(232,224,208,0.04)', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: SAGE }}>{mo.logged}</Text>
                <Text style={{ fontSize: 9, color: DIM }}>days</Text>
              </View>
            </View>
            {/* Mini macro bar */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <Text style={{ fontSize: 11, color: CORAL, fontWeight: '600' }}>P {mo.avgPro}g</Text>
              <Text style={{ fontSize: 11, color: GOLD, fontWeight: '600' }}>C {mo.avgCarbs}g</Text>
              <Text style={{ fontSize: 11, color: SAGE, fontWeight: '600' }}>F {mo.avgFat}g</Text>
            </View>
          </View>
        );
      })}

      {/* Best/worst month highlight */}
      {months.length > 1 && (
        <View style={[s.sectionCard, { flexDirection: 'row', gap: 10 }]}>
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Ionicons name="trophy-outline" size={20} color={GOLD} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: TEXT_C }}>{best?.label}</Text>
            <Text style={{ fontSize: 10, color: SAGE }}>Best month</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(232,224,208,0.06)' }} />
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Ionicons name="alert-circle-outline" size={20} color={CORAL} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: TEXT_C }}>{worst?.label}</Text>
            <Text style={{ fontSize: 10, color: CORAL }}>Needs work</Text>
          </View>
        </View>
      )}

      {/* Calorie trend 90 days */}
      <View style={s.sectionCard}>
        <Text style={s.cardLabel}>3-MONTH CALORIE TREND</Text>
        <LineChart data={days.map(d => d.kcal)} color={TEXT_C} label="kcal" goalLine={goals.calorie_goal} />
      </View>
      <View style={s.sectionCard}>
        <Text style={s.cardLabel}>3-MONTH PROTEIN TREND</Text>
        <LineChart data={days.map(d => d.protein)} color={CORAL} label="grams" goalLine={goals.protein_goal} />
      </View>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN SCREEN ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function ProgressScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [range, setRange] = useState(7);
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async (d: number) => {
    setLoading(true);
    try { setData(await apiGet<HistoryData>(`/api/nutrition/history?days=${d}`)); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(range); }, [range, fetchHistory]);

  const goals = data?.goals ?? { calorie_goal: userProfile?.calorie_goal ?? 2000, protein_goal: userProfile?.protein_goal ?? 120, carbs_goal: userProfile?.carbs_goal ?? 250, fat_goal: userProfile?.fat_goal ?? 70 };
  const summary = data?.summary ?? { daysLogged: 0, daysInRange: range, avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, goalHitDays: 0, proteinHitDays: 0, streak: 0 };
  const days = data?.days ?? [];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={TEXT_C} />
          </TouchableOpacity>
          <Text style={s.title}>My Progress</Text>
        </View>

        <View style={s.rangeRow}>
          {RANGES.map(r => (
            <TouchableOpacity key={r.value} style={[s.rangePill, range === r.value && s.rangePillActive]} onPress={() => setRange(r.value)} activeOpacity={0.75}>
              <Text style={[s.rangeText, range === r.value && s.rangeTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{ paddingVertical: 80, alignItems: 'center' }}><ActivityIndicator color={GOLD} size="large" /></View>
        ) : (
          <>
            {range === 7 && <WeekView days={days} goals={goals} summary={summary} />}
            {range === 30 && <MonthView days={days} goals={goals} summary={summary} />}
            {range === 90 && <QuarterView days={days} goals={goals} summary={summary} />}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: TEXT_C },
  rangeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  rangePill: { backgroundColor: CARD, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(232,224,208,0.1)' },
  rangePillActive: { backgroundColor: GOLD, borderColor: GOLD },
  rangeText: { fontSize: 13, color: MUTED },
  rangeTextActive: { color: BG, fontWeight: '700' },
  sectionCard: { backgroundColor: CARD, borderRadius: 18, padding: 14, marginHorizontal: 16, marginBottom: 10 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: DIM, letterSpacing: 0.8, marginBottom: 4 },
  sectionTitle: { fontSize: 10, fontWeight: '700', color: DIM, letterSpacing: 0.8, marginLeft: 20, marginBottom: 8, marginTop: 4 },
});
