import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const BG = '#1C1612';
const CARD = '#252018';
const TEXT = '#E8E0D0';
const GOLD = '#F5C842';
const CORAL = '#E07B54';
const SAGE = '#8B9E6E';
const MUTED = 'rgba(232,224,208,0.5)';
const DIM = 'rgba(232,224,208,0.3)';

const RANGES = ['7 days', '30 days', '3 months'];

const MOCK_INSIGHTS = [
  { color: '#F59E0B', icon: 'warning-outline' as const, title: 'Weekend nutrition dips', body: 'Your calorie intake drops 40% on Saturdays and Sundays. Consider planning weekend meals in advance.', action: 'Plan my weekend' },
  { color: '#22C55E', icon: 'trending-up-outline' as const, title: 'Protein streak', body: "You've hit your protein target 5 days in a row — your best streak yet.", action: null },
  { color: '#8B5CF6', icon: 'repeat-outline' as const, title: 'Favourite meal pattern', body: 'You log Chicken Rice Bowl 3x per week. Want Jonno to add variety to your lunch rotation?', action: 'Mix up my lunches' },
];

const MOCK_WEEK = [65, 88, 72, 95, 0, 0, 78];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function barColor(pct: number) {
  if (pct >= 90) return SAGE;
  if (pct >= 50) return GOLD;
  return 'rgba(232,224,208,0.1)';
}

export default function ProgressScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [range, setRange] = useState('7 days');

  const goals = {
    calories: userProfile?.calorie_goal ?? 2000,
    protein: userProfile?.protein_goal ?? 120,
    carbs: userProfile?.carbs_goal ?? 250,
    fat: userProfile?.fat_goal ?? 70,
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity key={r} style={[s.rangePill, range === r && s.rangePillActive]} onPress={() => setRange(r)} activeOpacity={0.75}>
              <Text style={[s.rangeText, range === r && s.rangeTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's summary */}
        <View style={s.summaryCard}>
          {[
            { label: 'Calories', value: `0/${goals.calories}`, color: TEXT },
            { label: 'Protein', value: `0g`, color: CORAL },
            { label: 'Carbs', value: `0g`, color: GOLD },
            { label: 'Fat', value: `0g`, color: SAGE },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <View style={s.divider} />}
              <View style={s.summaryItem}>
                <Text style={[s.summaryValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={s.summaryLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Jonno Noticed */}
        <Text style={s.sectionTitle}>✦ Jonno Noticed</Text>
        {MOCK_INSIGHTS.map((ins, i) => (
          <View key={i} style={[s.insightCard, { borderLeftColor: ins.color }]}>
            <Ionicons name={ins.icon} size={18} color={ins.color} style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.insightTitle}>{ins.title}</Text>
              <Text style={s.insightBody}>{ins.body}</Text>
              {ins.action && (
                <TouchableOpacity style={s.insightAction} onPress={() => router.push('/(tabs)/agent' as any)} activeOpacity={0.75}>
                  <Text style={s.insightActionText}>{ins.action}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Streak */}
        <View style={s.streakCard}>
          <Text style={{ fontSize: 36 }}>🔥</Text>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={s.streakNum}>12</Text>
              <Text style={s.streakLabel}> days</Text>
            </View>
            <Text style={s.streakSub}>Logging streak</Text>
            <Text style={s.streakBest}>Personal best: 18 days</Text>
          </View>
          <View style={s.streakDots}>
            {[1,1,1,1,1,0,0].map((filled, i) => (
              <View key={i} style={[s.streakDot, filled ? s.streakDotFilled : s.streakDotEmpty]} />
            ))}
          </View>
        </View>

        {/* Weekly chart */}
        <Text style={s.chartLabel}>This week's calorie goal</Text>
        <View style={s.chartCard}>
          <View style={s.chartBars}>
            {MOCK_WEEK.map((pct, i) => (
              <View key={i} style={s.barCol}>
                <View style={s.barTrack}>
                  <View style={[s.bar, { height: `${Math.max(5, pct)}%`, backgroundColor: barColor(pct) }]} />
                </View>
                <Text style={s.barDay}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: TEXT },

  rangeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  rangePill: { backgroundColor: CARD, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(232,224,208,0.1)' },
  rangePillActive: { backgroundColor: GOLD, borderColor: GOLD },
  rangeText: { fontSize: 13, color: MUTED },
  rangeTextActive: { color: BG, fontWeight: '700' },

  summaryCard: { flexDirection: 'row', backgroundColor: CARD, borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  summaryLabel: { fontSize: 10, color: DIM, marginTop: 2 },
  divider: { width: 1, backgroundColor: 'rgba(232,224,208,0.08)', marginVertical: 2 },

  sectionTitle: { fontSize: 14, fontWeight: '600', color: GOLD, marginLeft: 20, marginBottom: 10, marginTop: 8 },

  insightCard: { flexDirection: 'row', gap: 10, backgroundColor: CARD, borderRadius: 16, borderLeftWidth: 3, padding: 14, marginHorizontal: 16, marginBottom: 8 },
  insightTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  insightBody: { fontSize: 12, color: MUTED, lineHeight: 18, marginTop: 4 },
  insightAction: { marginTop: 8, backgroundColor: 'rgba(248,213,97,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248,213,97,0.2)', paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' },
  insightActionText: { fontSize: 12, fontWeight: '600', color: GOLD },

  streakCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(248,213,97,0.06)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(248,213,97,0.15)', padding: 20, marginHorizontal: 16, marginTop: 4, marginBottom: 16 },
  streakNum: { fontSize: 32, fontWeight: '800', color: GOLD },
  streakLabel: { fontSize: 16, color: MUTED },
  streakSub: { fontSize: 13, color: MUTED, marginTop: 2 },
  streakBest: { fontSize: 11, color: DIM, marginTop: 2 },
  streakDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  streakDot: { width: 8, height: 8, borderRadius: 4 },
  streakDotFilled: { backgroundColor: GOLD },
  streakDotEmpty: { backgroundColor: 'transparent', borderWidth: 1, borderColor: DIM },

  chartLabel: { fontSize: 13, fontWeight: '600', color: MUTED, marginLeft: 20, marginBottom: 10 },
  chartCard: { backgroundColor: CARD, borderRadius: 20, padding: 16, marginHorizontal: 16 },
  chartBars: { flexDirection: 'row', gap: 8, height: 100, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barDay: { fontSize: 10, color: DIM, marginTop: 6, textAlign: 'center' },
});
