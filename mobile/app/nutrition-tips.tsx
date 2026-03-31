import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#1C1612';
const CARD = '#252018';
const TEXT = '#E8E0D0';
const GOLD = '#F5C842';
const MUTED = 'rgba(232,224,208,0.5)';
const DIM = 'rgba(232,224,208,0.3)';

const TIPS_READ_KEY = 'jonno_tip_reads';

interface Tip {
  id: string;
  category: string;
  categoryColor: string;
  emoji: string;
  title: string;
  body: string;
  relevantTo: string;
  actionLabel: string | null;
  actionScreen: string | null;
}

const MOCK_TIPS: Tip[] = [
  { id: '1', category: 'Recovery', categoryColor: '#8B9E6E', emoji: '💪', title: 'Post-workout protein timing', body: 'You trained legs yesterday. Your muscles are repairing right now. Getting 40g+ protein within 2 hours of waking accelerates recovery by up to 25%. Your breakfast target today: 40g protein minimum.', relevantTo: "Yesterday's leg session", actionLabel: 'Plan high-protein breakfast', actionScreen: '/(tabs)/agent' },
  { id: '2', category: 'Goal', categoryColor: '#F5C842', emoji: '🎯', title: "You're close to your protein streak", body: "You've hit your 191g protein target 4 days in a row. Hit it again today and tomorrow for your best streak ever (currently 12 days).", relevantTo: 'Your protein goal', actionLabel: null, actionScreen: null },
  { id: '3', category: 'Nutrition', categoryColor: '#E07B54', emoji: '🥑', title: 'Why fat matters for muscle building', body: 'Your fat intake has been below target (avg 45g vs 70g goal). Dietary fat is essential for testosterone production — the key hormone for muscle growth. Add avocado, olive oil, or a handful of almonds to hit your target.', relevantTo: 'Your Build Muscle goal', actionLabel: 'Add fats to my plan', actionScreen: '/(tabs)/agent' },
  { id: '4', category: 'Timing', categoryColor: '#F5C842', emoji: '⏰', title: 'Eating window matters', body: 'You tend to log most calories after 6pm. Front-loading calories earlier in the day (especially protein at breakfast) improves energy, reduces evening cravings, and supports better sleep.', relevantTo: 'Your logging pattern', actionLabel: null, actionScreen: null },
  { id: '5', category: 'Shopping', categoryColor: '#8B9E6E', emoji: '🛒', title: 'Buy in bulk to hit protein goals cheaper', body: 'Chicken breast is the most efficient protein source at $11/kg from Coles. Buying 1.5kg at once covers 3-4 meals and costs less per gram of protein than most alternatives.', relevantTo: 'Your budget preference', actionLabel: 'Add to Smart Cart', actionScreen: '/(tabs)/cart' },
];

export default function NutritionTipsScreen() {
  const router = useRouter();
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(TIPS_READ_KEY)
      .then(raw => { if (raw) setReadIds(JSON.parse(raw)); })
      .catch(() => {});
  }, []);

  // Mark tips as read after 2s
  useEffect(() => {
    const unread = MOCK_TIPS.filter(t => !readIds.includes(t.id)).map(t => t.id);
    if (unread.length === 0) return;
    const timer = setTimeout(() => {
      const updated = [...new Set([...readIds, ...unread])];
      setReadIds(updated);
      AsyncStorage.setItem(TIPS_READ_KEY, JSON.stringify(updated)).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [readIds]);

  const markAllRead = () => {
    const all = MOCK_TIPS.map(t => t.id);
    setReadIds(all);
    AsyncStorage.setItem(TIPS_READ_KEY, JSON.stringify(all)).catch(() => {});
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={TEXT} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.title}>Nutrition Tips</Text>
            <Text style={s.subtitle}>Personalised to your goals + activity</Text>
          </View>
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <Text style={s.markRead}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Tips list */}
        {MOCK_TIPS.map(tip => {
          const isNew = !readIds.includes(tip.id);
          return (
            <View key={tip.id} style={[s.card, isNew && s.cardNew]}>
              {/* Top row */}
              <View style={s.topRow}>
                <View style={[s.catPill, { backgroundColor: tip.categoryColor + '1F' }]}>
                  <Text style={[s.catText, { color: tip.categoryColor }]}>{tip.category}</Text>
                </View>
                <Text style={s.relevantTo} numberOfLines={1}>Relevant to: {tip.relevantTo}</Text>
                {isNew && (
                  <View style={s.newBadge}>
                    <Text style={s.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <View style={s.titleRow}>
                <Text style={s.tipEmoji}>{tip.emoji}</Text>
                <Text style={s.tipTitle}>{tip.title}</Text>
              </View>

              {/* Body */}
              <Text style={s.tipBody}>{tip.body}</Text>

              {/* Action */}
              {tip.actionLabel && (
                <TouchableOpacity
                  style={s.actionBtn}
                  onPress={() => router.push(tip.actionScreen as any)}
                  activeOpacity={0.75}
                >
                  <Text style={s.actionText}>{tip.actionLabel}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: TEXT },
  subtitle: { fontSize: 12, color: MUTED, marginTop: 2 },
  markRead: { fontSize: 12, color: DIM },

  card: { backgroundColor: CARD, borderRadius: 20, marginHorizontal: 16, marginBottom: 10, padding: 18, borderWidth: 1, borderColor: 'rgba(232,224,208,0.06)' },
  cardNew: { borderColor: 'rgba(248,213,97,0.2)' },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catPill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { fontSize: 11, fontWeight: '700' },
  relevantTo: { flex: 1, fontSize: 10, color: DIM, textAlign: 'right' },
  newBadge: { backgroundColor: 'rgba(248,213,97,0.15)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  newBadgeText: { fontSize: 10, fontWeight: '700', color: GOLD },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  tipEmoji: { fontSize: 20 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: TEXT, flex: 1 },

  tipBody: { fontSize: 13, color: 'rgba(232,224,208,0.6)', lineHeight: 20, marginTop: 8 },

  actionBtn: { marginTop: 12, backgroundColor: 'rgba(248,213,97,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248,213,97,0.2)', paddingVertical: 10, paddingHorizontal: 14, alignSelf: 'flex-start' },
  actionText: { fontSize: 13, fontWeight: '600', color: GOLD },
});
