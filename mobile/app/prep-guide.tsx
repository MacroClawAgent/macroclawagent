import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#1C1612';
const CARD = '#252018';
const TEXT = '#E8E0D0';
const GOLD = '#F5C842';
const SAGE = '#8B9E6E';
const MUTED = 'rgba(232,224,208,0.5)';
const DIM = 'rgba(232,224,208,0.3)';

const MOCK_STEPS = [
  { step: 1, title: 'Cook 800g chicken breast', usedIn: 'Mon lunch, Wed dinner, Fri lunch', method: 'Season with salt, pepper, garlic. Pan fry 6-7min each side.', time: '~20 min' },
  { step: 2, title: 'Batch cook 600g jasmine rice', usedIn: 'Mon, Wed, Thu meals', method: 'Rinse well. 1:1.5 ratio water. 15min covered.', time: '~20 min' },
  { step: 3, title: 'Hard boil 12 eggs', usedIn: 'Daily breakfast + snacks', method: 'Boiling water, 10 min, ice bath.', time: '~12 min' },
  { step: 4, title: 'Portion Greek yogurt', usedIn: 'Breakfast parfaits (5x)', method: 'Divide 1kg tub into 5 containers. 200g each.', time: '~5 min' },
  { step: 5, title: 'Chop vegetables', usedIn: 'All dinners this week', method: 'Broccoli, capsicum, zucchini. Store in airtight containers.', time: '~15 min' },
];

const STORAGE_TIPS = [
  '🧊 Cooked chicken: fridge 4 days, freezer 3 months',
  '🍚 Cooked rice: fridge 5 days — reheat with splash of water',
  '🥚 Hard boiled eggs: fridge 7 days — keep shells on',
];

export default function PrepGuideScreen() {
  const router = useRouter();
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('jonno_meal_plan')
      .then(raw => { if (raw) setHasPlan(true); })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={TEXT} />
          </TouchableOpacity>
          <Text style={s.title}>Prep Guide</Text>
        </View>

        {!hasPlan ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>📦</Text>
            <Text style={s.emptyTitle}>No plan to prep yet</Text>
            <Text style={s.emptySub}>
              Generate a week's meal plan in the Agent tab, then come back here for your prep guide
            </Text>
            <TouchableOpacity style={s.ctaBtn} onPress={() => router.push('/(tabs)/agent' as any)} activeOpacity={0.85}>
              <Text style={s.ctaBtnText}>Go to Agent →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Hero card */}
            <LinearGradient colors={[CARD, BG]} style={s.heroCard}>
              <Text style={s.heroTitle}>📦 Sunday Prep Guide</Text>
              <Text style={s.heroSub}>Based on your week's plan</Text>
              <View style={s.heroStats}>
                {[
                  { value: '~90 min', label: 'total' },
                  { value: '5 meals', label: 'worth' },
                  { value: 'Saves 4hrs', label: 'this week' },
                ].map(st => (
                  <View key={st.label} style={s.heroStat}>
                    <Text style={s.heroStatValue}>{st.value}</Text>
                    <Text style={s.heroStatLabel}>{st.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.heroTip}>💡 Prep in this order to save time</Text>
            </LinearGradient>

            {/* Prep steps */}
            <Text style={s.sectionHeader}>WHAT TO PREP</Text>
            {MOCK_STEPS.map(step => (
              <View key={step.step} style={s.stepCard}>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{step.step}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepUsedIn}>Used in: {step.usedIn}</Text>
                  <Text style={s.stepMethod}>{step.method}</Text>
                </View>
                <View style={s.timeBadge}>
                  <Text style={s.timeBadgeText}>{step.time}</Text>
                </View>
              </View>
            ))}

            {/* Storage tips */}
            <Text style={s.sectionHeader}>STORAGE TIPS</Text>
            <View style={s.tipsCard}>
              {STORAGE_TIPS.map((tip, i) => (
                <View key={i} style={[s.tipRow, i < STORAGE_TIPS.length - 1 && s.tipDivider]}>
                  <Text style={s.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            {/* Cart link */}
            <TouchableOpacity style={s.cartLink} onPress={() => router.push('/(tabs)/cart' as any)} activeOpacity={0.75}>
              <Text style={s.cartLinkText}>View my shopping list →</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: TEXT },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginTop: 12 },
  emptySub: { fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  ctaBtn: { backgroundColor: GOLD, borderRadius: 22, paddingVertical: 14, paddingHorizontal: 28, marginTop: 24 },
  ctaBtnText: { color: BG, fontWeight: '700', fontSize: 15 },

  heroCard: { marginHorizontal: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(139,158,110,0.2)' },
  heroTitle: { fontSize: 18, fontWeight: '800', color: TEXT },
  heroSub: { fontSize: 12, color: 'rgba(232,224,208,0.45)', marginTop: 2 },
  heroStats: { flexDirection: 'row', marginTop: 14, gap: 16 },
  heroStat: { alignItems: 'center' },
  heroStatValue: { fontSize: 14, fontWeight: '700', color: GOLD },
  heroStatLabel: { fontSize: 10, color: DIM, marginTop: 2 },
  heroTip: { fontSize: 12, color: 'rgba(248,213,97,0.7)', marginTop: 12 },

  sectionHeader: { fontSize: 11, fontWeight: '700', color: 'rgba(232,224,208,0.4)', letterSpacing: 1.2, marginLeft: 20, marginTop: 20, marginBottom: 10 },

  stepCard: { flexDirection: 'row', gap: 12, backgroundColor: CARD, borderRadius: 16, marginHorizontal: 16, marginBottom: 8, padding: 14, borderWidth: 1, borderColor: 'rgba(232,224,208,0.06)' },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(248,213,97,0.12)', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 13, fontWeight: '700', color: GOLD },
  stepTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  stepUsedIn: { fontSize: 12, color: MUTED, marginTop: 2 },
  stepMethod: { fontSize: 12, color: 'rgba(232,224,208,0.4)', marginTop: 2 },
  timeBadge: { backgroundColor: 'rgba(232,224,208,0.06)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  timeBadgeText: { fontSize: 11, color: 'rgba(232,224,208,0.4)' },

  tipsCard: { backgroundColor: CARD, borderRadius: 16, marginHorizontal: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(232,224,208,0.06)' },
  tipRow: { paddingVertical: 10 },
  tipDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(232,224,208,0.06)' },
  tipText: { fontSize: 12, color: MUTED, lineHeight: 18 },

  cartLink: { marginHorizontal: 16, marginTop: 16, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,213,97,0.25)', paddingVertical: 14, alignItems: 'center' },
  cartLinkText: { fontSize: 14, fontWeight: '600', color: GOLD },
});
