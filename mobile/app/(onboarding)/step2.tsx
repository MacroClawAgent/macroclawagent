import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";

const BG = "#1C1612";
const CARD = "#252018";
const GOLD = "#F5C842";
const CORAL = "#E07B54";
const SAGE = "#8B9E6E";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

const METABOLISM = [
  { id: "slow", label: "Slow", desc: "Gain weight easily, hard to lose", icon: "snow-outline", color: "#60A5FA" },
  { id: "normal", label: "Normal", desc: "Maintain weight without much effort", icon: "sunny-outline", color: GOLD },
  { id: "fast", label: "Fast", desc: "Hard to gain weight, burn fast", icon: "flame-outline", color: CORAL },
];

// Generate picker items
const KG_RANGE = Array.from({ length: 121 }, (_, i) => 40 + i); // 40-160
const LB_RANGE = Array.from({ length: 261 }, (_, i) => 90 + i); // 90-350
const CM_RANGE = Array.from({ length: 81 }, (_, i) => 140 + i); // 140-220
const FT_RANGE = [4, 5, 6, 7];
const IN_RANGE = Array.from({ length: 12 }, (_, i) => i); // 0-11

export default function OnboardingStep2() {
  const params = useLocalSearchParams<{ first_name: string; last_name: string; dob?: string; sport?: string }>();

  const [isMetric, setIsMetric] = useState(true);
  const [weightKg, setWeightKg] = useState(70);
  const [weightLb, setWeightLb] = useState(154);
  const [heightCm, setHeightCm] = useState(175);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [metabolism, setMetabolism] = useState("normal");

  function handleNext() {
    const wKg = isMetric ? weightKg : Math.round(weightLb * 0.453592);
    const hCm = isMetric ? heightCm : Math.round(heightFt * 30.48 + heightIn * 2.54);
    router.push({
      pathname: "/(onboarding)/step3",
      params: {
        first_name: params.first_name,
        last_name: params.last_name,
        dob: params.dob ?? "",
        sport: params.sport ?? "",
        weight_kg: String(wKg),
        height_cm: String(hCm),
        metabolism,
        unit: isMetric ? "metric" : "imperial",
      },
    });
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={24} color={TEXT_C} />
      </TouchableOpacity>

      {/* Progress */}
      <View style={s.progressRow}>
        <View style={[s.dot, s.dotDone]} />
        <View style={[s.line, s.lineDone]} />
        <View style={[s.dot, s.dotActive]} />
        <View style={s.line} />
        <View style={s.dot} />
        <View style={s.line} />
        <View style={s.dot} />
      </View>

      <Text style={s.step}>Step 2 of 4</Text>
      <Text style={s.title}>Your body</Text>
      <Text style={s.subtitle}>This helps Jonno calculate accurate nutrition targets.</Text>

      {/* Unit toggle */}
      <View style={s.toggleWrap}>
        <TouchableOpacity style={[s.toggleOpt, isMetric && s.toggleActive]} onPress={() => setIsMetric(true)} activeOpacity={0.7}>
          <Text style={[s.toggleText, isMetric && s.toggleTextActive]}>Metric</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.toggleOpt, !isMetric && s.toggleActive]} onPress={() => setIsMetric(false)} activeOpacity={0.7}>
          <Text style={[s.toggleText, !isMetric && s.toggleTextActive]}>Imperial</Text>
        </TouchableOpacity>
      </View>

      {/* Weight + Height side by side */}
      <View style={s.pickersRow}>
        {/* Weight */}
        <View style={s.pickerCol}>
          <Text style={s.label}>Weight</Text>
          <View style={s.pickerCard}>
            <Picker
              selectedValue={isMetric ? weightKg : weightLb}
              onValueChange={(v: number) => isMetric ? setWeightKg(v) : setWeightLb(v)}
              style={s.picker}
              itemStyle={s.pickerItem}
            >
              {(isMetric ? KG_RANGE : LB_RANGE).map(v => <Picker.Item key={v} label={`${v}`} value={v} />)}
            </Picker>
            <Text style={s.pickerUnit}>{isMetric ? "kg" : "lb"}</Text>
          </View>
        </View>

        {/* Height */}
        <View style={s.pickerCol}>
          <Text style={s.label}>Height</Text>
          <View style={s.pickerCard}>
            {isMetric ? (
              <>
                <Picker
                  selectedValue={heightCm}
                  onValueChange={setHeightCm}
                  style={s.picker}
                  itemStyle={s.pickerItem}
                >
                  {CM_RANGE.map(v => <Picker.Item key={v} label={`${v}`} value={v} />)}
                </Picker>
                <Text style={s.pickerUnit}>cm</Text>
              </>
            ) : (
              <>
                <Picker
                  selectedValue={heightFt}
                  onValueChange={setHeightFt}
                  style={[s.picker, { flex: 1 }]}
                  itemStyle={s.pickerItemSmall}
                >
                  {FT_RANGE.map(v => <Picker.Item key={v} label={`${v}'`} value={v} />)}
                </Picker>
                <Picker
                  selectedValue={heightIn}
                  onValueChange={setHeightIn}
                  style={[s.picker, { flex: 1 }]}
                  itemStyle={s.pickerItemSmall}
                >
                  {IN_RANGE.map(v => <Picker.Item key={v} label={`${v}"`} value={v} />)}
                </Picker>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Metabolism */}
      <View style={{ marginBottom: 10, gap: 6 }}>
        <Text style={s.label}>Metabolism</Text>
        <View style={{ gap: 6 }}>
          {METABOLISM.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[s.metaCard, metabolism === m.id && s.metaCardActive]}
              onPress={() => setMetabolism(m.id)}
              activeOpacity={0.75}
            >
              <View style={[s.metaIcon, { backgroundColor: m.color + "15" }]}>
                <Ionicons name={m.icon as any} size={18} color={m.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.metaLabel, metabolism === m.id && { color: TEXT_C }]}>{m.label}</Text>
                <Text style={s.metaDesc}>{m.desc}</Text>
              </View>
              {metabolism === m.id && <Ionicons name="checkmark-circle" size={20} color={GOLD} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={s.btn} onPress={handleNext} activeOpacity={0.85}>
        <Text style={s.btnText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(232,224,208,0.1)" },
  dotActive: { backgroundColor: GOLD },
  dotDone: { backgroundColor: GOLD },
  line: { flex: 1, height: 2, backgroundColor: "rgba(232,224,208,0.1)", marginHorizontal: 6 },
  lineDone: { backgroundColor: GOLD },
  step: { fontSize: 12, fontWeight: "600", color: GOLD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: TEXT_C, marginBottom: 8 },
  subtitle: { fontSize: 15, color: MUTED, marginBottom: 24, lineHeight: 22 },

  toggleWrap: { flexDirection: "row", backgroundColor: "rgba(232,224,208,0.06)", borderRadius: 12, padding: 3, marginBottom: 20 },
  toggleOpt: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  toggleActive: { backgroundColor: CARD },
  toggleText: { fontSize: 14, fontWeight: "600", color: DIM },
  toggleTextActive: { color: TEXT_C },

  pickersRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  pickerCol: { flex: 1, gap: 8 },
  label: { fontSize: 12, fontWeight: "600", color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  pickerCard: {
    backgroundColor: "rgba(232,224,208,0.04)", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.08)", overflow: "hidden",
    flexDirection: "row", alignItems: "center",
  },
  picker: { flex: 1, height: 120, color: TEXT_C },
  pickerItem: { fontSize: 20, fontWeight: "700", color: TEXT_C, height: 120 },
  pickerItemSmall: { fontSize: 18, fontWeight: "700", color: TEXT_C, height: 120 },
  pickerUnit: { fontSize: 14, fontWeight: "600", color: MUTED, paddingRight: 12 },

  metaCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(232,224,208,0.04)", borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.08)", padding: 11,
  },
  metaCardActive: { borderColor: GOLD, backgroundColor: "rgba(245,200,66,0.06)" },
  metaIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  metaLabel: { fontSize: 15, fontWeight: "700", color: MUTED },
  metaDesc: { fontSize: 12, color: DIM, marginTop: 1 },

  btn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: BG, fontWeight: "800", fontSize: 16 },
});
