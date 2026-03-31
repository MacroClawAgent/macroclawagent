import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { UserPreferences } from '@/types/preferences';

const STEPS_TODAY = [
  'Analysing your nutrition targets…',
  'Applying your dietary preferences…',
  'Selecting Australian ingredients…',
  'Balancing macros across meals…',
  'Writing your recipe steps…',
  'Finalising your plan…',
];

const STEPS_WEEK = [
  'Analysing your goals…',
  'Planning 7 days of variety…',
  'Rotating protein sources…',
  'Balancing weekly macros…',
  'Applying your preferences…',
  'Generating recipes…',
  'Finalising your weekly plan…',
];

const STEPS_SINGLE = [
  'Checking your remaining macros…',
  'Picking the best option right now…',
  'Matching your pantry items…',
  'Crafting the perfect meal…',
];

interface Props {
  type: 'today' | 'week' | 'single';
  preferences: UserPreferences;
}

export default function GeneratingLoader({ type, preferences }: Props) {
  const steps   = type === 'week' ? STEPS_WEEK : type === 'single' ? STEPS_SINGLE : STEPS_TODAY;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [stepIndex, setStepIndex] = React.useState(0);

  useEffect(() => {
    // Spin the icon
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ).start();

    // Fade in
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Cycle through step labels
    const interval = setInterval(() => {
      setStepIndex(i => (i + 1) % steps.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const planLabel = type === 'today' ? "Today's Meals" : 'This Week';
  const dietLabel = preferences.dietaryRequirement !== 'none'
    ? ` · ${preferences.dietaryRequirement.charAt(0).toUpperCase() + preferences.dietaryRequirement.slice(1)}`
    : '';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Animated.View style={[s.container, { opacity: fadeAnim }]}>
        {/* Spinning icon */}
        <LinearGradient colors={['#E07B54', '#F5C842']} style={s.iconWrap}>
          <Animated.Text style={[s.iconText, { transform: [{ rotate: spin }] }]}>✦</Animated.Text>
        </LinearGradient>

        <Text style={s.title}>Building {planLabel}</Text>
        <Text style={s.subtitle}>
          2984 cal · 191g protein{dietLabel}
        </Text>

        {/* Animated step text */}
        <View style={s.stepBox}>
          <Text style={s.stepText}>{steps[stepIndex]}</Text>
        </View>

        {/* Progress dots */}
        <View style={s.dots}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[s.dot, i === stepIndex && s.dotActive, i < stepIndex && s.dotDone]}
            />
          ))}
        </View>

        <Text style={s.footnote}>
          Jonno is personalising this just for you
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#1C1612' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 },

  iconWrap:  { width: 80, height: 80, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: '#E07B54', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  iconText:  { fontSize: 38, color: '#1C1612' },

  title:    { fontSize: 24, fontWeight: '800', color: '#E8E0D0', textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(232,224,208,0.5)', textAlign: 'center', marginTop: -4 },

  stepBox:  { backgroundColor: '#252018', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(248,213,97,0.12)', minWidth: 260, alignItems: 'center' },
  stepText: { fontSize: 14, color: '#F5C842', fontWeight: '600', textAlign: 'center' },

  dots:     { flexDirection: 'row', gap: 6 },
  dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(232,224,208,0.15)' },
  dotActive:{ backgroundColor: '#F5C842', width: 18 },
  dotDone:  { backgroundColor: 'rgba(248,213,97,0.3)' },

  footnote: { fontSize: 12, color: 'rgba(232,224,208,0.4)', textAlign: 'center', marginTop: 8 },
});
