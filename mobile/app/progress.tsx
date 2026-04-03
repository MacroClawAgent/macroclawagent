import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';

// ── Theme ────────────────────────────────────────────────────────────────────
const BG = '#1C1612';
const CARD = '#252018';
const TEXT = '#E8E0D0';
const GOLD = '#F5C842';
const CORAL = '#E07B54';
const SAGE = '#8B9E6E';
const MUTED = 'rgba(232,224,208,0.5)';
const DIM = 'rgba(232,224,208,0.25)';

// ── Types ────────────────────────────────────────────────────────────────────
interface DayEntry {
  date: string; day: string;
  kcal: number; protein: number; carbs: number; fat: number;
  target: number;
}
interface Summary {
  daysLogged: number; daysInRange: number;
  avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number;
  goalHitDays: number; proteinHitDays: number; streak: number;
}
interface Goals { calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number; }
interface HistoryData { days: DayEntry[]; goals: Goals; summary: Summary; }

const RANGES: { label: string; value: number }[] = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '3 months', value: 90 },
];

// ── Line Chart Component ─────────────────────────────────────────────────────
const CHART_W = 320;
const CHART_H = 140;
const CHART_PAD_L = 36;
const CHART_PAD_R = 8;
const CHART_PAD_T = 12;
const CHART_PAD_B = 24;

function LineChart({ data, color, label, goalLine, maxOverride }: {
  data: number[]; color: string; label: string;
  goalLine?: number; maxOverride?: number;
}) {
  if (data.length === 0) return null;
  const logged = data.filter(v => v > 0);
  if (logged.length === 0) return (
    <View style={lc.empty}>
      <Text style={lc.emptyText}>No data yet</Text>
    </View>
  );

  const maxVal = maxOverride ?? Math.max(...data.filter(v => v > 0), goalLine ?? 0) * 1.15;
  const minVal = 0;
  const usableW = CHART_W - CHART_PAD_L - CHART_PAD_R;
  const usableH = CHART_H - CHART_PAD_T - CHART_PAD_B;

  // Only plot points where kcal > 0 to skip unlogged days
  const points: { x: number; y: number; val: number }[] = [];
  data.forEach((val, i) => {
    if (val > 0) {
      const x = CHART_PAD_L + (i / Math.max(data.length - 1, 1)) * usableW;
      const y = CHART_PAD_T + usableH - ((val - minVal) / (maxVal - minVal)) * usableH;
      points.push({ x, y, val });
    }
  });

  // Smooth path
  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => {
        if (i === 0) return `M${p.x},${p.y}`;
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2;
        return `${acc} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
      }, '')
    : `M${points[0].x},${points[0].y}`;

  // Fill area
  const lastP = points[points.length - 1];
  const firstP = points[0];
  const fillD = `${pathD} L${lastP.x},${CHART_H - CHART_PAD_B} L${firstP.x},${CHART_H - CHART_PAD_B} Z`;

  // Y-axis labels
  const yLabels = [0, Math.round(maxVal / 2), Math.round(maxVal)];

  // Goal line Y
  const goalY = goalLine ? CHART_PAD_T + usableH - ((goalLine - minVal) / (maxVal - minVal)) * usableH : null;

  return (
    <View style={lc.wrap}>
      <Text style={lc.label}>{label}</Text>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <LinearGradient id={`grad_${label}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {/* Y-axis labels */}
        {yLabels.map((v, i) => {
          const y = CHART_PAD_T + usableH - (i / 2) * usableH;
          return (
            <React.Fragment key={i}>
              <SvgText x={CHART_PAD_L - 6} y={y + 4} fontSize={9} fill={DIM} textAnchor="end">{v}</SvgText>
              <Line x1={CHART_PAD_L} y1={y} x2={CHART_W - CHART_PAD_R} y2={y} stroke={DIM} strokeWidth={0.5} strokeDasharray="4,4" />
            </React.Fragment>
          );
        })}
        {/* Goal line */}
        {goalY != null && (
          <Line x1={CHART_PAD_L} y1={goalY} x2={CHART_W - CHART_PAD_R} y2={goalY} stroke={GOLD} strokeWidth={1} strokeDasharray="6,4" opacity={0.5} />
        )}
        {/* Fill area */}
        <Path d={fillD} fill={`url(#grad_${label})`} />
        {/* Line */}
        <Path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke={BG} strokeWidth={1.5} />
        ))}
      </Svg>
    </View>
  );
}

const lc = StyleSheet.create({
  wrap: { marginTop: 4 },
  label: { fontSize: 12, fontWeight: '600', color: MUTED, marginBottom: 6, marginLeft: 4 },
  empty: { height: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, color: DIM },
});

// ── Bar Chart for Weekly ─────────────────────────────────────────────────────
function WeekBar({ data, goal }: { data: DayEntry[]; goal: number }) {
  const maxVal = Math.max(...data.map(d => d.kcal), goal) * 1.1;
  return (
    <View style={bc.wrap}>
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.kcal / maxVal) * 100 : 0;
        const hit = d.kcal >= goal * 0.75;
        return (
          <View key={i} style={bc.col}>
            <View style={bc.track}>
              <View style={[bc.bar, { height: `${Math.max(3, pct)}%`, backgroundColor: d.kcal === 0 ? 'rgba(232,224,208,0.06)' : hit ? SAGE : GOLD }]} />
            </View>
            <Text style={[bc.dayLabel, d.day === 'Today' && { color: GOLD }]}>{d.day.slice(0, 1)}</Text>
            {d.kcal > 0 && <Text style={bc.valLabel}>{d.kcal}</Text>}
          </View>
        );
      })}
    </View>
  );
}

const bc = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 6, height: 120, alignItems: 'flex-end', marginTop: 8 },
  col: { flex: 1, alignItems: 'center' },
  track: { flex: 1, width: '100%', justifyContent: 'flex-end', borderRadius: 4, overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 4, minHeight: 3 },
  dayLabel: { fontSize: 10, color: DIM, marginTop: 4 },
  valLabel: { fontSize: 8, color: MUTED, marginTop: 1 },
});

// ── Macro Ring ───────────────────────────────────────────────────────────────
const RING_SIZE = 58;
function MacroRing({ value, target, color, label, unit }: {
  value: number; target: number; color: string; label: string; unit: string;
}) {
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  const r = 24; const stroke = 5;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  return (
    <View style={mr.wrap}>
      <View style={mr.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="none" stroke="rgba(232,224,208,0.06)" strokeWidth={stroke} />
          <Circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${circ}`} strokeDashoffset={dashOffset}
            strokeLinecap="round" rotation={-90} origin={`${RING_SIZE / 2},${RING_SIZE / 2}`}
          />
        </Svg>
        <Text style={mr.pctText}>{Math.round(pct * 100)}%</Text>
      </View>
      <Text style={mr.val}>{value}{unit}</Text>
      <Text style={mr.label}>{label}</Text>
    </View>
  );
}

const mr = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4, flex: 1 },
  ringWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  pctText: { position: 'absolute', fontSize: 12, fontWeight: '700', color: TEXT, textAlign: 'center' },
  val: { fontSize: 14, fontWeight: '700', color: TEXT, textAlign: 'center' },
  label: { fontSize: 10, color: DIM, textAlign: 'center' },
});

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function ProgressScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [range, setRange] = useState(7);
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async (days: number) => {
    setLoading(true);
    try {
      const res = await apiGet<HistoryData>(`/api/nutrition/history?days=${days}`);
      setData(res);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(range); }, [range, fetchHistory]);

  const goals = data?.goals ?? {
    calorie_goal: userProfile?.calorie_goal ?? 2000,
    protein_goal: userProfile?.protein_goal ?? 120,
    carbs_goal: userProfile?.carbs_goal ?? 250,
    fat_goal: userProfile?.fat_goal ?? 70,
  };
  const s_ = data?.summary;
  const days = data?.days ?? [];

  // Today's data (last entry)
  const today = days.length > 0 ? days[days.length - 1] : null;

  // Compute calorie adherence % (goal hit rate)
  const adherencePct = s_ && s_.daysLogged > 0
    ? Math.round((s_.goalHitDays / s_.daysLogged) * 100) : 0;

  // Data for line charts
  const calData = days.map(d => d.kcal);
  const proData = days.map(d => d.protein);
  const carbData = days.map(d => d.carbs);
  const fatData = days.map(d => d.fat);

  // Last 7 days for weekly bar chart
  const last7 = days.slice(-7);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={TEXT} />
          </TouchableOpacity>
          <Text style={s.title}>My Progress</Text>
        </View>

        {/* Range selector */}
        <View style={s.rangeRow}>
          {RANGES.map(r => (
            <TouchableOpacity
              key={r.value}
              style={[s.rangePill, range === r.value && s.rangePillActive]}
              onPress={() => setRange(r.value)}
              activeOpacity={0.75}
            >
              <Text style={[s.rangeText, range === r.value && s.rangeTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{ paddingVertical: 80, alignItems: 'center' }}>
            <ActivityIndicator color={GOLD} size="large" />
          </View>
        ) : (
          <>
            {/* ── Today's snapshot ── */}
            <View style={s.todayCard}>
              <Text style={s.todayLabel}>Today</Text>
              <View style={s.todayRow}>
                {[
                  { label: 'Calories', val: `${today?.kcal ?? 0}`, sub: `/ ${goals.calorie_goal}`, color: TEXT },
                  { label: 'Protein', val: `${today?.protein ?? 0}g`, sub: `/ ${goals.protein_goal}g`, color: CORAL },
                  { label: 'Carbs', val: `${today?.carbs ?? 0}g`, sub: `/ ${goals.carbs_goal}g`, color: GOLD },
                  { label: 'Fat', val: `${today?.fat ?? 0}g`, sub: `/ ${goals.fat_goal}g`, color: SAGE },
                ].map((item, i) => (
                  <React.Fragment key={item.label}>
                    {i > 0 && <View style={s.todayDiv} />}
                    <View style={s.todayItem}>
                      <Text style={[s.todayVal, { color: item.color }]}>{item.val}</Text>
                      <Text style={s.todaySub}>{item.sub}</Text>
                      <Text style={s.todayItemLabel}>{item.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* ── Summary stats ── */}
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Ionicons name="flame-outline" size={20} color={GOLD} />
                <Text style={s.statVal}>{s_?.streak ?? 0}</Text>
                <Text style={s.statLabel}>Day streak</Text>
              </View>
              <View style={s.statCard}>
                <Ionicons name="calendar-outline" size={20} color={SAGE} />
                <Text style={s.statVal}>{s_?.daysLogged ?? 0}<Text style={s.statSub}>/{s_?.daysInRange ?? range}</Text></Text>
                <Text style={s.statLabel}>Days logged</Text>
              </View>
              <View style={s.statCard}>
                <Ionicons name="checkmark-circle-outline" size={20} color={adherencePct >= 70 ? SAGE : CORAL} />
                <Text style={s.statVal}>{adherencePct}%</Text>
                <Text style={s.statLabel}>Goal hit rate</Text>
              </View>
            </View>

            {/* ── Averages with rings ── */}
            <View style={s.ringCard}>
              <Text style={s.cardTitle}>Daily averages</Text>
              <View style={s.ringRow}>
                <MacroRing value={s_?.avgCalories ?? 0} target={goals.calorie_goal} color={TEXT} label="Calories" unit="" />
                <MacroRing value={s_?.avgProtein ?? 0} target={goals.protein_goal} color={CORAL} label="Protein" unit="g" />
                <MacroRing value={s_?.avgCarbs ?? 0} target={goals.carbs_goal} color={GOLD} label="Carbs" unit="g" />
                <MacroRing value={s_?.avgFat ?? 0} target={goals.fat_goal} color={SAGE} label="Fat" unit="g" />
              </View>
            </View>

            {/* ── Weekly bar chart ── */}
            <View style={s.chartCard}>
              <Text style={s.cardTitle}>This week</Text>
              <WeekBar data={last7} goal={goals.calorie_goal} />
            </View>

            {/* ── Calorie trend line ── */}
            <View style={s.chartCard}>
              <Text style={s.cardTitle}>Calorie trend</Text>
              <LineChart data={calData} color={TEXT} label="kcal" goalLine={goals.calorie_goal} />
            </View>

            {/* ── Protein trend ── */}
            <View style={s.chartCard}>
              <Text style={s.cardTitle}>Protein trend</Text>
              <LineChart data={proData} color={CORAL} label="grams" goalLine={goals.protein_goal} />
            </View>

            {/* ── Carbs trend ── */}
            <View style={s.chartCard}>
              <Text style={s.cardTitle}>Carbs trend</Text>
              <LineChart data={carbData} color={GOLD} label="grams" goalLine={goals.carbs_goal} />
            </View>

            {/* ── Fat trend ── */}
            <View style={s.chartCard}>
              <Text style={s.cardTitle}>Fat trend</Text>
              <LineChart data={fatData} color={SAGE} label="grams" goalLine={goals.fat_goal} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: TEXT },

  rangeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  rangePill: { backgroundColor: CARD, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(232,224,208,0.1)' },
  rangePillActive: { backgroundColor: GOLD, borderColor: GOLD },
  rangeText: { fontSize: 13, color: MUTED },
  rangeTextActive: { color: BG, fontWeight: '700' },

  // Today card
  todayCard: { backgroundColor: CARD, borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  todayLabel: { fontSize: 11, fontWeight: '700', color: DIM, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  todayRow: { flexDirection: 'row' },
  todayDiv: { width: 1, backgroundColor: 'rgba(232,224,208,0.06)', marginVertical: 2 },
  todayItem: { flex: 1, alignItems: 'center' },
  todayVal: { fontSize: 18, fontWeight: '800' },
  todaySub: { fontSize: 10, color: DIM, marginTop: 1 },
  todayItemLabel: { fontSize: 10, color: MUTED, marginTop: 4 },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6 },
  statVal: { fontSize: 22, fontWeight: '800', color: TEXT },
  statSub: { fontSize: 14, fontWeight: '500', color: DIM },
  statLabel: { fontSize: 10, color: DIM },

  // Ring card
  ringCard: { backgroundColor: CARD, borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  ringRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: MUTED, letterSpacing: 0.5 },

  // Chart cards
  chartCard: { backgroundColor: CARD, borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12 },
});
