import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BG = '#1C1612';
const TEXT = '#E8E0D0';
const GOLD = '#F5C842';
const DIM = 'rgba(232,224,208,0.25)';
const MUTED = 'rgba(232,224,208,0.5)';

export default function PrepGuideScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={s.title}>Prep Guide</Text>
      </View>
      <View style={s.center}>
        <View style={s.iconWrap}>
          <Ionicons name="cube-outline" size={40} color={GOLD} />
        </View>
        <Text style={s.heading}>Coming Soon</Text>
        <Text style={s.sub}>
          Jonno will generate a weekly prep guide based on your meal plan — batch cook times, storage tips, and shopping order.
        </Text>
        <TouchableOpacity style={s.btn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={s.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: TEXT },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, gap: 12 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245,200,66,0.1)', borderWidth: 1, borderColor: 'rgba(245,200,66,0.2)',
  },
  heading: { fontSize: 22, fontWeight: '800', color: TEXT },
  sub: { fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 21 },
  btn: { backgroundColor: GOLD, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  btnText: { color: BG, fontWeight: '700', fontSize: 15 },
});
